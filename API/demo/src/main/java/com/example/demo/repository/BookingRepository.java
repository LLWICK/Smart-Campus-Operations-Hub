package com.example.demo.repository;

import com.example.demo.model.Booking;
import com.example.demo.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findByFacilityIdOrderByDateAscStartTimeAsc(String facilityId);

    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, BookingStatus status);

    List<Booking> findByFacilityIdAndDateOrderByStartTimeAsc(String facilityId, LocalDate date);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("{'facilityId': ?0, 'date': ?1, 'status': {$in: ['PENDING','APPROVED','CHECKED_IN']}, "
            + "'startTime': {$lt: ?3}, 'endTime': {$gt: ?2}}")
    List<Booking> findConflicts(String facilityId, LocalDate date,
                                LocalTime startTime, LocalTime endTime);

    @Query("{'facilityId': ?0, 'date': ?1, 'status': {$in: ['PENDING','APPROVED','CHECKED_IN']}, "
            + "'startTime': {$lt: ?3}, 'endTime': {$gt: ?2}, '_id': {$ne: ?4}}")
    List<Booking> findConflictsExcluding(String facilityId, LocalDate date,
                                          LocalTime startTime, LocalTime endTime, String excludeId);

    long countByStatus(BookingStatus status);

    Optional<Booking> findByCheckInCode(String checkInCode);
}
