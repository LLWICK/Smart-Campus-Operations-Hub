package com.example.demo.dto;

import com.example.demo.model.Facility;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.model.enums.FacilityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class FacilityResponse {
   
    private String id;
    private String name;
    private FacilityType type;
    private String primaryCategory;
    private int capacity;
    private String location;
    private String parentLocationId;
    private String description;
    private boolean independentlyBookable;
    private FacilityStatus status;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private String imageUrl;
    private Instant createdAt;

    
    private Instant updatedAt;

    public static FacilityResponse fromEntity(Facility facility) {

        // Using Builder pattern to map entity fields to DTO fields
        return FacilityResponse.builder()
                .id(facility.getId()) // Mapping id
                .name(facility.getName()) // Mapping name
                .type(facility.getType()) // Mapping type
                .primaryCategory(facility.getPrimaryCategory()) // Mapping category
                .capacity(facility.getCapacity()) // Mapping capacity
                .location(facility.getLocation()) // Mapping location
                .parentLocationId(facility.getParentLocationId()) // Mapping parent location
                .description(facility.getDescription()) // Mapping description
                .independentlyBookable(facility.isIndependentlyBookable()) // Mapping booking flag
                .status(facility.getStatus()) // Mapping status
                .availabilityStart(facility.getAvailabilityStart()) // Mapping start time
                .availabilityEnd(facility.getAvailabilityEnd()) // Mapping end time
                .imageUrl(facility.getImageUrl()) // Mapping image URL
                .createdAt(facility.getCreatedAt()) // Mapping created timestamp
                .updatedAt(facility.getUpdatedAt()) // Mapping updated timestamp
                .build(); // Building the DTO object
    }
}