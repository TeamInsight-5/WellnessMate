package com.example.ai_project.main.DTO;

import java.util.List;

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
}
