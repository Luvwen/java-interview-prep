package com.javatheory.web.controller;

import com.javatheory.application.RealWorldService;
import com.javatheory.domain.RealWorldCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/real-world")
public class RealWorldController {

    private final RealWorldService realWorldService;

    public RealWorldController(RealWorldService realWorldService) {
        this.realWorldService = realWorldService;
    }

    @GetMapping
    public List<RealWorldCase> list() {
        return realWorldService.loadCases();
    }
}
