package com.sportbooking.module.timeslot.service;

import com.sportbooking.module.auth.service.CurrentUserService;
import com.sportbooking.module.timeslot.dto.TimeSlotResponse;
import com.sportbooking.module.timeslot.entity.TimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getTimeSlots(String authorizationHeader, TimeSlotStatus status) {
        currentUserService.requireActiveVendorOrAdmin(authorizationHeader);
        List<TimeSlot> timeSlots = status == null
                ? timeSlotRepository.findAllByOrderByStartTimeAscEndTimeAsc()
                : timeSlotRepository.findByStatusOrderByStartTimeAscEndTimeAsc(status);

        return timeSlots.stream()
                .map(TimeSlotResponse::from)
                .toList();
    }
}
