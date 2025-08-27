package com.example.ai_project.main.service;

import com.example.ai_project.main.dto.WoundResponse; // ⚠️ 외과 응답 DTO
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
import org.springframework.web.multipart.MultipartFile; // ⚠️ 이미지 파일을 위한 임포트

import java.io.IOException;

@Service
public class SurgeryService {

    private final RestTemplate restTemplate;

    // ⚠️ 외과 AI 서버 URL (application.properties에서 관리)
    @Value("${ai.surgery.api.url:http://127.0.0.1:5000/predict}")
    private String apiUrl;

    @Autowired
    public SurgeryService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 이미지를 받아 WoundResponse를 반환하는 메소드
    public WoundResponse getWoundAnalysis(MultipartFile imageFile) throws IOException {
        // HTTP 요청 헤더 설정 (파일 전송을 위함)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // HTTP 요청 본문(Body) 구성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // FastAPI가 파일을 인식할 수 있도록 Resource로 감싸줍니다.
        ByteArrayResource resource = new ByteArrayResource(imageFile.getBytes()) {
            @Override
            public String getFilename() {
                return imageFile.getOriginalFilename();
            }
        };
        body.add("image", resource);

        // 헤더와 본문을 합쳐서 HTTP 요청 객체 생성
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // Python 서버로 POST 요청을 보내고 결과를 WoundResponse DTO로 받음
            return restTemplate.postForObject(apiUrl, requestEntity, WoundResponse.class);
        } catch (RestClientException e) {
            System.err.println("외과 AI 서버 통신 중 오류 발생: " + e.getMessage());
            return null;
        }
    }
}