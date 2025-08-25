package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {
    // GET 로그인 폼
    @GetMapping ("/login")
    public String loginForm() {
        return "login";
    }
    @PostMapping("/loginCheck")
    public String loginCheck(@RequestParam String id,@RequestParam String password){

        return "";


    }



}
