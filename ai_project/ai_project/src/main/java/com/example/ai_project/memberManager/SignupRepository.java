package com.example.ai_project.memberManager;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SignupRepository extends JpaRepository<SignupEntity, Long> {
    Optional<SignupEntity> findByUserId(String userId);

    Optional<SignupEntity> findByUserIdAndUserPass(String userId, String userPass);
}