package com.example.ai_project.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class lifecareController {

    @GetMapping("/main" )
    public String mainpage(){
        return "mainpage";
    }

}
