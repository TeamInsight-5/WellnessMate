package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/internalmedicine") // 💡 URL에 맞춰 하이픈을 제거
public class InternalMedicinePageController {

    @GetMapping
    public String showInternalMedicinePage() {
        return "internalmedicine";
    }
}