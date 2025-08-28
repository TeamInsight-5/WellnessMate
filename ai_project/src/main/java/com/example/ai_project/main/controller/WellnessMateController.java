package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WellnessMateController {


    // 메인화면
    @GetMapping("/main" )
    public String mainpage(){
        return "main/mainpage";
    }

    // 심리케어
    @GetMapping("/trial")
    public String trialcare(){
        return "trial/PsychologicalCare";
    }

    // 내과
    @GetMapping("/medicine")
    public String medicine(){
        return "medicine/medicine";
    }

}
