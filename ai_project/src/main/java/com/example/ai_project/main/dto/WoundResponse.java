package com.example.ai_project.main.dto;

import lombok.Data;

@Data // Getter, Setter 등을 자동으로 만들어주는 Lombok 어노테이션
public class WoundResponse {
    private String name;
    private String risk;
    private String first_aid;
    private String expected_disease;
    private String recommended_department;
}