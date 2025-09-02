package com.example.ai_project.main.service;

import com.example.ai_project.main.entity.SignupEntity;
import com.example.ai_project.main.repository.SignupRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final SignupRepository signupRepository;

    public CustomUserDetailsService(SignupRepository signupRepository) {
        this.signupRepository = signupRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        SignupEntity user = signupRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        return new org.springframework.security.core.userdetails.User(
                user.getUserId(),
                user.getUserPass(),
                Collections.emptyList() // 역할(role) 또는 권한(authority)을 여기에 추가할 수 있습니다.
        );
    }
}