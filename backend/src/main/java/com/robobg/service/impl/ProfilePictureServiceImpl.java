package com.robobg.service.impl;

import com.robobg.dtos.UserDTO.CurrentUserDTO;
import com.robobg.entity.User;
import com.robobg.repository.UserRepository;
import com.robobg.service.ProfilePictureService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ProfilePictureServiceImpl implements ProfilePictureService {

    @Value("${domain}")
    private String domain;
    @Value("${web.protocol}")
    private String webProtocol;
    private final UserRepository userRepository;
    private final ImageService imageService;

    public ProfilePictureServiceImpl(UserRepository userRepository, ImageService imageService) {
        this.userRepository = userRepository;
        this.imageService = imageService;
    }

    private String buildFullImageUrl(String image) {
        if (image == null || image.startsWith("http")) {
            return image;
        }
        return webProtocol+"://api."+domain+"/files" + "/" + image;
    }

    private CurrentUserDTO toDTO(User user) {
        return new CurrentUserDTO(user.getUsername(), buildFullImageUrl(user.getProfilePicture()));
    }

    @Override
    public CurrentUserDTO getCurrentUser(User user) {
        return toDTO(user);
    }

    @Override
    @Transactional
    public CurrentUserDTO uploadProfilePicture(User user, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Empty file");
        }

        // Store the new file before deleting the old one, so a bad upload keeps the current picture
        String oldPicture = user.getProfilePicture();
        user.setProfilePicture(imageService.storeProfilePicture(user.getId(), file));
        userRepository.save(user);
        imageService.deleteImage(oldPicture);

        return toDTO(user);
    }

    @Override
    @Transactional
    public CurrentUserDTO deleteProfilePicture(User user) {
        String oldPicture = user.getProfilePicture();
        user.setProfilePicture(null);
        userRepository.save(user);
        imageService.deleteImage(oldPicture);

        return toDTO(user);
    }
}
