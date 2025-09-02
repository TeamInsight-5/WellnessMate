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
    // 비밀번호 업데이트 메서드
    public void updatePassword(String userId, String newPassword) {
        // 1. 사용자 조회
        SignupEntity user = signupRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 새 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(newPassword);

        // 3. 비밀번호 설정
        user.setUserPass(encodedPassword);

        // 4. DB에 저장
        signupRepository.save(user);
    }
}