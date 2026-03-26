package com.example.demo.repository;

import com.example.demo.model.Facility;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.model.enums.FacilityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository  
public interface FacilityRepository extends MongoRepository<Facility, String> {

    // Find facilities by type
    List<Facility> findByType(FacilityType type);

    // Find facilities by status
    List<Facility> findByStatus(FacilityStatus status);

    // Find facilities by both type and status
    List<Facility> findByTypeAndStatus(FacilityType type, FacilityStatus status);

    // Count facilities by status
    long countByStatus(FacilityStatus status);
}