package com.careerhub.platform.service;

import com.careerhub.platform.dto.InterviewRequest;
import com.careerhub.platform.exception.AccessDeniedException;
import com.careerhub.platform.exception.ResourceNotFoundException;
import com.careerhub.platform.model.Interview;
import com.careerhub.platform.model.JobApplication;
import com.careerhub.platform.model.User;
import com.careerhub.platform.repository.InterviewRepository;
import com.careerhub.platform.repository.JobApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public InterviewService(
            InterviewRepository interviewRepository,
            JobApplicationRepository jobApplicationRepository) {
        this.interviewRepository = interviewRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @Transactional(readOnly = true)
    public List<Interview> getInterviewsByUser(Long userId) {
        return interviewRepository.findByUserIdOrderByInterviewDateAsc(userId);
    }

    public Interview scheduleInterview(User currentUser, InterviewRequest request) {
        JobApplication app = jobApplicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Application does not belong to you");
        }

        Interview interview = new Interview();
        interview.setUser(currentUser);
        interview.setJobApplication(app);
        interview.setTitle(request.getTitle());
        interview.setInterviewDate(request.getInterviewDate());
        interview.setPlatform(request.getPlatform());
        interview.setLink(request.getLink());
        interview.setNotes(request.getNotes());
        interview.setReminderSent(false);

        Interview saved = interviewRepository.save(interview);
        logger.info("Scheduled interview '{}' for user {}", saved.getTitle(), currentUser.getUsername());
        return saved;
    }

    public Interview updateInterview(Long id, User currentUser, InterviewRequest request) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        if (!interview.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this interview");
        }

        JobApplication app = jobApplicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Application does not belong to you");
        }

        interview.setJobApplication(app);
        interview.setTitle(request.getTitle());
        interview.setPlatform(request.getPlatform());
        interview.setLink(request.getLink());
        interview.setNotes(request.getNotes());

        // Reset reminder flag if date changes
        if (!interview.getInterviewDate().equals(request.getInterviewDate())) {
            interview.setInterviewDate(request.getInterviewDate());
            interview.setReminderSent(false);
        }

        return interviewRepository.save(interview);
    }

    public void cancelInterview(Long id, User currentUser) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        if (!interview.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to cancel this interview");
        }

        interviewRepository.delete(interview);
        logger.info("Cancelled interview ID {} for user {}", id, currentUser.getUsername());
    }
}
