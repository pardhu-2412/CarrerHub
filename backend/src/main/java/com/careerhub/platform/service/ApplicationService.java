package com.careerhub.platform.service;

import com.careerhub.platform.dto.ApplicationRequest;
import com.careerhub.platform.exception.AccessDeniedException;
import com.careerhub.platform.exception.ResourceNotFoundException;
import com.careerhub.platform.model.*;
import com.careerhub.platform.repository.JobApplicationRepository;
import com.careerhub.platform.repository.ResumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationService.class);

    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;
    private final com.careerhub.platform.repository.JobRepository jobRepository;

    public ApplicationService(
            JobApplicationRepository jobApplicationRepository,
            ResumeRepository resumeRepository,
            com.careerhub.platform.repository.JobRepository jobRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional(readOnly = true)
    public List<JobApplication> getApplicationsByUser(Long userId) {
        return jobApplicationRepository.findByUserIdOrderByDateAppliedDesc(userId);
    }

    @Transactional(readOnly = true)
    public JobApplication getApplicationById(Long id, User currentUser) {
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to view this application");
        }
        return app;
    }

    public JobApplication createApplication(User currentUser, ApplicationRequest request) {
        if (request.getJobId() != null) {
            boolean exists = jobApplicationRepository.findByUserIdOrderByDateAppliedDesc(currentUser.getId()).stream()
                    .anyMatch(a -> a.getJob() != null && a.getJob().getId().equals(request.getJobId()));
            if (exists) {
                throw new IllegalStateException("You have already logged an application for this job opening.");
            }
        }

        JobApplication app = new JobApplication();
        app.setUser(currentUser);
        mapRequestToApplication(app, currentUser, request);

        // Default date
        if (app.getDateApplied() == null) {
            app.setDateApplied(LocalDate.now());
        }

        JobApplication saved = jobApplicationRepository.save(app);
        logger.info("Created application for user {} at {}", currentUser.getUsername(), saved.getCompanyName());
        return saved;
    }

    public JobApplication updateApplication(Long id, User currentUser, ApplicationRequest request) {
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this application");
        }

        mapRequestToApplication(app, currentUser, request);
        return jobApplicationRepository.save(app);
    }

    public JobApplication updateStatus(Long id, User currentUser, String status) {
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this application");
        }

        try {
            app.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid application status: " + status
                    + ". Valid values are: APPLIED, IN_PROGRESS, INTERVIEWING, OFFERED, REJECTED");
        }

        return jobApplicationRepository.save(app);
    }

    public void deleteApplication(Long id, User currentUser) {
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this application");
        }

        jobApplicationRepository.delete(app);
        logger.info("Deleted application ID {} for user {}", id, currentUser.getUsername());
    }

    // ------------------------------------------------------------------ helpers

    private void mapRequestToApplication(JobApplication app, User currentUser, ApplicationRequest request) {
        app.setCompanyName(request.getCompanyName());
        app.setRole(request.getRole());
        app.setNotes(request.getNotes());
        app.setJobDescription(request.getJobDescription());
        app.setRequiredSkills(request.getRequiredSkills());

        // Link job if jobId is provided
        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job", "id", request.getJobId()));
            app.setJob(job);
            
            // Auto-populate description and required skills from job if not provided
            if (app.getJobDescription() == null || app.getJobDescription().isBlank()) {
                app.setJobDescription(job.getDescription());
            }
            if (app.getRequiredSkills() == null || app.getRequiredSkills().isBlank()) {
                app.setRequiredSkills(job.getRequiredSkills());
            }
        } else {
            app.setJob(null);
        }

        if (request.getDateApplied() != null) {
            app.setDateApplied(request.getDateApplied());
        }

        // Handle status
        if (request.getStatus() != null) {
            try {
                app.setStatus(ApplicationStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status '{}', keeping existing / defaulting to APPLIED", request.getStatus());
            }
        }

        // Link resume (null clears the link)
        if (request.getResumeId() != null) {
            Resume resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", request.getResumeId()));
            if (!resume.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Resume does not belong to you");
            }
            app.setResume(resume);
        } else {
            // If no resume explicitly chosen, auto-attach the user's default resume only on creation
            if (app.getId() == null) {
                resumeRepository.findByUserIdAndIsDefaultTrue(currentUser.getId()).ifPresent(app::setResume);
            } else {
                app.setResume(null);
            }
        }
    }
}
