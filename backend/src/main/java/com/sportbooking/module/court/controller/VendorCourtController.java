package com.sportbooking.module.court.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.common.api.PageResponse;
import com.sportbooking.module.court.dto.CourtImageResponse;
import com.sportbooking.module.court.dto.VendorCourtDetailResponse;
import com.sportbooking.module.court.dto.VendorCourtListResponse;
import com.sportbooking.module.court.dto.VendorCourtRequest;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.service.VendorCourtService;
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
@RequestMapping("/api/vendor/courts")
@RequiredArgsConstructor
public class VendorCourtController {

    private final VendorCourtService vendorCourtService;

    @GetMapping
    public ApiResponse<PageResponse<VendorCourtListResponse>> getOwnCourts(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) CourtStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<VendorCourtListResponse> response = vendorCourtService.getOwnCourts(
                authorizationHeader,
                venueId,
                sportId,
                status,
                pageable
        );
        return ApiResponse.success("Success", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<VendorCourtDetailResponse> getOwnCourtById(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        VendorCourtDetailResponse response = vendorCourtService.getOwnCourtById(authorizationHeader, id);
        return ApiResponse.success("Success", response);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VendorCourtDetailResponse> createCourt(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorCourtRequest request
    ) {
        VendorCourtDetailResponse response = vendorCourtService.createCourt(authorizationHeader, request);
        return ApiResponse.success("Court created successfully", response);
    }

    @PostMapping("/{id}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourtImageResponse> uploadCourtImage(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Integer sortOrder,
            @RequestParam(defaultValue = "false") boolean isPrimary
    ) {
        CourtImageResponse response = vendorCourtService.uploadCourtImage(
                id,
                authorizationHeader,
                file,
                sortOrder,
                isPrimary
        );
        return ApiResponse.success("Court image uploaded successfully", response);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ApiResponse<Void> deleteCourtImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        vendorCourtService.deleteCourtImage(id, imageId, authorizationHeader);
        return ApiResponse.success("Court image deleted successfully", null);
    }

    @PutMapping("/{id}/images/{imageId}/primary")
    public ApiResponse<CourtImageResponse> setPrimaryCourtImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        CourtImageResponse response = vendorCourtService.setPrimaryCourtImage(id, imageId, authorizationHeader);
        return ApiResponse.success("Court primary image updated successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<VendorCourtDetailResponse> updateCourt(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody VendorCourtRequest request
    ) {
        VendorCourtDetailResponse response = vendorCourtService.updateCourt(id, authorizationHeader, request);
        return ApiResponse.success("Court updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<VendorCourtDetailResponse> deactivateCourt(
            @PathVariable Long id,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        VendorCourtDetailResponse response = vendorCourtService.deactivateCourt(id, authorizationHeader);
        return ApiResponse.success("Court deactivated successfully", response);
    }
}
