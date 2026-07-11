package com.careerhub.platform.controller;

import com.careerhub.platform.model.Notification;
import com.careerhub.platform.model.User;
import com.careerhub.platform.service.NotificationService;
import com.careerhub.platform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications() {
        User currentUser = userService.getCurrentUser();
        List<Notification> notifications = notificationService.getNotificationsByUser(currentUser.getId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok("Notification marked as read");
    }
}
