package com.sportbooking.module.court.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record VendorCourtRequest(
        @NotBlank
        @Size(max = 150)
        String name,

        @NotNull
        Long sportId,

        @NotNull
        Long venueId,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal pricePerHour,

        @Size(max = 1000)
        String description,

        List<@NotNull Long> timeSlotIds
) {
}
