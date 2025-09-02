package com.example.ai_project.main.controller;

import com.example.ai_project.main.service.MentalCareService; // ✅ 올바른 패키지로 수정
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mental-care")
public class MentalCareController {

    private final MentalCareService mentalCareService;

    // ✅ 생성자 주입
    public MentalCareController(MentalCareService mentalCareService) {
        this.mentalCareService = mentalCareService;
    }

    @PostMapping("/cesd-assessment")
    public ResponseEntity<?> submitCESDAssessment(@RequestBody Map<String, Object> body) {
        try {
            // 안전하게 파싱: Number → int
            List<Integer> scores = Optional.ofNullable(body.get("scores"))
                    .map(v -> (List<?>) v)
                    .orElseThrow(() -> new IllegalArgumentException("scores가 필요합니다."))
                    .stream()
                    .map(n -> ((Number) n).intValue())
                    .collect(Collectors.toList());

            String additionalInfo = (String) body.getOrDefault("additionalInfo", null);

            Map<String, Object> result = mentalCareService.processCESDAssessment(scores, additionalInfo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/ai-chat")
    public ResponseEntity<?> processAIChat(@RequestBody Map<String, Object> chatData) {
        try {
            String userMessage = Objects.toString(chatData.get("message"), "");
            String sessionId = Objects.toString(chatData.get("sessionId"), null);

            String aiResponse = mentalCareService.generateAIResponse(userMessage, sessionId);
            return ResponseEntity.ok(Map.of("response", aiResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "AI 응답 생성 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/hospitals")
    public ResponseEntity<?> getMentalHealthHospitals(@RequestParam(required = false) String location) {
        try {
            return ResponseEntity.ok(mentalCareService.getNearbyMentalHealthHospitals(location));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "병원 조회 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/save-assessment")
    public ResponseEntity<?> saveAssessmentResult(@RequestBody Map<String, Object> assessmentResult) {
        try {
            mentalCareService.saveAssessmentResult(assessmentResult);
            return ResponseEntity.ok(Map.of("status", "success", "message", "평가 결과가 저장되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "결과 저장 중 오류가 발생했습니다."));
        }
    }

    @Value("${kakao.maps.app-key}")
    private String kakaoAppKey;

    @GetMapping("/mental-care")
    public String mentalCare(Model model){
        model.addAttribute("kakaoAppKey", kakaoAppKey);
        return "main/mentalCare"; // 템플릿 경로
    }
}