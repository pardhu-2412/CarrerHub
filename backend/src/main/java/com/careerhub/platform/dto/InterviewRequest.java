package com.careerhub.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class InterviewRequest {

    @NotNull(message = "Job application ID is required")
    private Long applicationId;

    @NotBlank(message = "Interview title cannot be blank")
    private String title;

    @NotNull(message = "Interview date/time is required")
    private LocalDateTime interviewDate;

    private String platform;

    private String link;

    private String notes;
}
