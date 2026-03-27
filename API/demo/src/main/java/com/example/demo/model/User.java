package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id; // Maps to your 'UID'

    private String name;
    private String email;
    private String password; // Will be empty/null if they sign in via Google OAuth
    private LocalDate dob;
    
    // Role Management
    private String role; // e.g., "STUDENT", "ADMIN", "TECHNICIAN", "LECTURER"
    private List<String> permissions; // Maps to the double-oval Permissions attribute
    
    // Sub-type specific attributes
    private String speciality; // Maps to the Technicians subtype. Will be null for other users.

    // Default Constructor
    public User() {
    }

    // Constructor for standard attributes
    public User(String name, String email, String password, LocalDate dob, String role, List<String> permissions) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.dob = dob;
        this.role = role;
        this.permissions = permissions;
    }

    // TODO: Generate Getters and Setters (Right-click -> Source Action -> Generate Getters and Setters)
}