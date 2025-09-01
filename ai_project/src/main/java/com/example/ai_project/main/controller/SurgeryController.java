package com.example.ai_project.main.controller;

import com.example.ai_project.main.dto.WoundResponse;
import com.example.ai_project.main.service.SurgeryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
public class SurgeryController {

    private final SurgeryService surgeryService;

    @Autowired
    public SurgeryController(SurgeryService surgeryService) {
        this.surgeryService = surgeryService;
    }

    // --- 페이지 라우팅 ---
    @GetMapping("/surgery")
    public String showSurgeryPage() {
        return "surgery";
    }

    // --- API 엔드포인트 ---
    // ⭐️ API 엔드포인트를 클라이언트와 일치하도록 수정
    @PostMapping("/api/surgery/predict") // <-- 이 부분을 수정했습니다.
    @ResponseBody
    public ResponseEntity<WoundResponse> predictWound(
            // ⭐️ @RequestParam의 이름을 FormData의 키와 일치시킴
            @RequestParam(name = "image", required = false) MultipartFile imageFile,
            @RequestParam("survey_data") String surveyData) {

        try {
            WoundResponse response;

            // 이미지가 제공되지 않았거나 비어있는 경우를 먼저 처리합니다.
            if (imageFile == null || imageFile.isEmpty()) {
                response = surgeryService.getWoundAnalysis(null, surveyData);
            } else {
                // 이미지 파일이 있는 경우, 두 인수를 모두 서비스 메소드로 전달합니다.
                response = surgeryService.getWoundAnalysis(imageFile, surveyData);
            }

            if (response != null) {
                return ResponseEntity.ok(response);
            } else {
                // 서비스에서 null을 반환하면 (AI 서버 통신 실패 등) 500 Internal Server Error를 반환합니다.
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (IOException e) {
            // 파일 처리 중 I/O 오류가 발생하면 500 오류를 반환합니다.
            System.err.println("이미지 파일 처리 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}