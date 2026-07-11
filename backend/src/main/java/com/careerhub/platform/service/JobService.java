package com.careerhub.platform.service;

import com.careerhub.platform.dto.JobRequest;
import com.careerhub.platform.exception.ResourceNotFoundException;
import com.careerhub.platform.model.Job;
import com.careerhub.platform.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Transactional(readOnly = true)
    public List<Job> getAllActiveJobs(String query) {
        if (query != null && !query.trim().isEmpty()) {
            logger.debug("Searching jobs with query: {}", query);
            return jobRepository.searchJobs(query.trim());
        }
        return jobRepository.findByIsActiveTrueOrderByPostedAtDesc();
    }

    @Transactional(readOnly = true)
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
    }

    public Job createJob(JobRequest request) {
        Job job = mapRequestToJob(new Job(), request);
        job.setPostedAt(LocalDateTime.now());
        Job saved = jobRepository.save(job);
        logger.info("Created new job: {} at {}", saved.getTitle(), saved.getCompanyName());
        return saved;
    }

    public Job updateJob(Long id, JobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
        mapRequestToJob(job, request);
        Job updated = jobRepository.save(job);
        logger.info("Updated job ID: {}", id);
        return updated;
    }

    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
        jobRepository.delete(job);
        logger.info("Deleted job ID: {}", id);
    }

    private Job mapRequestToJob(Job job, JobRequest request) {
        job.setTitle(request.getTitle());
        job.setCompanyName(request.getCompanyName());
        job.setLocation(request.getLocation());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setSalaryRange(request.getSalaryRange());
        job.setApplicationUrl(request.getApplicationUrl());
        job.setJobType(request.getJobType());
        job.setActive(request.isActive());
        return job;
    }
}
