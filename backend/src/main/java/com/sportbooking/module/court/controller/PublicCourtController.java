package com.sportbooking.module.court.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.common.api.PageResponse;
import com.sportbooking.module.court.dto.CourtDetailResponse;
import com.sportbooking.module.court.dto.CourtListResponse;
import com.sportbooking.module.court.service.PublicCourtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
public class PublicCourtController {

    private final PublicCourtService publicCourtService;

    @GetMapping
    public ApiResponse<PageResponse<CourtListResponse>> getCourts(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ApiResponse.success("Success", publicCourtService.getActiveCourts(sportId, venueId, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CourtDetailResponse> getCourtById(@PathVariable Long id) {
        return ApiResponse.success("Success", publicCourtService.getActiveCourtById(id));
    }
}
