package com.careerhub.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ApplicationRequest {

    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @NotBlank(message = "Role cannot be blank")
    private String role;

    private String status; // Default to APPLIED if null

    private LocalDate dateApplied; // Default to current date if null

    private Long resumeId; // Optional link to resume

    private String notes;

    /** Free-text job description for this application. */
    private String jobDescription;

    /**
     * Comma-separated required skills for the role.
     * Used by Skill Gap Analysis to compare against the user's profile skills.
     * Example: "Java, Spring Boot, React, SQL"
     */
    private String requiredSkills;

    /** Optional link to internal job discovery listing. */
    private Long jobId;
}
