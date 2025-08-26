package com.example.ai_project.main.controller;

import com.example.ai_project.main.dto.SurveyData;
import com.example.ai_project.main.service.DiagnosisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // API 전용 컨트롤러
@RequestMapping("/internal-medicine")
public class InternalMedicineController {

    private final DiagnosisService diagnosisService;

    public InternalMedicineController(DiagnosisService diagnosisService) {
        this.diagnosisService = diagnosisService;
    }

    // ⚠️ GET 메서드 삭제 또는 분리

    @PostMapping("/diagnose")
    public ResponseEntity<String> diagnoseSymptoms(@RequestBody SurveyData surveyData) {
        String aiResponse = diagnosisService.getAiDiagnosis(surveyData);
        return ResponseEntity.ok(aiResponse);
    }
}