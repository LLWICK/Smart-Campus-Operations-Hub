package com.example.demo.model;

import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.model.enums.FacilityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalTime;

@Data 
@Builder  
@NoArgsConstructor  
@AllArgsConstructor  
@Document(collection = "facilities")  
public class Facility {

    @Id  
    private String id;

    
    private String name;
    private FacilityType type;
    private String primaryCategory;
    private int capacity;
    private String location;
    private String parentLocationId;
    private String description;

    @Builder.Default
    private boolean independentlyBookable = true; 

    @Builder.Default
    private FacilityStatus status = FacilityStatus.ACTIVE; 

    // Availability time
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;

    // Additional info
    private String imageUrl;

    @CreatedDate
    private Instant createdAt; // Auto set on create

    @LastModifiedDate
    private Instant updatedAt; // Auto update on modify
}