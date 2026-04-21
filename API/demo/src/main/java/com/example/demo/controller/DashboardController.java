package com.example.demo.controller;

import com.example.demo.dto.DashboardStats;
import com.example.demo.model.enums.BookingStatus;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.service.BookingService;
import com.example.demo.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final FacilityService facilityService;
    private final BookingService bookingService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        DashboardStats stats = DashboardStats.builder()
                .totalFacilities(facilityService.countAll())
                .activeFacilities(facilityService.countByStatus(FacilityStatus.ACTIVE))
                .totalBookings(bookingService.countAll())
                .pendingBookings(bookingService.countByStatus(BookingStatus.PENDING))
                .approvedBookings(bookingService.countByStatus(BookingStatus.APPROVED))
                .checkedInBookings(bookingService.countByStatus(BookingStatus.CHECKED_IN))
                .rejectedBookings(bookingService.countByStatus(BookingStatus.REJECTED))
                .cancelledBookings(bookingService.countByStatus(BookingStatus.CANCELLED))
                .build();
        return ResponseEntity.ok(stats);
    }
}
