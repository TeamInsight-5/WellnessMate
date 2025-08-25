package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class SurgeryController {

    @GetMapping("/surgery")
    public String showSurgeryPage() {
        return "surgery"; // Renders surgery.html
    }

    @PostMapping("/api/surgery/diagnose")
    @ResponseBody
    public Map<String, Object> diagnoseSurgery(@RequestBody Map<String, Object> request) {
        // TODO: Implement the logic for AI image analysis and emergency assessment

        // This is a dummy response for now
        return Map.of(
                "riskLevel", "위험",
                "riskScore", 20,
                "maxScore", 30,
                "emergencyMessage", "생명이 위험할 수 있는 응급상황",
                "emergencyGuide", "119 신고 후 즉시 응급실 이송",
                "detailedResults", List.of(
                        Map.of("question", "어떤 종류의 외상을 입으셨나요?", "answer", "관통상", "riskScore", 5),
                        Map.of("question", "출혈의 정도는 어떠한가요?", "answer", "심한 출혈 (멈추지 않음)", "riskScore", 5),
                        Map.of("question", "통증과 움직임은 어떠한가요?", "answer", "의식 잃음", "riskScore", 6),
                        Map.of("question", "현재 상태를 확인해주세요", "answer", "빠른 호흡", "riskScore", 4)
                ),
                "recommendedDepartments", List.of(
                        Map.of("name", "응급의학과", "description", "생명 위험 응급상황으로 즉시 응급처치 필요"),
                        Map.of("name", "일반외과", "description", "열상, 골절, 이물질 제거 등 일반 외과적 처치")
                )
        );
    }
}