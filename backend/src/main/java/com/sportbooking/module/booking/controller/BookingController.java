package com.sportbooking.module.booking.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.common.api.PageResponse;
import com.sportbooking.module.booking.dto.CreateBookingRequest;
import com.sportbooking.module.booking.dto.CreateBookingResponse;
import com.sportbooking.module.booking.dto.BookingDetailResponse;
import com.sportbooking.module.booking.dto.BookingCancellationResponse;
import com.sportbooking.module.booking.dto.MyBookingResponse;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/my")
    public ApiResponse<PageResponse<MyBookingResponse>> getMyBookings(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.success(
                "Success",
                bookingService.getMyBookings(authorizationHeader, status, pageable)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingDetailResponse> getBookingDetail(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        return ApiResponse.success(
                "Success",
                bookingService.getBookingDetail(authorizationHeader, id)
        );
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<BookingCancellationResponse> cancelBooking(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        return ApiResponse.success(
                "Booking cancelled successfully",
                bookingService.cancelBooking(authorizationHeader, id)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateBookingResponse>> createBooking(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        CreateBookingResponse response = bookingService.createBooking(authorizationHeader, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", response));
    }
}
