package com.example.demo.controller;

import com.example.demo.dto.DashboardStats;
import com.example.demo.model.User;
import com.example.demo.model.enums.BookingStatus;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.service.BookingService;
import com.example.demo.service.CurrentUserService;
import com.example.demo.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final FacilityService facilityService;
    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats(
            @AuthenticationPrincipal OAuth2User oauthUser) {
        User currentUser = currentUserService.requireUser(oauthUser);
        boolean isAdmin = currentUser.getRole() != null
                && "admin".equalsIgnoreCase(currentUser.getRole());

        DashboardStats.DashboardStatsBuilder builder = DashboardStats.builder()
                .totalFacilities(facilityService.countAll())
                .activeFacilities(facilityService.countByStatus(FacilityStatus.ACTIVE));

        if (isAdmin) {
            builder.totalBookings(bookingService.countAll())
                    .pendingBookings(bookingService.countByStatus(BookingStatus.PENDING))
                    .approvedBookings(bookingService.countByStatus(BookingStatus.APPROVED))
                    .checkedInBookings(bookingService.countByStatus(BookingStatus.CHECKED_IN))
                    .rejectedBookings(bookingService.countByStatus(BookingStatus.REJECTED))
                    .cancelledBookings(bookingService.countByStatus(BookingStatus.CANCELLED));
        } else {
            String userId = currentUser.getId();
            builder.totalBookings(bookingService.countByUser(userId))
                    .pendingBookings(bookingService.countByUserAndStatus(userId, BookingStatus.PENDING))
                    .approvedBookings(bookingService.countByUserAndStatus(userId, BookingStatus.APPROVED))
                    .checkedInBookings(bookingService.countByUserAndStatus(userId, BookingStatus.CHECKED_IN))
                    .rejectedBookings(bookingService.countByUserAndStatus(userId, BookingStatus.REJECTED))
                    .cancelledBookings(bookingService.countByUserAndStatus(userId, BookingStatus.CANCELLED));
        }

        return ResponseEntity.ok(builder.build());
    }
}
