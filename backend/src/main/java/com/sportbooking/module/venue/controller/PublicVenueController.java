package com.sportbooking.module.venue.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.common.api.PageResponse;
import com.sportbooking.module.venue.dto.VenueDetailResponse;
import com.sportbooking.module.venue.dto.VenueImageResponse;
import com.sportbooking.module.venue.dto.VenueListResponse;
import com.sportbooking.module.venue.service.PublicVenueService;
import java.util.List;
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
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class PublicVenueController {

    private final PublicVenueService publicVenueService;

    @GetMapping
    public ApiResponse<PageResponse<VenueListResponse>> getVenues(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ApiResponse.success("Success", publicVenueService.getActiveVenues(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<VenueDetailResponse> getVenueById(@PathVariable Long id) {
        return ApiResponse.success("Success", publicVenueService.getActiveVenueById(id));
    }

    @GetMapping("/{id}/images")
    public ApiResponse<List<VenueImageResponse>> getVenueImages(@PathVariable Long id) {
        return ApiResponse.success("Success", publicVenueService.getActiveVenueImages(id));
    }
}
