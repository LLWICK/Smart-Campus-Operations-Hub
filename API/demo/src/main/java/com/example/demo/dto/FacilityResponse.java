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
        return FacilityResponse.builder()
                .id(facility.getId())
                .name(facility.getName())
                .type(facility.getType())
                .primaryCategory(facility.getPrimaryCategory())
                .capacity(facility.getCapacity())
                .location(facility.getLocation())
                .parentLocationId(facility.getParentLocationId())
                .description(facility.getDescription())
                .independentlyBookable(facility.isIndependentlyBookable())
                .status(facility.getStatus())
                .availabilityStart(facility.getAvailabilityStart())
                .availabilityEnd(facility.getAvailabilityEnd())
                .imageUrl(facility.getImageUrl())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }
}
