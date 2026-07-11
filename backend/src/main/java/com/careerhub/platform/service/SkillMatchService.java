package com.careerhub.platform.service;

import com.careerhub.platform.dto.SkillMatchDTO;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Pure Java business logic for comparing a user's profile skills against
 * a job's required skills using Java Set operations.
 *
 * Strategy:
 *  1. Parse both CSV strings (user skills, job required skills) into Sets.
 *  2. Use Set.retainAll() to find matching skills (intersection).
 *  3. Use Set.removeAll() to find missing skills (difference).
 *  4. Calculate match percentage = matching / total required * 100.
 *
 * No AI, machine learning, or external libraries are used.
 */
@Service
public class SkillMatchService {

    /**
     * Compares the user's profile skills against a job's required skills
     * using Java Set operations.
     *
     * @param userSkillsCsv      Comma-separated skills from the user's profile (may be null)
     * @param requiredSkillsCsv  Comma-separated required skills from the job (may be null)
     * @param jobTitle           Job title for the response DTO
     * @param companyName        Company name for the response DTO
     * @return {@link SkillMatchDTO} with matching skills, missing skills, and match percentage
     */
    public SkillMatchDTO analyse(String userSkillsCsv, String requiredSkillsCsv,
                                  String jobTitle, String companyName) {

        // 1. Build required skills Set (lowercase for comparison)
        //    Also keep a lowercase → original-casing map for display
        Map<String, String> lowerToOriginal = new LinkedHashMap<>();
        if (requiredSkillsCsv != null && !requiredSkillsCsv.isBlank()) {
            Arrays.stream(requiredSkillsCsv.split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .forEach(s -> lowerToOriginal.putIfAbsent(s.toLowerCase(), s));
        }
        Set<String> requiredLower = new HashSet<>(lowerToOriginal.keySet());

        // 2. Build user skills Set (lowercase)
        Set<String> userLower = parseToLowerSet(userSkillsCsv);

        // 3. Intersection: required ∩ user  →  matching skills
        Set<String> matchingLower = new HashSet<>(requiredLower);
        matchingLower.retainAll(userLower);

        // 4. Difference: required − user  →  missing skills
        Set<String> missingLower = new HashSet<>(requiredLower);
        missingLower.removeAll(userLower);

        // 5. Calculate match percentage
        int total      = requiredLower.size();
        int percentage = (total == 0) ? 0 : (int) Math.round((matchingLower.size() * 100.0) / total);

        // 6. Map back to original casing and sort alphabetically
        List<String> matching = matchingLower.stream()
                .map(s -> lowerToOriginal.getOrDefault(s, s))
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());

        List<String> missing = missingLower.stream()
                .map(s -> lowerToOriginal.getOrDefault(s, s))
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());

        return new SkillMatchDTO(jobTitle, companyName, matching, missing, percentage);
    }

    // ------------------------------------------------------------------ helpers

    /** Parses a comma-separated skills string into a lowercase Set. */
    private Set<String> parseToLowerSet(String csv) {
        if (csv == null || csv.isBlank()) return new HashSet<>();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }
}
