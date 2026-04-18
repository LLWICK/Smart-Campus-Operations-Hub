package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.time.Year;
import java.util.Random;

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
        newUser.setFirstName(enrollmentRequest.getFirstName());
        newUser.setLastName(enrollmentRequest.getLastName());
        
        String fName = enrollmentRequest.getFirstName() != null ? enrollmentRequest.getFirstName() : "";
        String lName = enrollmentRequest.getLastName() != null ? enrollmentRequest.getLastName() : "";
        newUser.setName((fName + " " + lName).trim());
        
        newUser.setRole(enrollmentRequest.getRole());
        newUser.setPhoneNumber(enrollmentRequest.getPhoneNumber());
        newUser.setGender(enrollmentRequest.getGender());
        newUser.setDob(enrollmentRequest.getDob());
        newUser.setDegreeProgram(enrollmentRequest.getDegreeProgram());
        newUser.setSalary(enrollmentRequest.getSalary());
        newUser.setSpeciality(enrollmentRequest.getSpeciality());

        // Identification Number Generation
        String prefix = "ST"; 
        String role = enrollmentRequest.getRole() != null ? enrollmentRequest.getRole().toLowerCase() : "student";
        
        if (role.equals("student")) {
            String degree = enrollmentRequest.getDegreeProgram();
            if (degree != null) {
                if (degree.equalsIgnoreCase("Information Technology")) prefix = "IT";
                else if (degree.equalsIgnoreCase("Engineering")) prefix = "En";
                else if (degree.equalsIgnoreCase("Business")) prefix = "BI";
                else if (degree.equalsIgnoreCase("Science")) prefix = "SC";
            }
        } else if (role.equals("lecturer")) {
            prefix = "LE";
        } else if (role.equals("admin")) {
            prefix = "AD";
        } else if (role.equals("technician")) {
            prefix = "TE";
        }

        String yearStr = String.valueOf(Year.now().getValue()).substring(2);
        Random random = new Random();
        String generatedId;
        
        do {
            int randomNum = random.nextInt(100000); 
            String randomStr = String.format("%05d", randomNum);
            generatedId = prefix + yearStr + randomStr;
        } while (userRepository.existsByIdentificationNumber(generatedId));
        
        newUser.setIdentificationNumber(generatedId);
        
        // This marks them as pending a Google login since providerId/picture are empty
        User savedUser = userRepository.save(newUser);
        
        return ResponseEntity.ok(savedUser);
    }
}
