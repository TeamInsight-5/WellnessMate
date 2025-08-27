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

// 💡 @Controller는 HTML 페이지를 반환하고, @RestController는 데이터(JSON)를 반환합니다.
// 여기서는 두 가지 역할을 모두 하므로 @Controller를 사용하고 API 메소드에 @ResponseBody를 붙입니다.
@Controller
public class SurgeryController {

    private final SurgeryService surgeryService;

    // 💡 @Autowired를 통해 SurgeryService를 주입받습니다.
    @Autowired
    public SurgeryController(SurgeryService surgeryService) {
        this.surgeryService = surgeryService;
    }

    // --- 페이지 라우팅 ---
    @GetMapping("/surgery")
    public String showSurgeryPage() {
        // templates/surgery.html 파일을 렌더링해서 보여줍니다.
        return "surgery";
    }

    // --- API 엔드포인트 ---
    // 💡 이미지 파일을 받는 API로 수정했습니다.
    @PostMapping("/api/surgery/predict")
    @ResponseBody // 💡 이 메소드는 HTML이 아닌 JSON 데이터를 반환함을 명시합니다.
    public ResponseEntity<WoundResponse> predictWound(@RequestParam("image") MultipartFile imageFile) {
        // 💡 @RequestParam("image") : 'image'라는 이름으로 들어오는 파일 데이터를 받습니다.

        if (imageFile.isEmpty()) {
            // 이미지가 비어있을 경우 400 Bad Request 오류를 반환합니다.
            return ResponseEntity.badRequest().build();
        }

        try {
            // SurgeryService를 호출하여 AI 분석을 요청합니다.
            WoundResponse response = surgeryService.getWoundAnalysis(imageFile);

            if (response != null) {
                // 성공적으로 응답을 받으면 200 OK 상태와 함께 결과를 반환합니다.
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