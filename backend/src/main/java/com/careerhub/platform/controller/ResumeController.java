package com.careerhub.platform.controller;

import com.careerhub.platform.model.Resume;
import com.careerhub.platform.model.User;
import com.careerhub.platform.service.ResumeService;
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
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserService userService;

    public ResumeController(ResumeService resumeService, UserService userService) {
        this.resumeService = resumeService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Resume>> getMyResumes() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(resumeService.getResumesByUser(currentUser));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isDefault", defaultValue = "false") boolean isDefault) {
        User currentUser = userService.getCurrentUser();
        try {
            Resume resume = resumeService.uploadResume(currentUser, file, isDefault);
            return ResponseEntity.status(HttpStatus.CREATED).body(resume);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not read uploaded file");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Resume resume = resumeService.getResumeForDownload(id, currentUser);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resume.getFileType() != null ? resume.getFileType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getFileName() + "\"")
                .body(new ByteArrayResource(resume.getFileData()));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<String> setDefaultResume(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        resumeService.setDefaultResume(id, currentUser);
        return ResponseEntity.ok("Default resume updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        resumeService.deleteResume(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
