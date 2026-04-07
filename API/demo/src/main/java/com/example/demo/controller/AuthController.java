package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(@AuthenticationPrincipal OAuth2User oauthUser) {
        Map<String, Object> response = new HashMap<>();
        
        if (oauthUser == null) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }
        
        response.put("authenticated", true);
        response.put("name", oauthUser.getAttribute("name"));
        response.put("email", oauthUser.getAttribute("email"));
        response.put("picture", oauthUser.getAttribute("picture"));
        
        String email = oauthUser.getAttribute("email");
        if (email != null) {
            Optional<User> dbUser = userRepository.findByEmail(email);
            dbUser.ifPresent(user -> response.put("role", user.getRole()));
        } else {
            response.put("role", "student"); // fallback
        }
        
        return ResponseEntity.ok(response);
    }
}