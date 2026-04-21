package com.example.demo.service;

import com.example.demo.dto.AvailabilityResponse;
import com.example.demo.dto.BookingRequest;
import com.example.demo.dto.BookingResponse;
import com.example.demo.dto.StatusUpdateRequest;
import com.example.demo.exception.BookingConflictException;
import com.example.demo.exception.InvalidOperationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Booking;
import com.example.demo.model.Facility;
import com.example.demo.model.User;
import com.example.demo.model.enums.BookingStatus;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationService notificationService;

    public List<BookingResponse> getAllBookings(String userId, BookingStatus status,
                                                  String facilityId, LocalDate date, User currentUser) {
        String effectiveUserId = isAdmin(currentUser) ? userId : currentUser.getId();

        Query query = new Query();

        if (effectiveUserId != null && !effectiveUserId.isBlank()) {
            query.addCriteria(Criteria.where("userId").is(effectiveUserId));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (facilityId != null && !facilityId.isBlank()) {
            query.addCriteria(Criteria.where("facilityId").is(facilityId));
        }
        if (date != null) {
            query.addCriteria(Criteria.where("date").is(date));
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        List<Booking> bookings = mongoTemplate.find(query, Booking.class);
        return bookings.stream().map(BookingResponse::fromEntity).toList();
    }

    public BookingResponse getBookingById(String id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        assertBookingAccess(booking, currentUser);
        return BookingResponse.fromEntity(booking);
    }

    public BookingResponse createBooking(BookingRequest request, User booker) {
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", request.getFacilityId()));

        if (facility.getStatus() == FacilityStatus.OUT_OF_SERVICE) {
            throw new InvalidOperationException("Cannot book a facility that is out of service");
        }

        validateAttendeesVsCapacity(request.getExpectedAttendees(), facility);
        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateWithinAvailability(request.getStartTime(), request.getEndTime(), facility);

        List<Booking> conflicts = bookingRepository.findConflicts(
                request.getFacilityId(), request.getDate(),
                request.getStartTime(), request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflicts with existing booking(s)", conflicts);
        }

        Booking booking = Booking.builder()
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .userId(booker.getId())
                .userName(booker.getName())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        try {
            notificationService.createNotification(
                    saved.getUserId(),
                    "BOOKING_CREATED",
                    "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been submitted and is pending approval.",
                    saved.getId(),
                    "BOOKING"
            );
        } catch (Exception e) {
            log.error("Failed to create notification for booking {}: {}", saved.getId(), e.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    public BookingResponse updateBooking(String id, BookingRequest request, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        assertBookingAccess(booking, currentUser);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidOperationException("Only PENDING bookings can be updated");
        }

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", request.getFacilityId()));

        validateAttendeesVsCapacity(request.getExpectedAttendees(), facility);
        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateWithinAvailability(request.getStartTime(), request.getEndTime(), facility);

        List<Booking> conflicts = bookingRepository.findConflictsExcluding(
                request.getFacilityId(), request.getDate(),
                request.getStartTime(), request.getEndTime(), id);

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflicts with existing booking(s)", conflicts);
        }

        booking.setFacilityId(facility.getId());
        booking.setFacilityName(facility.getName());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        Booking saved = bookingRepository.save(booking);

        try {
            boolean isAdminAction = !currentUser.getId().equals(saved.getUserId());
            String message = isAdminAction
                    ? "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been updated by an administrator."
                    : "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been updated.";

            notificationService.createNotification(
                    saved.getUserId(),
                    "BOOKING_UPDATED",
                    message,
                    saved.getId(),
                    "BOOKING"
            );
        } catch (Exception e) {
            log.error("Failed to create notification for booking {}: {}", saved.getId(), e.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    public void cancelBooking(String id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        assertBookingAccess(booking, currentUser);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidOperationException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new InvalidOperationException("Cannot cancel a rejected booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        try {
            boolean isAdminAction = !currentUser.getId().equals(saved.getUserId());
            String message = isAdminAction
                    ? "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been cancelled by an administrator."
                    : "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been cancelled.";

            notificationService.createNotification(
                    saved.getUserId(),
                    "BOOKING_CANCELLED",
                    message,
                    saved.getId(),
                    "BOOKING"
            );
        } catch (Exception e) {
            log.error("Failed to create notification for booking {}: {}", saved.getId(), e.getMessage());
        }
    }

    public BookingResponse approveBooking(String id, StatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidOperationException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        if (request != null && request.getReason() != null) {
            booking.setAdminReason(request.getReason());
        }

        Booking saved = bookingRepository.save(booking);

        try {
            notificationService.createNotification(
                    saved.getUserId(),
                    "BOOKING_APPROVED",
                    "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been approved.",
                    saved.getId(),
                    "BOOKING"
            );
        } catch (Exception e) {
            log.error("Failed to create notification for booking {}: {}", saved.getId(), e.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    public BookingResponse rejectBooking(String id, StatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidOperationException("Only PENDING bookings can be rejected");
        }

        if (request == null || request.getReason() == null || request.getReason().isBlank()) {
            throw new InvalidOperationException("A reason is required when rejecting a booking");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(request.getReason());

        Booking saved = bookingRepository.save(booking);

        try {
            notificationService.createNotification(
                    saved.getUserId(),
                    "BOOKING_REJECTED",
                    "Your booking for " + saved.getFacilityName() + " on " + saved.getDate() + " has been rejected. Reason: " + request.getReason(),
                    saved.getId(),
                    "BOOKING"
            );
        } catch (Exception e) {
            log.error("Failed to create notification for booking {}: {}", saved.getId(), e.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    public AvailabilityResponse checkAvailability(String facilityId, LocalDate date,
                                                  LocalTime startTime, LocalTime endTime,
                                                  String excludeBookingId) {
        facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", facilityId));

        validateTimeRange(startTime, endTime);

        List<Booking> conflicts;
        if (excludeBookingId != null && !excludeBookingId.isBlank()) {
            conflicts = bookingRepository.findConflictsExcluding(
                    facilityId, date, startTime, endTime, excludeBookingId);
        } else {
            conflicts = bookingRepository.findConflicts(facilityId, date, startTime, endTime);
        }
        List<BookingResponse> conflictResponses = conflicts.stream()
                .map(BookingResponse::fromEntity).toList();

        return AvailabilityResponse.builder()
                .available(conflicts.isEmpty())
                .conflictingBookings(conflictResponses)
                .build();
    }

    public long countByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }

    public long countAll() {
        return bookingRepository.count();
    }

    public List<BookingResponse> getBookingsByFacilityAndDate(String facilityId, LocalDate date) {
        return bookingRepository.findByFacilityIdAndDateOrderByStartTimeAsc(facilityId, date)
                .stream().map(BookingResponse::fromEntity).toList();
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && "admin".equalsIgnoreCase(user.getRole());
    }

    private void assertBookingAccess(Booking booking, User user) {
        if (isAdmin(user)) {
            return;
        }
        if (booking.getUserId() != null && booking.getUserId().equals(user.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this booking");
    }

    private void validateAttendeesVsCapacity(int expectedAttendees, Facility facility) {
        if (expectedAttendees > facility.getCapacity()) {
            throw new InvalidOperationException(
                    "Expected attendees cannot exceed facility capacity (" + facility.getCapacity() + ")");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new InvalidOperationException("End time must be after start time");
        }
    }

    private void validateWithinAvailability(LocalTime startTime, LocalTime endTime, Facility facility) {
        if (startTime.isBefore(facility.getAvailabilityStart()) ||
                endTime.isAfter(facility.getAvailabilityEnd())) {
            throw new InvalidOperationException(
                    String.format("Booking time must be within facility availability hours: %s - %s",
                            facility.getAvailabilityStart(), facility.getAvailabilityEnd()));
        }
    }
}
