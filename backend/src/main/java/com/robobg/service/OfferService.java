package com.robobg.service;

import com.robobg.dtos.OfferDTO.OfferCategoryDTO;
import com.robobg.dtos.OfferDTO.OfferDTO;
import com.robobg.dtos.OfferDTO.OfferPageDTO;
import com.robobg.entity.User;
import com.robobg.exceptions.EntityNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

public interface OfferService {

    OfferPageDTO getOffers(int page, int size, Collection<String> categories);

    List<OfferCategoryDTO> getCategories();

    OfferDTO getOfferById(Long id) throws EntityNotFoundException;

    OfferDTO createOffer(String text, String linkUrl, String linkTitle, MultipartFile linkImage, User author) throws IOException;

    OfferDTO updateOffer(Long id, String text, String linkUrl, String linkTitle, MultipartFile linkImage, boolean removeLinkImage) throws IOException;

    void deleteOffer(Long id) throws EntityNotFoundException;
}
