package com.example.ai_project.main.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "signup")  // 테이블명 지정 (DB에 있는 테이블과 매칭)
@Getter
@Setter
@Data
public class SignupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private String userPass;

    private String email;

    private String userName;

    private boolean agreement;
}