package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WellnessMateController {

    @GetMapping("/main" )
    public String mainpage(){
        return "main/mainpage";
    }

    @GetMapping("/mental-care")
    public String mentalCare() {
        return "hospital/mentalCarePage";
    }

    @GetMapping("/hospital_med")
    public String med_care() {
        return "hospital/hospitalMed"; // ✅ 파일명과 동일하게!
    }

    @GetMapping("/hospital_sur")
    public String sur_care() {
        return "hospital/hospitalSurgery"; // ✅ 파일명과 동일하게!
    }
}
