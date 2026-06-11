package com.sportbooking.module.booking.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.common.api.PageResponse;
import com.sportbooking.module.booking.dto.VendorBookingResponse;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.service.BookingService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor/bookings")
@RequiredArgsConstructor
public class VendorBookingController {

    private final BookingService bookingService;

    @GetMapping
    public ApiResponse<PageResponse<VendorBookingResponse>> getVendorBookings(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long courtId,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String validSortBy = "createdAt";
        if ("bookingDate".equals(sortBy) || "totalPrice".equals(sortBy)) {
            validSortBy = sortBy;
        }

        Sort sort = "asc".equalsIgnoreCase(direction)
                ? Sort.by(validSortBy).ascending()
                : Sort.by(validSortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<VendorBookingResponse> response = bookingService.getVendorBookings(
                authorizationHeader,
                status,
                courtId,
                date,
                pageable
        );
        return ApiResponse.success("Success", response);
    }
}
