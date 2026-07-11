package com.careerhub.platform.service;

import com.careerhub.platform.model.Interview;
import com.careerhub.platform.model.Notification;
import com.careerhub.platform.repository.InterviewRepository;
import com.careerhub.platform.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);
    private final InterviewRepository interviewRepository;
    private final NotificationRepository notificationRepository;

    public ReminderService(InterviewRepository interviewRepository, NotificationRepository notificationRepository) {
        this.interviewRepository = interviewRepository;
        this.notificationRepository = notificationRepository;
    }

    // Runs every 60 seconds (60000 ms) to scan for interviews in the next 24 hours
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void checkUpcomingInterviews() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        List<Interview> upcomingInterviews = interviewRepository
                .findByInterviewDateBetweenAndReminderSentFalse(now, tomorrow);

        if (!upcomingInterviews.isEmpty()) {
            logger.info("Found {} upcoming interviews requiring reminders", upcomingInterviews.size());
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            for (Interview interview : upcomingInterviews) {
                String candidateEmail = interview.getUser().getEmail();
                String companyName = interview.getJobApplication().getCompanyName();
                String roleName = interview.getJobApplication().getRole();
                String formattedDate = interview.getInterviewDate().format(formatter);

                // 1. Simulate Email Reminder (Write to console/logs)
                String emailSubject = "CareerHub Reminder: Upcoming Interview with " + companyName;
                String emailBody = String.format(
                        "Hi %s,\n\nThis is a reminder that you have an upcoming interview scheduled:\n" +
                        "Role: %s at %s\n" +
                        "Time: %s\n" +
                        "Platform: %s\n" +
                        "Link/Location: %s\n\n" +
                        "Notes: %s\n\n" +
                        "Good luck!\nBest regards,\nCareerHub Team",
                        interview.getUser().getUsername(),
                        roleName,
                        companyName,
                        formattedDate,
                        interview.getPlatform(),
                        interview.getLink() != null ? interview.getLink() : "N/A",
                        interview.getNotes() != null ? interview.getNotes() : "No notes"
                );

                System.out.println("==========================================================================");
                System.out.println("[MOCK SMTP EMAIL REMINDER]");
                System.out.println("TO:      " + candidateEmail);
                System.out.println("SUBJECT: " + emailSubject);
                System.out.println("BODY:\n" + emailBody);
                System.out.println("==========================================================================");

                // 2. Create in-app Notification
                Notification notification = new Notification();
                notification.setUser(interview.getUser());
                notification.setMessage(String.format(
                        "Interview Tomorrow: '%s' for %s at %s is scheduled at %s on %s.",
                        interview.getTitle(),
                        roleName,
                        companyName,
                        formattedDate,
                        interview.getPlatform()
                ));
                notification.setRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);

                // 3. Mark reminder as sent
                interview.setReminderSent(true);
                interviewRepository.save(interview);
            }
        }
    }
}
