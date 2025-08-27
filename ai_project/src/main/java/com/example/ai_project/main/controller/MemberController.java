package com.example.ai_project.main.controller;

import com.example.ai_project.main.entity.SignupEntity;
import com.example.ai_project.main.service.SignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class MemberController {

    private final SignService signupservice;

    @Autowired
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
                         RedirectAttributes redirectAttributes) {

        try {
            signupservice.save(signupEntity);
            redirectAttributes.addFlashAttribute("signupMessage", "회원가입이 완료되었습니다. 로그인해 주세요.");
            return "redirect:/loginMain";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/signupMain";
        }
    }

    // 로그인 화면
    @GetMapping("/loginMain")
    public String loginMain() {
        return "memberManager/signin";
    }

    // Spring Security가 로그인과 로그아웃을 처리하므로 아래 메서드들은 제거합니다.
    /*
    @PostMapping("/login")
    public String login(...) { ... }

    @GetMapping("/logout")
    public String logout(...) { ... }
    */
}