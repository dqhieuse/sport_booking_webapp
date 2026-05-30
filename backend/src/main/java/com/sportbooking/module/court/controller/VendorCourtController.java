package com.sportbooking.module.court.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.module.court.dto.CourtDetailResponse;
import com.sportbooking.module.court.dto.VendorCourtRequest;
import com.sportbooking.module.court.service.VendorCourtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor/courts")
@RequiredArgsConstructor
public class VendorCourtController {

    private final VendorCourtService vendorCourtService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourtDetailResponse> createCourt(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorCourtRequest request
    ) {
        CourtDetailResponse response = vendorCourtService.createCourt(authorizationHeader, request);
        return ApiResponse.success("Court created successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<CourtDetailResponse> updateCourt(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorCourtRequest request
    ) {
        CourtDetailResponse response = vendorCourtService.updateCourt(id, authorizationHeader, request);
        return ApiResponse.success("Court updated successfully", response);
    }
}
