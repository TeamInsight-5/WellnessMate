package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class InternalMedicineController {

    @GetMapping("/internalmedicine")
    public String showInternalMedicinePage() {
        return "internalmedicine"; // internalmedicine.html을 렌더링
    }

    // 증상 진단 요청을 처리할 API 엔드포인트
    @PostMapping("/api/diagnose_symptoms")
    @ResponseBody
    public Map<String, Object> diagnoseSymptoms(@RequestBody Map<String, List<String>> request) {
        List<String> symptoms = request.get("symptoms");

        // TODO: MED-002, MED-003 기능 구현
        // 1. symptoms(선택한 증상)를 기반으로 질환 후보를 찾습니다.
        // 2. 질환 후보에 대한 진료과, 응급도를 결정합니다.

        // 현재는 예시 데이터 반환
        return Map.of(
                //임시 삭제예정)
                "riskScore", 9,
                "riskMessage", "의료진 상담이 필요한 상태입니다.",
                "recommendedDepartments", List.of("내분비내과", "일반내과"),
                "expectedDisease", Map.of(
                        "name", "당뇨병",
                        "urgency", "경고",
                        "relatedSymptoms", List.of("빈뇨", "갈증", "피로감"),
                        "recommendedDepartment", "내분비내과"
                )
        );
    }
}