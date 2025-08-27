package com.example.ai_project.main.service;

import com.example.ai_project.main.entity.SignupEntity;
import com.example.ai_project.main.repository.SignupRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SignService {

    private final SignupRepository signupRepository;
    private final PasswordEncoder passwordEncoder;

    public SignService(SignupRepository signupRepository, PasswordEncoder passwordEncoder) {
        this.signupRepository = signupRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SignupEntity save(SignupEntity entity) {
        if(signupRepository.findByUserId(entity.getUserId()).isPresent()){
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        // 비밀번호를 암호화하여 저장
        entity.setUserPass(passwordEncoder.encode(entity.getUserPass()));
        return signupRepository.save(entity);
    }
}