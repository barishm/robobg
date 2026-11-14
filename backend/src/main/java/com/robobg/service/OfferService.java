package com.robobg.service;

import com.robobg.dtos.OfferDTO.OfferDTO;
import com.robobg.entity.User;
import com.robobg.exceptions.EntityNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface OfferService {

    List<OfferDTO> getAllOffers();

    OfferDTO createOffer(String text, String linkUrl, String linkTitle, MultipartFile linkImage, User author) throws IOException;

    OfferDTO updateOffer(Long id, String text, String linkUrl, String linkTitle, MultipartFile linkImage, boolean removeLinkImage) throws IOException;

    void deleteOffer(Long id) throws EntityNotFoundException;
}
