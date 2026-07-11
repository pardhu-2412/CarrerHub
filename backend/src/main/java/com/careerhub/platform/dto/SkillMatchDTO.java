package com.careerhub.platform.dto;

import java.util.List;

/**
 * Response DTO for the skill-match analysis of an application against
 * the user's current profile skills.
 */
public class SkillMatchDTO {

    private String jobTitle;
    private String companyName;

    /** Skills from the job requirements that the user already has. */
    private List<String> matchingSkills;

    /** Skills from the job requirements that the user is missing. */
    private List<String> missingSkills;

    /** Percentage of required skills the user has: matchingSkills / total required * 100 */
    private int matchPercentage;

    // ----- Constructors -----

    public SkillMatchDTO() {}

    public SkillMatchDTO(String jobTitle, String companyName,
                         List<String> matchingSkills, List<String> missingSkills,
                         int matchPercentage) {
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.matchPercentage = matchPercentage;
    }

    // ----- Getters & Setters -----

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }
}
