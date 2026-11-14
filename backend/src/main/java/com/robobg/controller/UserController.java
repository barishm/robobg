package com.robobg.controller;

import com.robobg.config.JwtService;
import com.robobg.dtos.QnaDTO.AnswerCreateDTO;
import com.robobg.dtos.QnaDTO.QuestionCreateDTO;
import com.robobg.dtos.UserDTO.CurrentUserDTO;
import com.robobg.entity.User;
import com.robobg.exceptions.EntityNotFoundException;
import com.robobg.service.AnswerService;
import com.robobg.service.ProfilePictureService;
import com.robobg.service.QuestionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/v1/user")
public class UserController {
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final ProfilePictureService profilePictureService;

    public UserController(QuestionService questionService, AnswerService answerService, JwtService jwtService, ProfilePictureService profilePictureService) {
        this.questionService = questionService;
        this.answerService = answerService;
        this.profilePictureService = profilePictureService;
    }

    @GetMapping("/me")
    public CurrentUserDTO getCurrentUser(@AuthenticationPrincipal User user) {
        return profilePictureService.getCurrentUser(user);
    }

    @PostMapping("/profile-picture")
    public CurrentUserDTO uploadProfilePicture(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal User user) throws IOException {
        return profilePictureService.uploadProfilePicture(user, file);
    }

    @DeleteMapping("/profile-picture")
    public CurrentUserDTO deleteProfilePicture(@AuthenticationPrincipal User user) {
        return profilePictureService.deleteProfilePicture(user);
    }

    @PostMapping("/answers")
    public ResponseEntity<String> createAnswer(@Valid @RequestBody AnswerCreateDTO answerCreateDTO, HttpServletRequest request) throws EntityNotFoundException {
        answerService.createAnswer(answerCreateDTO,request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<String> deleteAnswer(@PathVariable Long id, HttpServletRequest request) throws EntityNotFoundException {
        answerService.deleteAnswer(id,request);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id, HttpServletRequest request) throws EntityNotFoundException {
        questionService.deleteQuestion(id,request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/questions")
    public ResponseEntity<String> createQuestion(@Valid @RequestBody QuestionCreateDTO questionCreateDTO, HttpServletRequest request) throws EntityNotFoundException {
        questionService.createQuestion(questionCreateDTO,request);
        return ResponseEntity.ok().build();
    }

}
