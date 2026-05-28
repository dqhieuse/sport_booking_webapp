package com.sportbooking.module.venue.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public record VendorVenueRequest(
        @NotBlank
        @Size(max = 150)
        String name,

        @NotBlank
        @Size(max = 255)
        String address,

        @Size(max = 1000)
        String description,

        @NotBlank
        @Size(max = 20)
        String phone,

        @NotNull
        @JsonFormat(pattern = "HH:mm")
        LocalTime openingTime,

        @NotNull
        @JsonFormat(pattern = "HH:mm")
        LocalTime closingTime
) {
}
