package com.quizbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello from Quiz Platform API!", "status", "running");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy", "timestamp", java.time.Instant.now().toString());
    }
}
