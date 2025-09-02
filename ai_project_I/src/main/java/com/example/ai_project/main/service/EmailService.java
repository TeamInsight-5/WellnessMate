package com.example.ai_project.main.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j  // 로그 추가
public class EmailService {

    private final JavaMailSender mailSender;
    private final Map<String, VerificationCode> codeStorage = new ConcurrentHashMap<>();



    @Data
    @AllArgsConstructor
    public static class VerificationCode {
        private String code;
        private LocalDateTime expiryTime;

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }

    public void sendVerificationCode(String email) {
        try {
            String code = generateCode();
            log.info("인증번호 생성: {}", code);

            // 메모리에 저장
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
            codeStorage.put("EMAIL_CODE:" + email, new VerificationCode(code, expiryTime));

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("younglee8196@naver.com"); // ← 이 줄 추가 (중요!)
            message.setTo(email);
            message.setSubject("아이디 찾기 인증번호");
            message.setText("인증번호는 다음과 같습니다: " + code + "\n\n5분 이내에 입력해주세요.");

            log.info("이메일 전송 시도: {}", email);
            mailSender.send(message);
            log.info("이메일 전송 성공!");

        } catch (Exception e) {
            log.error("이메일 전송 실패: {}", e.getMessage(), e);
            throw new RuntimeException("이메일 전송에 실패했습니다: " + e.getMessage());
        }
    }

    public boolean verifyCode(String email, String inputCode) {
        try {
            String key = "EMAIL_CODE:" + email;
            VerificationCode storedCode = codeStorage.get(key);

            if (storedCode == null || storedCode.isExpired()) {
                codeStorage.remove(key);
                return false;
            }

            boolean isValid = storedCode.getCode().equals(inputCode);
            if (isValid) {
                codeStorage.remove(key);
            }

            return isValid;
        } catch (Exception e) {
            log.error("인증번호 검증 실패: {}", e.getMessage(), e);
            return false;
        }
    }

    private String generateCode() {
        return String.valueOf((int)((Math.random() * 900000) + 100000));
    }
    // 인증 완료 시간 저장
    private final Map<String, LocalDateTime> verifiedUsers = new ConcurrentHashMap<>();

    public void markUserAsVerified(String userId) {
        verifiedUsers.put(userId, LocalDateTime.now());
    }

    public boolean isUserRecentlyVerified(String userId) {
        LocalDateTime verificationTime = verifiedUsers.get(userId);
        if (verificationTime == null) {
            return false;
        }

        // 30분 이내에 인증했는지 확인
        if (LocalDateTime.now().isAfter(verificationTime.plusMinutes(30))) {
            verifiedUsers.remove(userId); // 만료된 인증 제거
            return false;
        }

        return true;
    }

    public void removeVerification(String userId) {
        verifiedUsers.remove(userId);
    }

}
