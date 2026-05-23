package com.sportbooking.module.timeslot.repository;

import com.sportbooking.module.timeslot.entity.TimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByStatus(TimeSlotStatus status);

    Optional<TimeSlot> findByStartTimeAndEndTime(LocalTime startTime, LocalTime endTime);

    boolean existsByStartTimeAndEndTime(LocalTime startTime, LocalTime endTime);
}
