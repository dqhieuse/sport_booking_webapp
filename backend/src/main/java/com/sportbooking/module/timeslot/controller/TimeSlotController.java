package com.sportbooking.module.timeslot.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.module.timeslot.dto.TimeSlotResponse;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.timeslot.service.TimeSlotService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @GetMapping
    public ApiResponse<List<TimeSlotResponse>> getTimeSlots(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam(required = false) TimeSlotStatus status
    ) {
        List<TimeSlotResponse> response = timeSlotService.getTimeSlots(authorizationHeader, status);
        return ApiResponse.success("Success", response);
    }
}
