package com.example.ai_project.main.dto;

import java.util.List;

// AI 응답 JSON을 파싱하기 위한 클래스입니다.
// 실제 사용되지는 않지만, 나중에 JSON 응답을 객체로 바로 받고 싶을 때를 위해 만듭니다.
public class AiResponse {
    private int riskScore;
    private String riskMessage;
    private List<String> recommendedDepartments;
    private ExpectedDisease expectedDisease;

    public static class ExpectedDisease {
        private String name;
        private String urgency;
        private List<String> relatedSymptoms;
        private String recommendedDepartment;

        // Getters and Setters
    }

    // Getters and Setters
}