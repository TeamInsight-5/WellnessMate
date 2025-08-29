package com.example.ai_project.main.service;

import com.example.ai_project.main.dto.WoundResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;

@Service
public class SurgeryService {

    private final RestTemplate restTemplate;

    // AI 서버 URL (Flask/FastAPI 서버)
    @Value("${ai.surgery.api.url:http://127.0.0.1:8001/api/surgery/predict}")
    private String apiUrl;

    @Autowired
    public SurgeryService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ⭐️ 매개변수에 surveyData 추가
    public WoundResponse getWoundAnalysis(MultipartFile imageFile, String surveyData) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // ⭐️ 이미지 파일이 있으면 body에 추가
        if (imageFile != null && !imageFile.isEmpty()) {
            ByteArrayResource resource = new ByteArrayResource(imageFile.getBytes()) {
                @Override
                public String getFilename() {
                    return imageFile.getOriginalFilename();
                }
            };
            body.add("image", resource);
        }

        // ⭐️ 설문 데이터 추가
        body.add("survey_data", surveyData);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(apiUrl, requestEntity, WoundResponse.class);
        } catch (RestClientException e) {
            System.err.println("외과 AI 서버 통신 중 오류 발생: " + e.getMessage());
            return null;
        }
    }
}