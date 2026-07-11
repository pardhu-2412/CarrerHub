package com.careerhub.platform.service;

import com.careerhub.platform.dto.SkillMatchDTO;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SkillMatchServiceTests {

    private final SkillMatchService skillMatchService = new SkillMatchService();

    @Test
    public void testSkillMatchLogic() {
        // User profile skills
        String userSkills = "Java, React, SQL, HTML, CSS";
        
        // Job requirements (CSV list of skills)
        String requiredSkills = "Java, Spring Boot, React, PostgreSQL";

        SkillMatchDTO dto = skillMatchService.analyse(userSkills, requiredSkills, "Software Engineer", "Acme Corp");

        assertNotNull(dto);
        assertEquals("Software Engineer", dto.getJobTitle());
        assertEquals("Acme Corp", dto.getCompanyName());

        // Matching: Java, React (SQL, HTML, CSS are not in requirements; Spring Boot and PostgreSQL are missing)
        assertTrue(dto.getMatchingSkills().contains("Java"));
        assertTrue(dto.getMatchingSkills().contains("React"));
        assertFalse(dto.getMatchingSkills().contains("SQL")); // Not in requirements

        // Missing: Spring Boot, PostgreSQL
        assertTrue(dto.getMissingSkills().contains("Spring Boot"));
        assertTrue(dto.getMissingSkills().contains("PostgreSQL"));

        // Match percentage calculation:
        // Required skills found in text: Java, Spring Boot, React, PostgreSQL, SQL (PostgreSQL contains SQL)
        // Matching: Java, React, SQL (PostgreSQL contains SQL, and user has SQL)
        // Total required skills extracted: Java, Spring Boot, React, PostgreSQL, SQL
        // Let's verify the calculated percentage is accurate to the matching/total size
        int total = dto.getMatchingSkills().size() + dto.getMissingSkills().size();
        int expectedPercent = (int) Math.round((dto.getMatchingSkills().size() * 100.0) / total);
        assertEquals(expectedPercent, dto.getMatchPercentage());
    }

    @Test
    public void testEmptyOrNullRequirements() {
        SkillMatchDTO dto = skillMatchService.analyse("Java, React", "", "Developer", "Test");
        assertNotNull(dto);
        assertEquals(0, dto.getMatchingSkills().size());
        assertEquals(0, dto.getMissingSkills().size());
        assertEquals(0, dto.getMatchPercentage());
    }
}
