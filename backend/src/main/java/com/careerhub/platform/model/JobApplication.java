package com.careerhub.platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications", indexes = {
    @Index(name = "idx_app_user_id", columnList = "user_id"),
    @Index(name = "idx_app_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = true)
    private Job job;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 100)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "date_applied")
    private LocalDate dateApplied = LocalDate.now();

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resume_id", nullable = true)
    private Resume resume;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Free-text job description entered by the user when logging this application. */
    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    /**
     * Comma-separated list of required skills for this role.
     * Used by the Skill Gap Analysis to compare against the user's profile skills.
     * Example: "Java, Spring Boot, React, SQL"
     */
    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @PreUpdate
    @PrePersist
    public void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }
}
