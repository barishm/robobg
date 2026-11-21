package com.robobg.service.impl;

import com.robobg.dtos.OfferDTO.OfferAuthorDTO;
import com.robobg.dtos.OfferDTO.OfferCategoryDTO;
import com.robobg.dtos.OfferDTO.OfferDTO;
import com.robobg.dtos.OfferDTO.OfferLinkDTO;
import com.robobg.dtos.OfferDTO.OfferPageDTO;
import com.robobg.entity.Offer;
import com.robobg.entity.OfferCategory;
import com.robobg.entity.User;
import com.robobg.exceptions.EntityNotFoundException;
import com.robobg.repository.OfferCategoryRepository;
import com.robobg.repository.OfferRepository;
import com.robobg.service.OfferService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OfferServiceImpl implements OfferService {

    private static final int MAX_TEXT_LENGTH = 10000;
    private static final int MAX_URL_LENGTH = 2048;
    private static final int MAX_TITLE_LENGTH = 255;
    private static final int MAX_PAGE_SIZE = 50;

    @Value("${domain}")
    private String domain;
    @Value("${web.protocol}")
    private String webProtocol;
    private static final Logger logger = LoggerFactory.getLogger(OfferServiceImpl.class);

    private final OfferRepository offerRepository;
    private final OfferCategoryRepository offerCategoryRepository;
    private final ImageService imageService;

    public OfferServiceImpl(OfferRepository offerRepository, OfferCategoryRepository offerCategoryRepository, ImageService imageService) {
        this.offerRepository = offerRepository;
        this.offerCategoryRepository = offerCategoryRepository;
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
    public OfferPageDTO getOffers(int page, int size, Collection<String> categories) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        // id as a tie-breaker keeps the order stable between pages
        Sort sort = Sort.by(Sort.Order.desc("createTime"), Sort.Order.desc("id"));
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, sort);

        Set<String> normalizedCategories = categories == null ? Set.of() : categories.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(name -> name.startsWith("#") ? name.substring(1) : name)
                .filter(name -> !name.isEmpty())
                .map(OfferHashtags::normalize)
                .collect(Collectors.toSet());

        Page<Offer> result = normalizedCategories.isEmpty()
                ? offerRepository.findAll(pageRequest)
                : offerRepository.findByAnyCategory(normalizedCategories, pageRequest);
        return new OfferPageDTO(
                result.getContent().stream().map(this::toDTO).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Override
    public List<OfferCategoryDTO> getCategories() {
        return offerCategoryRepository.findAllWithOfferCounts();
    }

    // Sets the offer's categories to the hashtags in its text, reusing
    // existing categories (case-insensitive) and creating the new ones.
    private void syncCategories(Offer offer) {
        Map<String, String> tags = OfferHashtags.extract(offer.getText());
        Map<String, OfferCategory> existing = tags.isEmpty() ? Map.of() :
                offerCategoryRepository.findByNormalizedNameIn(tags.keySet()).stream()
                        .collect(Collectors.toMap(OfferCategory::getNormalizedName, Function.identity()));

        Set<OfferCategory> categories = new HashSet<>();
        tags.forEach((normalized, name) -> categories.add(
                existing.containsKey(normalized)
                        ? existing.get(normalized)
                        : offerCategoryRepository.save(new OfferCategory(name, normalized))));

        offer.getCategories().clear();
        offer.getCategories().addAll(categories);
    }

    // Offers saved before categories existed get theirs from their text on
    // startup. Cheap when everything is already in sync.
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncAllCategories() {
        List<Offer> offers = offerRepository.findAll();
        for (Offer offer : offers) {
            Set<String> before = offer.getCategories().stream()
                    .map(OfferCategory::getNormalizedName)
                    .collect(Collectors.toSet());
            if (!before.equals(OfferHashtags.extract(offer.getText()).keySet())) {
                syncCategories(offer);
                offerRepository.save(offer);
            }
        }
        int removed = offerCategoryRepository.deleteUnused();
        logger.info("Offer categories synced for {} offers ({} unused removed)", offers.size(), removed);
    }

    @Override
    public OfferDTO getOfferById(Long id) throws EntityNotFoundException {
        return offerRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Offer with ID " + id + " not found."));
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
        syncCategories(offer);
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
        syncCategories(offer);
        offerRepository.save(offer);
        offerCategoryRepository.deleteUnused();

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
        offerCategoryRepository.deleteUnused();
        imageService.deleteImage(offer.getLinkImage());
    }
}
