package com.example.demo.service;

import com.example.demo.dto.FacilityRequest;
import com.example.demo.dto.FacilityResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Facility;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.model.enums.FacilityType;
import com.example.demo.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service  
@RequiredArgsConstructor  
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final MongoTemplate mongoTemplate;

    // Get all facilities with optional filters
    public List<FacilityResponse> getAllFacilities(FacilityType type, FacilityStatus status, Integer minCapacity, String location, String search) {
        Query query = new Query();

        if (type != null) {
            query.addCriteria(Criteria.where("type").is(type));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }
        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }
        if (search != null && !search.isBlank()) {
            query.addCriteria(Criteria.where("name").regex(search, "i"));
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt")); // Sort by latest

        List<Facility> facilities = mongoTemplate.find(query, Facility.class);
        return facilities.stream().map(FacilityResponse::fromEntity).toList(); // Convert to DTO
    }

    // Get single facility by ID
    public FacilityResponse getFacilityById(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));
        return FacilityResponse.fromEntity(facility);
    }

    // Create new facility
    public FacilityResponse createFacility(FacilityRequest request) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .type(request.getType())
                .primaryCategory(request.getPrimaryCategory())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .parentLocationId(request.getParentLocationId())
                .description(request.getDescription())
                .independentlyBookable(request.getIndependentlyBookable() != null ? request.getIndependentlyBookable() : true)
                .availabilityStart(request.getAvailabilityStart())
                .availabilityEnd(request.getAvailabilityEnd())
                .imageUrl(request.getImageUrl())
                .status(FacilityStatus.ACTIVE) // Default status
                .build();

        Facility saved = facilityRepository.save(facility);
        return FacilityResponse.fromEntity(saved);
    }

    // Update existing facility
    public FacilityResponse updateFacility(String id, FacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        facility.setName(request.getName());
        facility.setType(request.getType());
        facility.setPrimaryCategory(request.getPrimaryCategory());
        facility.setCapacity(request.getCapacity());
        facility.setLocation(request.getLocation());
        facility.setParentLocationId(request.getParentLocationId());
        facility.setDescription(request.getDescription());

        if (request.getIndependentlyBookable() != null) {
            facility.setIndependentlyBookable(request.getIndependentlyBookable());
        }

        facility.setAvailabilityStart(request.getAvailabilityStart());
        facility.setAvailabilityEnd(request.getAvailabilityEnd());
        facility.setImageUrl(request.getImageUrl());

        Facility saved = facilityRepository.save(facility);
        return FacilityResponse.fromEntity(saved);
    }

    // Delete facility by ID
    public void deleteFacility(String id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Facility", "id", id);
        }
        facilityRepository.deleteById(id);
    }

    // Toggle facility status (ACTIVE ↔ OUT_OF_SERVICE)
    public FacilityResponse toggleStatus(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        FacilityStatus newStatus = facility.getStatus() == FacilityStatus.ACTIVE
                ? FacilityStatus.OUT_OF_SERVICE
                : FacilityStatus.ACTIVE;

        facility.setStatus(newStatus);

        Facility saved = facilityRepository.save(facility);
        return FacilityResponse.fromEntity(saved);
    }

    // Count facilities by status
    public long countByStatus(FacilityStatus status) {
        return facilityRepository.countByStatus(status);
    }

    // Count all facilities
    public long countAll() {
        return facilityRepository.count();
    }
}
