package com.example.ai_project.memberManager;

import org.springframework.stereotype.Service;

@Service
public class SignService {

    private final SignupRepository signupRepository;

    public SignService(SignupRepository signupRepository) {
        this.signupRepository = signupRepository;
    }

    public SignupEntity save(SignupEntity entity) {
        if(signupRepository.findByUserId(entity.getUserId()).isPresent()){
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        return signupRepository.save(entity);
    }

    // 1. 로그인 메서드 추가
    public SignupEntity login(String userId, String userPass){
        return signupRepository.findByUserIdAndUserPass(userId, userPass).orElse(null);
    }
}

