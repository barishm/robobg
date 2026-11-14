package com.robobg.service.impl;

import com.robobg.dtos.OfferDTO.OfferAuthorDTO;
import com.robobg.dtos.OfferDTO.OfferDTO;
import com.robobg.dtos.OfferDTO.OfferLinkDTO;
import com.robobg.entity.Offer;
import com.robobg.entity.User;
import com.robobg.exceptions.EntityNotFoundException;
import com.robobg.repository.OfferRepository;
import com.robobg.service.OfferService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class OfferServiceImpl implements OfferService {

    private static final int MAX_TEXT_LENGTH = 10000;
    private static final int MAX_URL_LENGTH = 2048;
    private static final int MAX_TITLE_LENGTH = 255;

    @Value("${domain}")
    private String domain;
    @Value("${web.protocol}")
    private String webProtocol;
    private final OfferRepository offerRepository;
    private final ImageService imageService;

    public OfferServiceImpl(OfferRepository offerRepository, ImageService imageService) {
        this.offerRepository = offerRepository;
        this.imageService = imageService;
    }

    private String buildFullImageUrl(String image) {
        if (image == null || image.startsWith("http")) {
            return image;
        }
        return webProtocol+"://api."+domain+"/files" + "/" + image;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String normalizeUrl(String url) {
        if (url == null) {
            return null;
        }
        return url.matches("(?i)^https?://.*") ? url : "https://" + url;
    }

    private OfferDTO toDTO(Offer offer) {
        OfferDTO dto = new OfferDTO();
        dto.setId(offer.getId());
        dto.setText(offer.getText());
        dto.setCreatedAt(offer.getCreateTime().toInstant(ZoneOffset.UTC));
        if (offer.getLinkUrl() != null || offer.getLinkImage() != null) {
            dto.setLink(new OfferLinkDTO(offer.getLinkUrl(), offer.getLinkTitle(), buildFullImageUrl(offer.getLinkImage())));
        }
        if (offer.getAuthor() != null) {
            dto.setAuthor(new OfferAuthorDTO(offer.getAuthor().getUsername(), buildFullImageUrl(offer.getAuthor().getProfilePicture())));
        }
        return dto;
    }

    @Override
    public List<OfferDTO> getAllOffers() {
        return offerRepository.findAllByOrderByCreateTimeDesc().stream()
                .map(this::toDTO)
                .toList();
    }

    private static void validate(String text, String linkUrl, String linkTitle, boolean hasImage) {
        if (text == null && linkUrl == null && !hasImage) {
            throw new IllegalArgumentException("An offer needs text, a link or an image");
        }
        if (linkUrl == null && !hasImage && linkTitle != null) {
            throw new IllegalArgumentException("A link title needs a link URL or an image");
        }
        if (text != null && text.length() > MAX_TEXT_LENGTH) {
            throw new IllegalArgumentException("Offer text is too long (max " + MAX_TEXT_LENGTH + " characters)");
        }
        if (linkUrl != null && linkUrl.length() > MAX_URL_LENGTH) {
            throw new IllegalArgumentException("Link URL is too long (max " + MAX_URL_LENGTH + " characters)");
        }
        if (linkTitle != null && linkTitle.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("Link title is too long (max " + MAX_TITLE_LENGTH + " characters)");
        }
    }

    @Override
    // Roll back on IOException too, so a failed image write doesn't leave an offer without its image
    @Transactional(rollbackOn = Exception.class)
    public OfferDTO createOffer(String text, String linkUrl, String linkTitle, MultipartFile linkImage, User author) throws IOException {
        text = trimToNull(text);
        linkUrl = normalizeUrl(trimToNull(linkUrl));
        linkTitle = trimToNull(linkTitle);
        boolean hasImage = linkImage != null && !linkImage.isEmpty();
        validate(text, linkUrl, linkTitle, hasImage);

        Offer offer = new Offer();
        offer.setText(text);
        offer.setLinkUrl(linkUrl);
        offer.setLinkTitle(linkTitle);
        offer.setCreateTime(OffsetDateTime.now(ZoneOffset.UTC).toLocalDateTime());
        offer.setAuthor(author);
        offerRepository.save(offer);

        // Saved first so the image file name can include the offer id
        if (hasImage) {
            offer.setLinkImage(imageService.storeOfferImage(offer.getId(), linkImage));
            offerRepository.save(offer);
        }

        return toDTO(offer);
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public OfferDTO updateOffer(Long id, String text, String linkUrl, String linkTitle, MultipartFile linkImage, boolean removeLinkImage) throws IOException {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer with ID " + id + " not found."));

        text = trimToNull(text);
        linkUrl = normalizeUrl(trimToNull(linkUrl));
        linkTitle = trimToNull(linkTitle);
        boolean hasNewImage = linkImage != null && !linkImage.isEmpty();
        String oldImage = offer.getLinkImage();
        boolean keepsOldImage = !hasNewImage && !removeLinkImage && oldImage != null;
        validate(text, linkUrl, linkTitle, hasNewImage || keepsOldImage);

        // A new image replaces the old one; otherwise the old one is kept unless it was removed
        String newImage;
        if (hasNewImage) {
            newImage = imageService.storeOfferImage(offer.getId(), linkImage);
        } else if (keepsOldImage) {
            newImage = oldImage;
        } else {
            newImage = null;
        }

        offer.setText(text);
        offer.setLinkUrl(linkUrl);
        offer.setLinkTitle(linkTitle);
        offer.setLinkImage(newImage);
        offerRepository.save(offer);

        if (oldImage != null && !oldImage.equals(newImage)) {
            imageService.deleteImage(oldImage);
        }

        return toDTO(offer);
    }

    @Override
    @Transactional
    public void deleteOffer(Long id) throws EntityNotFoundException {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer with ID " + id + " not found."));

        offerRepository.delete(offer);
        imageService.deleteImage(offer.getLinkImage());
    }
}
