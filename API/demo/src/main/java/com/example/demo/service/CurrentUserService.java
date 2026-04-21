package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User requireUser(OAuth2User oauthUser) {
        if (oauthUser == null) {
            throw new AccessDeniedException("Not authenticated");
        }
        String email = oauthUser.getAttribute("email");
        if (email == null) {
            throw new AccessDeniedException("Missing email on account");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("User is not enrolled"));
    }
}
