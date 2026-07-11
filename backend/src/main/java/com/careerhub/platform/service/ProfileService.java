package com.careerhub.platform.service;

import com.careerhub.platform.dto.ProfileRequest;
import com.careerhub.platform.exception.ResourceNotFoundException;
import com.careerhub.platform.model.Profile;
import com.careerhub.platform.model.User;
import com.careerhub.platform.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Profile getProfileByUser(User user) {
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setUser(user);
                    profile.setFullName(user.getUsername());
                    profile.setSkills("");
                    profile.setGithubLink("");
                    profile.setLinkedinLink("");
                    profile.setPortfolioLink("");
                    profile.setPreferences("");
                    return profileRepository.save(profile);
                });
    }

    public Profile updateProfile(User user, ProfileRequest request) {
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", user.getId()));

        profile.setFullName(request.getFullName());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setGithubLink(request.getGithubLink());
        profile.setLinkedinLink(request.getLinkedinLink());
        profile.setPortfolioLink(request.getPortfolioLink());
        profile.setPreferences(request.getPreferences());

        Profile saved = profileRepository.save(profile);
        logger.info("Profile updated for user: {}", user.getUsername());
        return saved;
    }

    public Profile uploadProfileImage(User user, MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
        }

        // Validate file size
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image file is too large. Maximum allowed size is 2MB.");
        }

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", user.getId()));

        profile.setProfileImageData(file.getBytes());
        profile.setProfileImageType(contentType);
        profile.setProfileImageName(file.getOriginalFilename());

        Profile saved = profileRepository.save(profile);
        logger.info("Profile image uploaded for user: {}", user.getUsername());
        return saved;
    }

    public Profile getProfileImageInfo(User user) {
        return profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", user.getId()));
    }
}
