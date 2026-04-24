package com.example.demo.service;

import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String userId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hour timeout
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        return emitter;
    }

    public Notification createNotification(String userId, String type, String message,
                                           String referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push via SSE
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(saved));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }

        return saved;
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markAsRead(String id, String userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(n -> n.setRead(true));
        if (!unreadNotifications.isEmpty()) {
            notificationRepository.saveAll(unreadNotifications);
        }
    }
}
