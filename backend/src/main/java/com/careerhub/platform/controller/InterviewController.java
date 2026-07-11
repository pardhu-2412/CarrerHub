package com.careerhub.platform.controller;

import com.careerhub.platform.dto.InterviewRequest;
import com.careerhub.platform.model.Interview;
import com.careerhub.platform.model.User;
import com.careerhub.platform.service.InterviewService;
import com.careerhub.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserService userService;

    public InterviewController(InterviewService interviewService, UserService userService) {
        this.interviewService = interviewService;
        this.userService = userService;
    }

    /**
     * GET /api/interviews - Get all scheduled interviews for the current user
     */
    @GetMapping
    public ResponseEntity<List<Interview>> getMyInterviews() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(interviewService.getInterviewsByUser(currentUser.getId()));
    }

    /**
     * POST /api/interviews - Schedule a new interview
     */
    @PostMapping
    public ResponseEntity<Interview> scheduleInterview(@Valid @RequestBody InterviewRequest request) {
        User currentUser = userService.getCurrentUser();
        Interview saved = interviewService.scheduleInterview(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /api/interviews/{id} - Edit scheduled interview details
     */
    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(interviewService.updateInterview(id, currentUser, request));
    }

    /**
     * DELETE /api/interviews/{id} - Cancel/Delete interview
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelInterview(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        interviewService.cancelInterview(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
