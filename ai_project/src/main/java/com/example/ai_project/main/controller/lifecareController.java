package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LifecareController {

    @GetMapping("/main" )
    public String mainpage(){
        return "mainpage";
    }

    @GetMapping("/hospital_med")
    public String med_care() {
        return "hospitalMed"; // ✅ 파일명과 동일하게!
    }

    @GetMapping("/hospital_sur")
    public String sur_care() {
        return "hospitalSurgery"; // ✅ 파일명과 동일하게!
    }




}
