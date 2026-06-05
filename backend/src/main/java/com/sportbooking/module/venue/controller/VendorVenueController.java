package com.sportbooking.module.venue.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.common.api.PageResponse;
import com.sportbooking.module.venue.dto.VendorVenueRequest;
import com.sportbooking.module.venue.dto.VendorVenueListResponse;
import com.sportbooking.module.venue.dto.VenueDetailResponse;
import com.sportbooking.module.venue.dto.VenueImageResponse;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.service.VendorVenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/vendor/venues")
@RequiredArgsConstructor
public class VendorVenueController {

    private final VendorVenueService vendorVenueService;

    @GetMapping
    public ApiResponse<PageResponse<VendorVenueListResponse>> getOwnVenues(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam(required = false) VenueStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<VendorVenueListResponse> response = vendorVenueService.getOwnVenues(
                authorizationHeader,
                status,
                pageable
        );
        return ApiResponse.success("Success", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<VenueDetailResponse> getOwnVenueById(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        VenueDetailResponse response = vendorVenueService.getOwnVenueById(authorizationHeader, id);
        return ApiResponse.success("Success", response);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VenueDetailResponse> createVenue(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorVenueRequest request
    ) {
        VenueDetailResponse response = vendorVenueService.createVenue(authorizationHeader, request);
        return ApiResponse.success("Venue created successfully", response);
    }

    @PostMapping("/{id}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VenueImageResponse> uploadVenueImage(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Integer sortOrder,
            @RequestParam(defaultValue = "false") boolean isPrimary
    ) {
        VenueImageResponse response = vendorVenueService.uploadVenueImage(
                id,
                authorizationHeader,
                file,
                sortOrder,
                isPrimary
        );
        return ApiResponse.success("Venue image uploaded successfully", response);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ApiResponse<Void> deleteVenueImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        vendorVenueService.deleteVenueImage(id, imageId, authorizationHeader);
        return ApiResponse.success("Venue image deleted successfully", null);
    }

    @PutMapping("/{id}/images/{imageId}/primary")
    public ApiResponse<VenueImageResponse> setPrimaryVenueImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        VenueImageResponse response = vendorVenueService.setPrimaryVenueImage(id, imageId, authorizationHeader);
        return ApiResponse.success("Venue primary image updated successfully", response);
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

    @DeleteMapping("/{id}")
    public ApiResponse<VenueDetailResponse> deactivateVenue(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        VenueDetailResponse response = vendorVenueService.deactivateVenue(id, authorizationHeader);
        return ApiResponse.success("Venue deactivated successfully", response);
    }
}
