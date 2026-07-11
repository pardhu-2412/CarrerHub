package com.careerhub.platform.controller;

import com.careerhub.platform.model.*;
import com.careerhub.platform.repository.*;
import com.careerhub.platform.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final ResumeRepository resumeRepository;
    private final ProfileService profileService;

    public AdminController(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            ResumeRepository resumeRepository,
            ProfileService profileService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.resumeRepository = resumeRepository;
        this.profileService = profileService;
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents() {
        List<User> students = userRepository.findByRole(Role.ROLE_STUDENT);
        List<Map<String, Object>> response = new ArrayList<>();

        for (User student : students) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", student.getId());
            map.put("username", student.getUsername());
            map.put("email", student.getEmail());

            // Profile info
            Profile profile = profileRepository.findByUserId(student.getId()).orElse(null);
            if (profile != null) {
                map.put("fullName", profile.getFullName());
                map.put("bio", profile.getBio());
                map.put("skills", profile.getSkills());
                map.put("githubLink", profile.getGithubLink());
                map.put("linkedinLink", profile.getLinkedinLink());
                map.put("portfolioLink", profile.getPortfolioLink());
                map.put("preferences", profile.getPreferences());
            } else {
                map.put("fullName", student.getUsername());
                map.put("bio", "");
                map.put("skills", "");
                map.put("githubLink", "");
                map.put("linkedinLink", "");
                map.put("portfolioLink", "");
                map.put("preferences", "");
            }

            // Student activity summary
            List<JobApplication> apps = jobApplicationRepository.findByUserIdOrderByDateAppliedDesc(student.getId());
            List<Interview> interviews = interviewRepository.findByUserIdOrderByInterviewDateAsc(student.getId());
            List<Resume> resumes = resumeRepository.findByUserId(student.getId());

            map.put("applications", apps);
            map.put("interviews", interviews);
            map.put("resumes", resumes);
            map.put("totalApplications", apps.size());
            map.put("totalInterviews", interviews.size());
            map.put("totalResumes", resumes.size());

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboardStats() {
        long totalStudents = userRepository.findByRole(Role.ROLE_STUDENT).size();
        long totalApps = jobApplicationRepository.count();
        long totalInterviews = interviewRepository.count();
        long totalOffers = jobApplicationRepository.countByStatus(ApplicationStatus.OFFERED);

        // Count students who have at least one offered application
        long placedStudents = userRepository.findByRole(Role.ROLE_STUDENT).stream()
                .filter(student -> jobApplicationRepository.findByUserIdAndStatus(student.getId(), ApplicationStatus.OFFERED).size() > 0)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalApplications", totalApps);
        stats.put("totalInterviews", totalInterviews);
        stats.put("totalOffers", totalOffers);
        stats.put("placedStudents", placedStudents);

        // Global status counts
        Map<String, Long> statusCounts = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCounts.put(status.name(), jobApplicationRepository.countByStatus(status));
        }
        stats.put("statusCounts", statusCounts);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getGlobalMonthlyStats() {
        List<JobApplication> apps = jobApplicationRepository.findAll();

        Map<String, Integer> monthlyCounts = new LinkedHashMap<>();

        // Initialize last 6 months with 0
        java.time.LocalDate now = java.time.LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate d = now.minusMonths(i);
            String monthName = d.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH) + " " + d.getYear();
            monthlyCounts.put(monthName, 0);
        }

        // Aggregate
        for (JobApplication app : apps) {
            if (app.getDateApplied() != null) {
                java.time.LocalDate d = app.getDateApplied();
                String monthName = d.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH) + " " + d.getYear();
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

    @GetMapping("/analytics/status-stats")
    public ResponseEntity<List<Map<String, Object>>> getGlobalStatusStats() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = jobApplicationRepository.countByStatus(status);
            Map<String, Object> point = new HashMap<>();
            point.put("status", status.name());
            point.put("count", count);
            result.add(point);
        }
        return ResponseEntity.ok(result);
    }
}
