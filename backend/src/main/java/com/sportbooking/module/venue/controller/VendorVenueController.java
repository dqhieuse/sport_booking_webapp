package com.sportbooking.module.venue.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.module.venue.dto.VendorVenueRequest;
import com.sportbooking.module.venue.dto.VenueDetailResponse;
import com.sportbooking.module.venue.service.VendorVenueService;
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
@RequestMapping("/api/vendor/venues")
@RequiredArgsConstructor
public class VendorVenueController {

    private final VendorVenueService vendorVenueService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VenueDetailResponse> createVenue(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorVenueRequest request
    ) {
        VenueDetailResponse response = vendorVenueService.createVenue(authorizationHeader, request);
        return ApiResponse.success("Venue created successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<VenueDetailResponse> updateVenue(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorVenueRequest request
    ) {
        VenueDetailResponse response = vendorVenueService.updateVenue(id, authorizationHeader, request);
        return ApiResponse.success("Venue updated successfully", response);
    }
}
