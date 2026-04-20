package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.User;
import com.example.demo.model.enums.BookingStatus;
import com.example.demo.service.BookingService;
import com.example.demo.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String facilityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(bookingService.getAllBookings(userId, status, facilityId, date, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(bookingService.getBookingById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        BookingResponse created = bookingService.createBooking(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        return ResponseEntity.ok(bookingService.updateBooking(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        bookingService.cancelBooking(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable String id,
            @RequestBody(required = false) StatusUpdateRequest request) {
        return ResponseEntity.ok(bookingService.approveBooking(id, request));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(
            @RequestParam String facilityId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) String excludeBookingId) {
        return ResponseEntity.ok(
                bookingService.checkAvailability(facilityId, date, startTime, endTime, excludeBookingId));
    }

    @GetMapping("/facility/{facilityId}/date/{date}")
    public ResponseEntity<List<BookingResponse>> getBookingsByFacilityAndDate(
            @PathVariable String facilityId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getBookingsByFacilityAndDate(facilityId, date));
    }
}
