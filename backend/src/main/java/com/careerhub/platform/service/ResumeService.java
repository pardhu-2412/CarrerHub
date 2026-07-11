package com.careerhub.platform.service;

import com.careerhub.platform.exception.AccessDeniedException;
import com.careerhub.platform.exception.ResourceNotFoundException;
import com.careerhub.platform.model.Resume;
import com.careerhub.platform.model.User;
import com.careerhub.platform.repository.ResumeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class ResumeService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeService.class);
    private static final List<String> ALLOWED_FILE_TYPES = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final ResumeRepository resumeRepository;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    @Transactional(readOnly = true)
    public List<Resume> getResumesByUser(User user) {
        return resumeRepository.findByUser(user);
    }

    public Resume uploadResume(User currentUser, MultipartFile file, boolean isDefault) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_FILE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, DOC, and DOCX files are allowed.");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File is too large. Maximum allowed size is 5MB.");
        }

        Resume resume = new Resume();
        resume.setUser(currentUser);
        resume.setFileName(file.getOriginalFilename());
        resume.setFileType(contentType);
        resume.setFileData(file.getBytes());
        resume.setUploadedAt(LocalDateTime.now());

        if (isDefault) {
            resetDefaultResumes(currentUser);
            resume.setDefault(true);
        } else {
            List<Resume> existing = resumeRepository.findByUser(currentUser);
            if (existing.isEmpty()) {
                resume.setDefault(true);
            }
        }

        Resume saved = resumeRepository.save(resume);
        logger.info("Resume '{}' uploaded for user: {}", saved.getFileName(), currentUser.getUsername());
        return saved;
    }

    @Transactional(readOnly = true)
    public Resume getResumeForDownload(Long id, User currentUser) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        if (!resume.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access this resume");
        }

        return resume;
    }

    public void setDefaultResume(Long id, User currentUser) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        if (!resume.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this resume");
        }

        resetDefaultResumes(currentUser);
        resume.setDefault(true);
        resumeRepository.save(resume);
        logger.info("Default resume set to ID {} for user: {}", id, currentUser.getUsername());
    }

    public void deleteResume(Long id, User currentUser) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        if (!resume.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this resume");
        }

        resumeRepository.delete(resume);
        logger.info("Deleted resume ID {} for user: {}", id, currentUser.getUsername());
    }

    private void resetDefaultResumes(User user) {
        List<Resume> resumes = resumeRepository.findByUser(user);
        for (Resume r : resumes) {
            if (r.isDefault()) {
                r.setDefault(false);
                resumeRepository.save(r);
            }
        }
    }
}
