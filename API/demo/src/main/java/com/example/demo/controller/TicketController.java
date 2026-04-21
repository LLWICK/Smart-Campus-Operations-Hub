package com.example.demo.controller;

import com.example.demo.dto.TicketRequest;
import com.example.demo.dto.TicketResponse;
import com.example.demo.model.User;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.service.CurrentUserService;
import com.example.demo.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(@AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(ticketService.getAllTickets(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable String id,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(ticketService.getTicketById(id, currentUser));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByUserId(
            @PathVariable String userId,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(ticketService.getTicketsByUserId(userId, currentUser));
    }

    

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, currentUser));
    }

    @PatchMapping("/{id}/assign/{techId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable String id,
            @PathVariable String techId) {
        return ResponseEntity.ok(ticketService.assignToTechnician(id, techId));
    }
}
