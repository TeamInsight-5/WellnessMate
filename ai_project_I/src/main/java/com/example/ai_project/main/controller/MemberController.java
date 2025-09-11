package com.example.ai_project.main.controller;

import com.example.ai_project.main.entity.SignupEntity;
import com.example.ai_project.main.service.SignService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
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

    @GetMapping("/find")
    public String findMember(){
        return "memberManager/find";
    }

    @GetMapping("/findPass")
    public String findMemberP(){
        return "memberManager/findPass";
    }
    // --- (변경) CRUD 기능 추가 ---

    // R (Read): 내 정보 페이지로 이동 (로그인 사용자 정보 조회)
    @GetMapping("/profile")
    public String myProfile(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        // Spring Security의 UserDetails를 사용하여 현재 로그인된 사용자 ID를 가져옴
        String userId = userDetails.getUsername();
        SignupEntity user = signupservice.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        model.addAttribute("user", user);
        return "memberManager/profile_edit"; // 새로운 HTML 페이지
    }

    // U (Update): 정보 수정 처리
    @PostMapping("/profile/update")
    public String updateMyProfile(@ModelAttribute SignupEntity updatedUser,
                                  @AuthenticationPrincipal UserDetails userDetails,
                                  @RequestParam(value = "password", required = false) String newPassword,
                                  RedirectAttributes redirectAttributes) {
        if(newPassword != null){
            signupservice.updatePassword(userDetails.getUsername(), newPassword);
        }else {
            signupservice.update(userDetails.getUsername(), updatedUser.getEmail());
        }

        return "redirect:/profile";
    }


    // D (Delete): 회원 탈퇴 처리
    @PostMapping("/profile/delete")
    public String deleteAccount(@AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        signupservice.deleteByUserId(userDetails.getUsername());
        // 계정 삭제 후 로그아웃 처리
        new SecurityContextLogoutHandler().logout(request, null, null);
        return "redirect:/main"; // 메인 페이지로 리다이렉션
    }
}