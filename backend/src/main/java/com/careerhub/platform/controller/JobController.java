package com.careerhub.platform.controller;

import com.careerhub.platform.dto.JobRequest;
import com.careerhub.platform.model.Job;
import com.careerhub.platform.model.User;
import com.careerhub.platform.repository.UserRepository;
import com.careerhub.platform.service.JobService;
import com.careerhub.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import com.careerhub.platform.dto.SkillMatchDTO;
import com.careerhub.platform.model.Profile;
import com.careerhub.platform.service.ProfileService;
import com.careerhub.platform.service.SkillMatchService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ProfileService profileService;
    private final SkillMatchService skillMatchService;

    public JobController(JobService jobService, UserRepository userRepository, UserService userService,
                         ProfileService profileService, SkillMatchService skillMatchService) {
        this.jobService = jobService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.profileService = profileService;
        this.skillMatchService = skillMatchService;
    }

    /**
     * GET /api/jobs - Get all active jobs (optionally with search query)
     */
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs(
            @RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(jobService.getAllActiveJobs(query));
    }

    /**
     * GET /api/jobs/{id} - Get specific job by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    /**
     * POST /api/jobs - Create a new job (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobRequest request) {
        Job savedJob = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
    }

    /**
     * PUT /api/jobs/{id} - Update a job (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, request));
    }

    /**
     * DELETE /api/jobs/{id} - Delete a job (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    // --- Saved Jobs Endpoints ---

    /**
     * GET /api/jobs/saved - Get current user's saved/bookmarked jobs
     */
    @GetMapping("/saved")
    public ResponseEntity<Set<Job>> getSavedJobs() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(currentUser.getSavedJobs());
    }

    /**
     * POST /api/jobs/{id}/save - Bookmark a job
     */
    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveJob(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Job job = jobService.getJobById(id);
        currentUser.getSavedJobs().add(job);
        userRepository.save(currentUser);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/jobs/{id}/save - Remove bookmark
     */
    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveJob(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Job job = jobService.getJobById(id);
        currentUser.getSavedJobs().remove(job);
        userRepository.save(currentUser);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/jobs/{id}/skill-match - Get skill match analysis for current user against specific job
     */
    @GetMapping("/{id}/skill-match")
    public ResponseEntity<SkillMatchDTO> getSkillMatch(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Profile profile = profileService.getProfileByUser(currentUser);
        Job job = jobService.getJobById(id);
        
        SkillMatchDTO dto = skillMatchService.analyse(
            profile.getSkills(),
            job.getRequiredSkills(),
            job.getTitle(),
            job.getCompanyName()
        );
        return ResponseEntity.ok(dto);
    }
}
