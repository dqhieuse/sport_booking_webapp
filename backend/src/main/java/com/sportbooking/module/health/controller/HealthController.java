package com.sportbooking.module.health.controller;

import java.time.Instant;
import java.util.Map;

import com.sportbooking.common.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success("Backend is running", Map.of(
                "status", "UP",
                "service", "sport-booking-backend",
                "timestamp", Instant.now()
        ));
    }
}
