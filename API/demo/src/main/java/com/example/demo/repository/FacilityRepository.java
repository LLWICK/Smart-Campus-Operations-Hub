package com.example.demo.repository;

import com.example.demo.model.Facility;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.model.enums.FacilityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {

    List<Facility> findByType(FacilityType type);

    List<Facility> findByStatus(FacilityStatus status);

    List<Facility> findByTypeAndStatus(FacilityType type, FacilityStatus status);

    @Query("{ $and: ["
            + "{ $or: [ { $expr: { $eq: [?0, null] } }, { 'type': ?0 } ] },"
            + "{ $or: [ { $expr: { $eq: [?1, null] } }, { 'status': ?1 } ] },"
            + "{ $or: [ { $expr: { $eq: [?2, null] } }, { 'capacity': { $gte: ?2 } } ] },"
            + "{ $or: [ { $expr: { $eq: [?3, null] } }, { 'location': { $regex: ?3, $options: 'i' } } ] },"
            + "{ $or: [ { $expr: { $eq: [?4, null] } }, { 'name': { $regex: ?4, $options: 'i' } } ] }"
            + "] }")
    List<Facility> searchFacilities(FacilityType type, FacilityStatus status,
                                     Integer minCapacity, String location, String search);

    long countByStatus(FacilityStatus status);
}
