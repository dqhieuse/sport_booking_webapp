package com.sportbooking.module.court.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record VendorCourtTimeSlotUpdateRequest(
        @NotNull(message = "Time slot list must not be null")
        List<@NotNull Long> timeSlotIds
) {
}
