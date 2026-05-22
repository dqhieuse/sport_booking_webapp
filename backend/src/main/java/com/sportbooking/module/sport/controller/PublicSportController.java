package com.sportbooking.module.sport.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.module.sport.dto.SportResponse;
import com.sportbooking.module.sport.service.PublicSportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
public class PublicSportController {

    private final PublicSportService publicSportService;

    @GetMapping
    public ApiResponse<List<SportResponse>> getSports() {
        return ApiResponse.success("Success", publicSportService.getActiveSports());
    }

    @GetMapping("/{id}")
    public ApiResponse<SportResponse> getSportById(@PathVariable Long id) {
        return ApiResponse.success("Success", publicSportService.getActiveSportById(id));
    }
}
