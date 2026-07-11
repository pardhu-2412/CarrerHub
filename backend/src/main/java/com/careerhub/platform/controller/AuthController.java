package com.careerhub.platform.controller;

import com.careerhub.platform.dto.AuthResponse;
import com.careerhub.platform.dto.LoginRequest;
import com.careerhub.platform.dto.RegisterRequest;
import com.careerhub.platform.model.Profile;
import com.careerhub.platform.model.Role;
import com.careerhub.platform.model.User;
import com.careerhub.platform.repository.ProfileRepository;
import com.careerhub.platform.repository.UserRepository;
import com.careerhub.platform.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

            return ResponseEntity.ok(new AuthResponse(
                    jwt,
                    "Bearer",
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name()
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new ResponseEntity<>("Email Address already in use!", HttpStatus.BAD_REQUEST);
        }

        // Creating user's account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());

        // Default to student if not provided or admin is requested
        Role userRole = Role.ROLE_STUDENT;
        if (registerRequest.getRole() != null) {
            try {
                String reqRole = registerRequest.getRole().toUpperCase();
                if (!reqRole.startsWith("ROLE_")) {
                    reqRole = "ROLE_" + reqRole;
                }
                userRole = Role.valueOf(reqRole);
            } catch (IllegalArgumentException e) {
                userRole = Role.ROLE_STUDENT;
            }
        }
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        // Auto-create a profile for the user
        Profile profile = new Profile();
        profile.setUser(savedUser);
        profile.setFullName(savedUser.getUsername()); // Default full name to username
        profile.setSkills("");
        profile.setGithubLink("");
        profile.setLinkedinLink("");
        profile.setPortfolioLink("");
        profile.setPreferences("");
        profileRepository.save(profile);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
    }
}
