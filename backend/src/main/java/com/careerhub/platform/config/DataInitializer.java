package com.careerhub.platform.config;

import com.careerhub.platform.model.*;
import com.careerhub.platform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final NotificationRepository notificationRepository;

    public DataInitializer(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // 1. Create Default Users if none exist
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setEmail("admin@careerhub.com");
            admin.setRole(Role.ROLE_ADMIN);
            User savedAdmin = userRepository.save(admin);

            Profile profile = new Profile();
            profile.setUser(savedAdmin);
            profile.setFullName("Platform Admin");
            profile.setSkills("");
            profile.setGithubLink("");
            profile.setLinkedinLink("");
            profile.setPortfolioLink("");
            profile.setPreferences("");
            profileRepository.save(profile);
        }

        User student = null;
        if (!userRepository.existsByUsername("student")) {
            student = new User();
            student.setUsername("student");
            student.setPassword(encoder.encode("student123"));
            student.setEmail("student@careerhub.com");
            student.setRole(Role.ROLE_STUDENT);
            student = userRepository.save(student);

            // Create Profile for Student
            Profile profile = new Profile();
            profile.setUser(student);
            profile.setFullName("G Parda saradi Reddy");
            profile.setSkills("Java, Spring Boot, React, JavaScript, HTML5, CSS3, SQL");
            profile.setGithubLink("https://github.com/gpardasaradireddy");
            profile.setLinkedinLink("https://linkedin.com/in/gpardasaradireddy");
            profile.setPortfolioLink("https://careerhub-portfolio.example.com");
            profile.setPreferences("Full Stack Developer, Software Engineer, Frontend Engineer");
            profileRepository.save(profile);
        } else {
            student = userRepository.findByUsername("student").orElse(null);
        }

        // 2. Create Sample Jobs if database has no jobs
        if (jobRepository.count() == 0) {
            Job job1 = new Job();
            job1.setTitle("Software Engineer Intern");
            job1.setCompanyName("Google");
            job1.setLocation("Hyderabad, India");
            job1.setDescription("We are looking for a Software Engineer Intern to join our Engineering team in Hyderabad. You will work on real-world projects, write production-ready code, and collaborate with seasoned engineers.");
            job1.setRequirements("Pursuing B.Tech or MCA in Computer Science. Proficient in Java, C++, or Python. Solid understanding of data structures and algorithms.");
            job1.setRequiredSkills("Java, C++, Python, Data Structures, Algorithms");
            job1.setSalaryRange("₹80,000 - ₹1,00,000 / month");
            job1.setApplicationUrl("https://careers.google.com");
            job1.setPostedAt(LocalDateTime.now().minusDays(5));
            job1.setActive(true);

            Job job2 = new Job();
            job2.setTitle("Associate Software Engineer");
            job2.setCompanyName("Oracle");
            job2.setLocation("Bangalore, India");
            job2.setDescription("Join our Cloud Infrastructure team. You will be responsible for developing and maintaining high-performance microservices, writing unit tests, and optimizing database queries.");
            job2.setRequirements("B.Tech/MCA graduate. Hands-on experience with Spring Boot, Java, and RESTful APIs. Experience with MySQL or Oracle SQL database.");
            job2.setRequiredSkills("Java, Spring Boot, REST, MySQL, Oracle SQL");
            job2.setSalaryRange("₹8,00,000 - ₹12,00,000 / year");
            job2.setApplicationUrl("https://careers.oracle.com");
            job2.setPostedAt(LocalDateTime.now().minusDays(3));
            job2.setActive(true);

            Job job3 = new Job();
            job3.setTitle("React Frontend Developer");
            job3.setCompanyName("Microsoft");
            job3.setLocation("Noida, India");
            job3.setDescription("Develop premium user experiences using React, TypeScript, and modern CSS. Collaborate with designers to transform wireframes into dynamic, responsive web interfaces.");
            job3.setRequirements("B.Tech/MCA or MCA Student. Deep understanding of JavaScript/TypeScript, React hooks, state management, and modern CSS layout systems (Grid/Flexbox).");
            job3.setRequiredSkills("JavaScript, TypeScript, React, HTML5, CSS3");
            job3.setSalaryRange("₹12,00,000 - ₹16,00,000 / year");
            job3.setApplicationUrl("https://careers.microsoft.com");
            job3.setPostedAt(LocalDateTime.now().minusDays(2));
            job3.setActive(true);

            Job job4 = new Job();
            job4.setTitle("Full Stack Engineer (Java + React)");
            job4.setCompanyName("Goldman Sachs");
            job4.setLocation("Bangalore, India");
            job4.setDescription("Architect and develop secure, scalable trading platform features. Build responsive frontends in React and microservices in Spring Boot.");
            job4.setRequirements("Bachelor's or Master's degree in CS or MCA. Knowledge of Java 17+, Spring Boot, Spring Security, React, JWT, and SQL databases.");
            job4.setRequiredSkills("Java, Spring Boot, Spring Security, React, JWT, SQL");
            job4.setSalaryRange("₹15,00,000 - ₹20,00,000 / year");
            job4.setApplicationUrl("https://careers.goldmansachs.com");
            job4.setPostedAt(LocalDateTime.now().minusDays(10));
            job4.setActive(true);

            Job job5 = new Job();
            job5.setTitle("Software Engineer - Backend");
            job5.setCompanyName("Netflix");
            job5.setLocation("Remote (India)");
            job5.setDescription("Deliver backend services at global scale. Work on APIs that power streaming delivery pipelines using Java, Spring, and AWS cloud databases.");
            job5.setRequirements("Experienced or high-potential fresh graduate with solid coding skills in Java. Familiarity with distributed systems and REST API patterns.");
            job5.setRequiredSkills("Java, REST, AWS, Algorithms, Data Structures");
            job5.setSalaryRange("₹25,00,000 - ₹35,00,000 / year");
            job5.setApplicationUrl("https://jobs.netflix.com");
            job5.setPostedAt(LocalDateTime.now().minusDays(1));
            job5.setActive(true);

            jobRepository.saveAll(Arrays.asList(job1, job2, job3, job4, job5));

            // Create initial application track records for the student
            if (student != null && jobApplicationRepository.count() == 0) {
                // App 1: Applied to Google Intern
                JobApplication app1 = new JobApplication();
                app1.setUser(student);
                app1.setCompanyName("Google");
                app1.setRole("Software Engineer Intern");
                app1.setStatus(ApplicationStatus.APPLIED);
                app1.setDateApplied(LocalDate.now().minusDays(4));
                app1.setNotes("Applied via official careers portal. Emailed referral request.");
                app1.setJobDescription("Join our Engineering team in Hyderabad. Work on real-world projects, write production-ready code, and collaborate with seasoned engineers.");
                app1.setRequiredSkills("Java, C++, Python, Data Structures, Algorithms");
                jobApplicationRepository.save(app1);

                // App 2: Interviewing at Oracle
                JobApplication app2 = new JobApplication();
                app2.setUser(student);
                app2.setCompanyName("Oracle");
                app2.setRole("Associate Software Engineer");
                app2.setStatus(ApplicationStatus.INTERVIEWING);
                app2.setDateApplied(LocalDate.now().minusDays(10));
                app2.setNotes("Cleared online assessment on Wednesday. HR scheduled technical round.");
                app2.setJobDescription("Develop and maintain high-performance microservices for Oracle Cloud Infrastructure, write unit tests, and optimize database queries.");
                app2.setRequiredSkills("Java, Spring Boot, REST, MySQL, Oracle SQL");
                app2 = jobApplicationRepository.save(app2);

                // App 3: Offered at Microsoft
                JobApplication app3 = new JobApplication();
                app3.setUser(student);
                app3.setCompanyName("Microsoft");
                app3.setRole("React Frontend Developer");
                app3.setStatus(ApplicationStatus.OFFERED);
                app3.setDateApplied(LocalDate.now().minusDays(12));
                app3.setNotes("Completed 3 rounds of interview. Received verbal offer details.");
                app3.setJobDescription("Develop premium user experiences using React, TypeScript, and modern CSS. Collaborate with designers to transform wireframes into dynamic, responsive web interfaces.");
                app3.setRequiredSkills("JavaScript, TypeScript, React, HTML5, CSS3");
                jobApplicationRepository.save(app3);

                // App 4: Rejected at Goldman Sachs
                JobApplication app4 = new JobApplication();
                app4.setUser(student);
                app4.setCompanyName("Goldman Sachs");
                app4.setRole("Full Stack Engineer (Java + React)");
                app4.setStatus(ApplicationStatus.REJECTED);
                app4.setDateApplied(LocalDate.now().minusDays(15));
                app4.setNotes("Flipped on system design round. Re-apply in 6 months.");
                app4.setJobDescription("Architect and develop secure, scalable trading platform features. Build responsive frontends in React and microservices in Spring Boot.");
                app4.setRequiredSkills("Java, Spring Boot, Spring Security, React, JWT, SQL");
                jobApplicationRepository.save(app4);


                // Schedule a sample interview for the student
                Interview interview = new Interview();
                interview.setUser(student);
                interview.setJobApplication(app2);
                interview.setTitle("Technical Interview Round 1");
                // Schedule for tomorrow afternoon
                interview.setInterviewDate(LocalDateTime.now().plusDays(1).withHour(14).withMinute(30).withSecond(0));
                interview.setPlatform("Google Meet");
                interview.setLink("https://meet.google.com/abc-defg-hij");
                interview.setNotes("Focus areas: Data structures, OOPs, Spring Boot lifecycle, and MySQL Joins.");
                interviewRepository.save(interview);

                // Log a sample notification
                Notification notification = new Notification();
                notification.setUser(student);
                notification.setMessage("Welcome to CareerHub! Complete your profile and upload your resumes to get started.");
                notification.setRead(false);
                notification.setCreatedAt(LocalDateTime.now().minusDays(1));
                notificationRepository.save(notification);
            }
        }
    }
}
