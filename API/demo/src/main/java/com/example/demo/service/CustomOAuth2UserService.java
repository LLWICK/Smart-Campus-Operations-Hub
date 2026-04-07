package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        String providerId = oauth2User.getAttribute("sub");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User dbUser;

        if (existingUser.isEmpty()) {
            dbUser = new User(
                name,
                email,
                providerId,
                picture,
                "student", 
                List.of()
            );
            dbUser = userRepository.save(dbUser);
        } else {
            dbUser = existingUser.get();
            boolean updated = false;
            
            if (dbUser.getProviderId() == null) {
                dbUser.setProviderId(providerId);
                updated = true;
            }
            if (dbUser.getProfileImageUrl() == null) {
                dbUser.setProfileImageUrl(picture);
                updated = true;
            }
            if (dbUser.getAuthProvider() == null) {
                dbUser.setAuthProvider(User.AuthProvider.GOOGLE);
                updated = true;
            }
            
            if (updated) {
                dbUser = userRepository.save(dbUser);
            }
        }

        List<GrantedAuthority> authorities = new ArrayList<>(oauth2User.getAuthorities());
        if (dbUser.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + dbUser.getRole().toUpperCase()));
        }

        // Return a customized OAuth2User that includes the Spring Security DB roles
        // We use "sub" as the name attribute key because it's standard for Google
        return new DefaultOAuth2User(authorities, oauth2User.getAttributes(), "sub");
    }
}
