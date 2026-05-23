package com.sportbooking.module.sport.dto;

import com.sportbooking.module.sport.entity.Sport;
import com.sportbooking.module.sport.entity.SportStatus;

public record SportResponse(
        Long id,
        String name,
        String description,
        SportStatus status
) {

    public static SportResponse from(Sport sport) {
        return new SportResponse(
                sport.getId(),
                sport.getName(),
                sport.getDescription(),
                sport.getStatus()
        );
    }
}
