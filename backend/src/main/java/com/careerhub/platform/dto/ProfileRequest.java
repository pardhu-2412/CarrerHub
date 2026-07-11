package com.careerhub.platform.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {
    private String fullName;
    private String bio;
    private String skills;
    private String githubLink;
    private String linkedinLink;
    private String portfolioLink;
    private String preferences;
}
