package com.example.ai_project.main.repository;

import com.example.ai_project.main.entity.SignupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<SignupEntity, Long> {
    // 기존 메서드 (단건 조회 - 현재 문제 발생)
    Optional<SignupEntity> findByEmail(String email);

    // 추가할 메서드 (다건 조회 - 중복 데이터 처리)
    List<SignupEntity> findAllByEmail(String email);

    // 또는 첫 번째 결과만 가져오기 (추천)
    Optional<SignupEntity> findFirstByEmail(String email);


    // 아이디와 이메일이 모두 일치하는 사용자 찾기 (추가)
    Optional<SignupEntity> findByUserIdAndEmail(String userId, String email);


}
