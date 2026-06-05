package com.sportbooking.module.timeslot.dto;

import com.sportbooking.module.timeslot.entity.TimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import java.time.LocalTime;

public record TimeSlotResponse(
        Long id,
        LocalTime startTime,
        LocalTime endTime,
        TimeSlotStatus status
) {

    public static TimeSlotResponse from(TimeSlot timeSlot) {
        return new TimeSlotResponse(
                timeSlot.getId(),
                timeSlot.getStartTime(),
                timeSlot.getEndTime(),
                timeSlot.getStatus()
        );
    }
}
