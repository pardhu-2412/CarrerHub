package com.careerhub.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 100, message = "Job title must be at most 100 characters")
    private String title;

    @NotBlank(message = "Company name is required")
    @Size(max = 100, message = "Company name must be at most 100 characters")
    private String companyName;

    @Size(max = 100, message = "Location must be at most 100 characters")
    private String location;

    private String description;

    private String requirements;

    @Size(max = 50, message = "Salary range must be at most 50 characters")
    private String salaryRange;

    private String applicationUrl;

    private String jobType; // FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT

    private String requiredSkills; // Comma-separated list of required skills for skill-match analysis

    private boolean active = true;
}
