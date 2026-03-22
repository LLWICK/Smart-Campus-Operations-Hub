package com.example.demo.repository;

import com.example.demo.model.Booking;
import com.example.demo.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByFacilityId(String facilityId);

    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    @Query("{'facilityId': ?0, 'date': ?1, 'status': {$in: ['PENDING','APPROVED']}, "
            + "'startTime': {$lt: ?3}, 'endTime': {$gt: ?2}}")
    List<Booking> findConflicts(String facilityId, LocalDate date,
                                LocalTime startTime, LocalTime endTime);

    @Query("{'facilityId': ?0, 'date': ?1, 'status': {$in: ['PENDING','APPROVED']}, "
            + "'startTime': {$lt: ?3}, 'endTime': {$gt: ?2}, '_id': {$ne: ?4}}")
    List<Booking> findConflictsExcluding(String facilityId, LocalDate date,
                                          LocalTime startTime, LocalTime endTime, String excludeId);

    List<Booking> findByFacilityIdAndDate(String facilityId, LocalDate date);

    long countByStatus(BookingStatus status);

    @Query("{ $and: ["
            + "{ $or: [ { $expr: { $eq: [?0, null] } }, { 'userId': ?0 } ] },"
            + "{ $or: [ { $expr: { $eq: [?1, null] } }, { 'status': ?1 } ] },"
            + "{ $or: [ { $expr: { $eq: [?2, null] } }, { 'facilityId': ?2 } ] },"
            + "{ $or: [ { $expr: { $eq: [?3, null] } }, { 'date': ?3 } ] }"
            + "] }")
    List<Booking> searchBookings(String userId, BookingStatus status,
                                  String facilityId, LocalDate date);
}
