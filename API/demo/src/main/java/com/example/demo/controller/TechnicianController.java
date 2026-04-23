package com.example.demo.controller;

import com.example.demo.dto.TicketResponse;
import com.example.demo.model.User;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.service.TicketService;
import com.example.demo.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')") // Security Guardrail
public class TechnicianController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    /**
     * GET /api/technician/my-tasks
     * Returns all tickets assigned to the logged-in technician
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TicketResponse>> getMyAssignedTasks(
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User user = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(user.getId()));
    }

    /**
     * PATCH /api/technician/tickets/{id}/resolve
     * Specifically for logging technical feedback and updating status
     */
    @PatchMapping("/tickets/{id}/resolve")
    public ResponseEntity<TicketResponse> resolveTask(
            @PathVariable String id,
            @RequestBody Map<String, String> updateRequest,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        
        User user = currentUserService.requireUser(oauthUser);
        String feedback = updateRequest.get("feedback");
        
        // We use the service method to save the technical log
        return ResponseEntity.ok(ticketService.updateTechnicianFeedback(id, feedback, user));
    }
}