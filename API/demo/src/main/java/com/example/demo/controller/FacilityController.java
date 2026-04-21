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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController  
@RequestMapping("/api/facilities")  
@RequiredArgsConstructor  
public class FacilityController {

    private final FacilityService facilityService;

    // List facilities — any authenticated user can browse the catalog
    @GetMapping
    public ResponseEntity<List<FacilityResponse>> getAllFacilities(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(facilityService.getAllFacilities(type, status, minCapacity, location, search));
    }

    // Get facility by ID — any authenticated user
    @GetMapping("/{id}")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    // Create new facility — admins only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody FacilityRequest request) {
        FacilityResponse created = facilityService.createFacility(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update existing facility — admins only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> updateFacility(
            @PathVariable String id,
            @Valid @RequestBody FacilityRequest request) {
        return ResponseEntity.ok(facilityService.updateFacility(id, request));
    }

    // Delete facility by ID — admins only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }

    // Toggle facility status (ACTIVE ↔ OUT_OF_SERVICE) — admins only
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> toggleStatus(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.toggleStatus(id));
    }
}