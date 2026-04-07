package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enrollUser(@RequestBody User enrollmentRequest) {
        if (enrollmentRequest.getEmail() == null || enrollmentRequest.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required for Google OAuth enrolment.");
        }
        
        Optional<User> existingUser = userRepository.findByEmail(enrollmentRequest.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("User already exists with this email.");
        }

        User newUser = new User();
        newUser.setEmail(enrollmentRequest.getEmail());
        newUser.setName(enrollmentRequest.getName());
        newUser.setRole(enrollmentRequest.getRole());
        
        // This marks them as pending a Google login since providerId/picture are empty
        User savedUser = userRepository.save(newUser);
        
        return ResponseEntity.ok(savedUser);
    }
}
