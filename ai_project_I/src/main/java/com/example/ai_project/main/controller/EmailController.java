package com.example.ai_project.main.controller;

import com.example.ai_project.main.entity.SignupEntity;
import com.example.ai_project.main.repository.UserRepository;
import com.example.ai_project.main.service.EmailService;
import com.example.ai_project.main.service.SignService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final SignService signService;

    @PostMapping(value = "/send-code", produces = "text/plain; charset=UTF-8")
    public ResponseEntity<String> sendCode(@RequestParam String email) {
        try {
            // findFirstByEmail 사용 (더 효율적)
            Optional<SignupEntity> user = userRepository.findFirstByEmail(email);
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body("등록되지 않은 이메일입니다.");
            }

            emailService.sendVerificationCode(email);
            return ResponseEntity.ok("인증번호가 전송되었습니다.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("인증번호 전송에 실패했습니다.");
        }
    }

    @PostMapping(value = "/verify-code", produces = "text/plain; charset=UTF-8")
    public ResponseEntity<String> verify(@RequestParam String email, @RequestParam String code) {
        try {
            if (!emailService.verifyCode(email, code)) {
                return ResponseEntity.badRequest().body("인증번호가 일치하지 않습니다.");
            }

            return userRepository.findFirstByEmail(email)
                    .map(user -> ResponseEntity.ok("회원님의 아이디는: " + user.getUserId()))
                    .orElseGet(() -> ResponseEntity.badRequest().body("이메일로 등록된 계정을 찾을 수 없습니다."));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("인증 처리 중 오류가 발생했습니다.");
        }
    }
    @PostMapping(value = "/send-code_Pass", produces = "text/plain; charset=UTF-8")
    public ResponseEntity<String> sendCodeForPassword(@RequestParam String userId,
                                                      @RequestParam String email) {
        try {
            // 아이디와 이메일이 모두 일치하는 사용자 찾기
            Optional<SignupEntity> user = userRepository.findByUserIdAndEmail(userId, email);

            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body("입력하신 아이디와 이메일이 일치하지 않습니다.");
            }

            emailService.sendVerificationCode(email);
            return ResponseEntity.ok("인증번호가 전송되었습니다.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("인증번호 전송에 실패했습니다.");
        }
    }

    @PostMapping(value = "/verify-code_Pass", produces = "text/plain; charset=UTF-8")
    public ResponseEntity<String> verifyCodeForPassword(@RequestParam String userId,
                                                        @RequestParam String email,
                                                        @RequestParam String code,
                                                        HttpSession session) {
        try {
            if (!emailService.verifyCode(email, code)) {
                return ResponseEntity.badRequest().body("인증번호가 일치하지 않습니다.");
            }

            Optional<SignupEntity> user = userRepository.findByUserIdAndEmail(userId, email);
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body("사용자 정보를 찾을 수 없습니다.");
            }

            // 세션에 인증 정보 저장 (30분)
            session.setAttribute("reset_verified_user", userId);
            session.setAttribute("reset_verification_time", System.currentTimeMillis());
            session.setMaxInactiveInterval(30 * 60); // 30분

            return ResponseEntity.ok("인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("인증 처리 중 오류가 발생했습니다.");
        }
    }

    // 비밀번호 재설정
    @PostMapping(value = "/reset-password", produces = "text/plain; charset=UTF-8")
    public ResponseEntity<String> resetPassword(@RequestParam String userId,
                                                @RequestParam String newPassword,
                                                HttpSession session) {
        try {
            // 세션 검증
            String sessionUserId = (String) session.getAttribute("reset_verified_user");
            Long verificationTime = (Long) session.getAttribute("reset_verification_time");

            if (sessionUserId == null || !sessionUserId.equals(userId)) {
                return ResponseEntity.badRequest().body("잘못된 접근입니다.");
            }

            // 30분 만료 확인
            if (verificationTime == null ||
                    System.currentTimeMillis() - verificationTime > 30 * 60 * 1000) {
                session.removeAttribute("reset_verified_user");
                session.removeAttribute("reset_verification_time");
                return ResponseEntity.badRequest().body("인증 시간이 만료되었습니다.");
            }

            // 비밀번호 변경
            signService.updatePassword(userId, newPassword);

            // 세션 정리
            session.removeAttribute("reset_verified_user");
            session.removeAttribute("reset_verification_time");

            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("비밀번호 변경에 실패했습니다.");
        }
    }
}