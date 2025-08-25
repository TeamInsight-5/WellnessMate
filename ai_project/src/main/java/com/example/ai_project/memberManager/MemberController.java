package com.example.ai_project.memberManager;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class MemberController {

    private final SignService signupservice;

    public MemberController(SignService signupservice) {
        this.signupservice = signupservice;
    }

    // 회원가입 화면
    @GetMapping("/signupMain")
    public String signupMain(Model model) {
        model.addAttribute("signupEntity", new SignupEntity());
        return "memberManager/signup";
    }

    // 회원가입 처리
    @PostMapping("/signup")
    public String signup(@ModelAttribute SignupEntity signupEntity,
                         HttpSession session,
                         RedirectAttributes redirectAttributes) {

        try {
            // 1. DB 저장 (Service → Repository)
            signupservice.save(signupEntity);

            // 2. 회원가입 성공 메시지 전달
            redirectAttributes.addFlashAttribute("signupMessage", "회원가입이 완료되었습니다. 로그인해 주세요.");

            // 3. 회원가입 완료 후 로그인 페이지로 리다이렉트
            return "redirect:/loginMain";
        } catch (IllegalArgumentException e) {
            // 4. 아이디 중복 예외 처리
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/signupMain";
        }
    }

    // 로그인 화면
    @GetMapping("/loginMain")
    public String loginMain() {
        return "memberManager/signin";
    }

    // 로그인 처리
    @PostMapping("/login")
    public String login(@RequestParam String userId,
                        @RequestParam String userPass,
                        HttpSession session,
                        RedirectAttributes redirectAttributes) {

        SignupEntity loginUser = signupservice.login(userId, userPass);

        if (loginUser != null) {
            session.setAttribute("loginUser", loginUser);
            return "redirect:/main";
        } else {
            redirectAttributes.addFlashAttribute("errorMessage","아이디 또는 비밀번호가 올바르지 않습니다.");
            return "redirect:/loginMain";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/main";
    }
}