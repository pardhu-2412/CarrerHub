package com.careerhub.platform.controller;

import com.careerhub.platform.model.ApplicationStatus;
import com.careerhub.platform.model.JobApplication;
import com.careerhub.platform.model.User;
import com.careerhub.platform.repository.InterviewRepository;
import com.careerhub.platform.repository.JobApplicationRepository;
import com.careerhub.platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserService userService;

    public AnalyticsController(
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            UserService userService) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        long totalApps = jobApplicationRepository.countByUserId(userId);
        long totalInterviews = interviewRepository.countByUserId(userId);

        long appliedCount = jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);
        long inProgressCount = jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.IN_PROGRESS);
        long interviewingCount = jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEWING);
        long offeredCount = jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFERED);
        long rejectedCount = jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED);

        double offerRate = totalApps > 0 ? (offeredCount * 100.0 / totalApps) : 0.0;
        // Interview rate: Applications that reached interviewing stage or have an offer
        double interviewRate = totalApps > 0 ? ((interviewingCount + offeredCount) * 100.0 / totalApps) : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", totalApps);
        stats.put("totalInterviews", totalInterviews);
        stats.put("offeredCount", offeredCount);
        stats.put("offerRate", Math.round(offerRate * 10.0) / 10.0);
        stats.put("interviewRate", Math.round(interviewRate * 10.0) / 10.0);

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("APPLIED", appliedCount);
        statusCounts.put("IN_PROGRESS", inProgressCount);
        statusCounts.put("INTERVIEWING", interviewingCount);
        statusCounts.put("OFFERED", offeredCount);
        statusCounts.put("REJECTED", rejectedCount);
        stats.put("statusCounts", statusCounts);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyStats() {
        User currentUser = userService.getCurrentUser();
        List<JobApplication> apps = jobApplicationRepository.findByUserIdOrderByDateAppliedDesc(currentUser.getId());

        // Group by Month (using LinkedHashMap to maintain insertion or sorted month order)
        // For MVP simplicity, let's group by Month Name (like "January", "February", etc.) based on dateApplied
        Map<String, Integer> monthlyCounts = new LinkedHashMap<>();

        // Initialize last 6 months with 0
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            String monthName = d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getYear();
            monthlyCounts.put(monthName, 0);
        }

        // Aggregate
        for (JobApplication app : apps) {
            if (app.getDateApplied() != null) {
                LocalDate d = app.getDateApplied();
                String monthName = d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getYear();
                if (monthlyCounts.containsKey(monthName)) {
                    monthlyCounts.put(monthName, monthlyCounts.get(monthName) + 1);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : monthlyCounts.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", entry.getKey());
            point.put("count", entry.getValue());
            result.add(point);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/status-stats")
    public ResponseEntity<List<Map<String, Object>>> getStatusStats() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = jobApplicationRepository.countByUserIdAndStatus(userId, status);
            Map<String, Object> point = new HashMap<>();
            point.put("status", status.name());
            point.put("count", count);
            result.add(point);
        }

        return ResponseEntity.ok(result);
    }
}
