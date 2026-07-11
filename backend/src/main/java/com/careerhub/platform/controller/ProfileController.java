package com.careerhub.platform.controller;

import com.careerhub.platform.dto.ProfileRequest;
import com.careerhub.platform.model.Profile;
import com.careerhub.platform.model.User;
import com.careerhub.platform.service.ProfileService;
import com.careerhub.platform.service.UserService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<Profile> getMyProfile() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(profileService.getProfileByUser(currentUser));
    }

    @PutMapping("/me")
    public ResponseEntity<Profile> updateMyProfile(@RequestBody ProfileRequest profileRequest) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(profileService.updateProfile(currentUser, profileRequest));
    }

    @PostMapping("/me/image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        User currentUser = userService.getCurrentUser();
        try {
            Profile updatedProfile = profileService.uploadProfileImage(currentUser, file);
            return ResponseEntity.ok(updatedProfile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not read uploaded file");
        }
    }

    @GetMapping("/me/image")
    public ResponseEntity<Resource> getProfileImage() {
        User currentUser = userService.getCurrentUser();
        Profile profile = profileService.getProfileImageInfo(currentUser);
        if (profile.getProfileImageData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(profile.getProfileImageType() != null ? profile.getProfileImageType() : "image/png"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + profile.getProfileImageName() + "\"")
                .body(new ByteArrayResource(profile.getProfileImageData()));
    }
}
