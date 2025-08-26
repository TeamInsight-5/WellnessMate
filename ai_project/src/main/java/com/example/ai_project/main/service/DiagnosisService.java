package com.example.ai_project.main.service;

import com.example.ai_project.main.dto.SurveyData;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate; // ⚠️ RestTemplate 임포트
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class DiagnosisService {

    // ⚠️ ChatClient 대신 RestTemplate 사용
    private final RestTemplate restTemplate;

    // ⚠️ 외부 AI API 서버의 URL
    @Value("${ai.api.url:http://localhost:8000/diagnose}")
    private String apiUrl;

    @Autowired // ⚠️ 의존성 주입을 위한 생성자
    public DiagnosisService() {
        this.restTemplate = new RestTemplate();
    }

    public String getAiDiagnosis(SurveyData surveyData) {
        // ⚠️ SurveyData 객체를 외부 API로 전송
        // 외부 API가 JSON 문자열을 반환할 것입니다.
        return restTemplate.postForObject(apiUrl, surveyData, String.class);
    }
}