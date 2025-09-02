package com.example.ai_project.main.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class MentalCareService {

    // CES-D 20-item scoring and interpretation
    public Map<String, Object> processCESDAssessment(List<Integer> scores, String additionalInfo) {
        if (scores == null || scores.size() != 20) {
            throw new IllegalArgumentException("CES-D 평가는 20개 문항이 필요합니다.");
        }

        // 점수 범위 검증(0~3)
        for (int s : scores) {
            if (s < 0 || s > 3) {
                throw new IllegalArgumentException("각 문항 점수는 0~3 범위여야 합니다.");
            }
        }

        // Reverse score positive items (items 4, 8, 12, 16 -> index 3,7,11,15)
        Set<Integer> reverseIdx = Set.of(3, 7, 11, 15);
        int totalScore = 0;

        for (int i = 0; i < scores.size(); i++) {
            int score = scores.get(i);
            if (reverseIdx.contains(i)) {
                score = 3 - score; // Reverse scoring
            }
            totalScore += score;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalScore", totalScore);
        result.put("interpretation", interpretCESDScore(totalScore));
        result.put("recommendation", getCESDRecommendation(totalScore));
        result.put("severity", getCESDSeverity(totalScore));
        result.put("timestamp", Instant.now().toString());
        result.put("additionalInfo", additionalInfo);

        return result;
    }

    private String interpretCESDScore(int score) {
        if (score < 16) return "정상 범위";
        else if (score < 21) return "경도 우울 위험";
        else if (score < 25) return "중등도 우울 위험";
        else return "중도 우울 위험";
    }

    private String getCESDRecommendation(int score) {
        if (score < 16) {
            return "현재 우울 증상이 거의 없습니다. 규칙적인 운동과 충분한 수면을 권장합니다.";
        } else if (score < 21) {
            return "경미한 우울 증상이 관찰됩니다. 스트레스 관리와 생활 습관 개선을 시도해 보세요. 필요시 상담을 권합니다.";
        } else if (score < 25) {
            return "중등도의 우울 증상이 있습니다. 전문가와의 상담을 권장합니다.";
        } else {
            return "상당한 우울 증상이 관찰됩니다. 즉시 정신건강 전문의와 상담하시기 바랍니다.";
        }
    }

    private String getCESDSeverity(int score) {
        if (score < 16) return "normal";
        else if (score < 21) return "mild";
        else if (score < 25) return "moderate";
        else return "severe";
    }

    // AI Chat Response Generation (Mock)
    public String generateAIResponse(String userMessage, String sessionId) {
        List<String> responses = Arrays.asList(
                "그런 기분이 드시는군요. 더 자세히 말씀해 주실 수 있나요?",
                "이해합니다. 이런 상황에서는 그렇게 느끼는 것이 자연스러울 수 있어요.",
                "힘드시겠네요. 언제부터 이런 기분이 드셨나요?",
                "좋은 방법을 함께 생각해볼게요. 평소에 어떤 활동을 하면 기분이 나아지나요?",
                "충분히 이해돼요. 이런 감정은 누구에게나 올 수 있어요.",
                "지금은 잠시 깊게 호흡해 보세요. 천천히 들이마시고 내쉬는 연습이 도움이 됩니다.",
                "혼자 감당하기 어렵다면 전문가 상담을 고려해 보세요."
        );

        String lower = userMessage == null ? "" : userMessage.toLowerCase();
        if (lower.contains("우울") || lower.contains("슬프")) {
            return "우울한 감정을 느끼고 계시는군요. 혼자 견디지 마시고 주변의 도움과 전문가 상담을 고려해 보세요.";
        } else if (lower.contains("불안") || lower.contains("걱정")) {
            return "불안감이 느껴지시는군요. 깊은 호흡과 짧은 산책이 도움이 될 수 있습니다. 필요하다면 상담을 권합니다.";
        } else if (lower.contains("스트레스")) {
            return "스트레스가 높으시네요. 휴식과 수면, 가벼운 운동으로 긴장을 풀어보세요.";
        }
        return responses.get(new Random().nextInt(responses.size()));
    }

    // Get nearby mental health hospitals (Mock)
    public List<Map<String, Object>> getNearbyMentalHealthHospitals(String location) {
        List<Map<String, Object>> hospitals = new ArrayList<>();
        hospitals.add(Map.of(
                "name", "서울대학교병원 정신건강의학과",
                "address", "서울시 종로구 대학로 101",
                "phone", "02-2072-2972",
                "rating", 4.8,
                "specialty", "우울증, 불안장애",
                "distance", "2.3km"
        ));
        hospitals.add(Map.of(
                "name", "연세대학교 세브란스병원",
                "address", "서울시 서대문구 연세로 50-1",
                "phone", "02-2228-5972",
                "rating", 4.7,
                "specialty", "조현병, 조울증",
                "distance", "3.1km"
        ));
        hospitals.add(Map.of(
                "name", "삼성서울병원 정신건강의학과",
                "address", "서울시 강남구 일원로 81",
                "phone", "02-3410-3583",
                "rating", 4.6,
                "specialty", "인지치료, 심리상담",
                "distance", "5.2km"
        ));
        return hospitals;
    }

    // Save assessment result to database (stub)
    public void saveAssessmentResult(Map<String, Object> assessmentResult) {
        System.out.println("WellnessMate - Saving assessment result: " + assessmentResult);
    }
}