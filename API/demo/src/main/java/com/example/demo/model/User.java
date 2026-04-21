package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "users")
public class User {
    //Support for multiple authentication providers (e.g., local, Google OAuth)
    public enum AuthProvider {
        LOCAL, GOOGLE
    }


    @Id
    private String id; 

    private String name;
    private String email;
    
    // --- Basic Details ---
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String gender;

    // Will be null if authProvider is GOOGLE
    private String password; 
    private LocalDate dob;
    
    // --- Specific Details ---
    private String identificationNumber; // System generated
    private String degreeProgram; // For students
    private Double salary; // For lecturers and admins
    private String speciality; // For technicians
    
    // --- OAuth 2.0 Specific Fields ---
    private AuthProvider authProvider; 
    private String providerId; // Google's unique identifier for the user (the 'sub' claim)
    private String profileImageUrl; // The Google avatar URL to display in your React UI

    // --- Role Management ---
    private String role; 
    private List<String> permissions; 

    // Default Constructor
    public User() {
    }

    // Constructor for Local Registration
    public User(String firstName, String lastName, String email, String password, LocalDate dob, String role, List<String> permissions) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = firstName + " " + lastName;
        this.email = email;
        this.password = password;
        this.dob = dob;
        this.role = role;
        this.permissions = permissions;
        this.authProvider = AuthProvider.LOCAL;
    }

    // Constructor for Google OAuth Registration
    public User(String firstName, String lastName, String email, String providerId, String profileImageUrl, String role, List<String> permissions) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = firstName + " " + lastName;
        this.email = email;
        this.providerId = providerId;
        this.profileImageUrl = profileImageUrl;
        this.role = role;
        this.permissions = permissions;
        this.authProvider = AuthProvider.GOOGLE;
        // Password and DOB might be null initially for OAuth users
    }



}