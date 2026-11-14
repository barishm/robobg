package com.robobg.service;

import com.robobg.dtos.UserDTO.CurrentUserDTO;
import com.robobg.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ProfilePictureService {

    CurrentUserDTO getCurrentUser(User user);

    CurrentUserDTO uploadProfilePicture(User user, MultipartFile file) throws IOException;

    CurrentUserDTO deleteProfilePicture(User user);
}
