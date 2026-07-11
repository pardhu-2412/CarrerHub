package com.careerhub.platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String skills; // Stored as comma-separated list

    @Column(name = "github_link", length = 255)
    private String githubLink;

    @Column(name = "linkedin_link", length = 255)
    private String linkedinLink;

    @Column(name = "portfolio_link", length = 255)
    private String portfolioLink;

    @Column(columnDefinition = "TEXT")
    private String preferences; // Career preference keywords

    @Lob
    @Column(name = "profile_image_data")
    @JsonIgnore
    private byte[] profileImageData;

    @Column(name = "profile_image_type", length = 50)
    private String profileImageType;

    @Column(name = "profile_image_name", length = 100)
    private String profileImageName;
}
