package com.example.demo.controller;

import com.example.demo.dto.FacilityRequest;
import com.example.demo.dto.FacilityResponse;
import com.example.demo.model.enums.FacilityStatus;
import com.example.demo.model.enums.FacilityType;
import com.example.demo.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController  
@RequestMapping("/api/facilities")  
@RequiredArgsConstructor  
public class FacilityController {

    private final FacilityService facilityService;

    
    @GetMapping
    public ResponseEntity<List<FacilityResponse>> getAllFacilities(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(facilityService.getAllFacilities(type, status, minCapacity, location, search));
    }

    // Get facility by ID
    @GetMapping("/{id}")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    // Create new facility
    @PostMapping
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody FacilityRequest request) {
        FacilityResponse created = facilityService.createFacility(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update existing facility
    @PutMapping("/{id}")
    public ResponseEntity<FacilityResponse> updateFacility(
            @PathVariable String id,
            @Valid @RequestBody FacilityRequest request) {
        return ResponseEntity.ok(facilityService.updateFacility(id, request));
    }

    // Delete facility by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }

    // Toggle facility status (ACTIVE ↔ OUT_OF_SERVICE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<FacilityResponse> toggleStatus(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.toggleStatus(id));
    }
}