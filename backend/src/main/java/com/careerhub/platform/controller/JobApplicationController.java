package com.careerhub.platform.controller;

import com.careerhub.platform.dto.ApplicationRequest;
import com.careerhub.platform.dto.SkillMatchDTO;
import com.careerhub.platform.model.JobApplication;
import com.careerhub.platform.model.Profile;
import com.careerhub.platform.model.User;
import com.careerhub.platform.service.ApplicationService;
import com.careerhub.platform.service.ProfileService;
import com.careerhub.platform.service.SkillMatchService;
import com.careerhub.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;
    private final ProfileService profileService;
    private final SkillMatchService skillMatchService;

    public JobApplicationController(ApplicationService applicationService,
                                     UserService userService,
                                     ProfileService profileService,
                                     SkillMatchService skillMatchService) {
        this.applicationService = applicationService;
        this.userService = userService;
        this.profileService = profileService;
        this.skillMatchService = skillMatchService;
    }

    /**
     * GET /api/applications - Get all applications for current user
     */
    @GetMapping
    public ResponseEntity<List<JobApplication>> getMyApplications() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(applicationService.getApplicationsByUser(currentUser.getId()));
    }

    /**
     * POST /api/applications - Create a new application
     */
    @PostMapping
    public ResponseEntity<JobApplication> createApplication(@Valid @RequestBody ApplicationRequest request) {
        User currentUser = userService.getCurrentUser();
        JobApplication saved = applicationService.createApplication(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /api/applications/{id} - Update application details
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequest request) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(applicationService.updateApplication(id, currentUser, request));
    }

    /**
     * PUT /api/applications/{id}/status - Update status only (for Kanban board)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(applicationService.updateStatus(id, currentUser, status));
    }

    /**
     * DELETE /api/applications/{id} - Delete an application
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        applicationService.deleteApplication(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/applications/{id}/skill-gap
     *
     * Compares the current user's profile skills against the required skills
     * stored on this specific application using Java Set operations.
     * Returns SkillMatchDTO with matching skills, missing skills, and match percentage.
     */
    @GetMapping("/{id}/skill-gap")
    public ResponseEntity<SkillMatchDTO> getSkillGap(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        JobApplication app = applicationService.getApplicationById(id, currentUser);
        Profile profile = profileService.getProfileByUser(currentUser);

        SkillMatchDTO dto = skillMatchService.analyse(
                profile.getSkills(),
                app.getRequiredSkills(),
                app.getRole(),
                app.getCompanyName()
        );
        return ResponseEntity.ok(dto);
    }
}
