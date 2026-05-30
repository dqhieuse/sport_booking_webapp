package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtTimeSlotRepository extends JpaRepository<CourtTimeSlot, Long> {

    List<CourtTimeSlot> findByCourtId(Long courtId);

    List<CourtTimeSlot> findByCourtIdAndStatus(Long courtId, TimeSlotStatus status);

    long countByCourtIdAndStatus(Long courtId, TimeSlotStatus status);

    Optional<CourtTimeSlot> findByCourtIdAndTimeSlotId(Long courtId, Long timeSlotId);

    boolean existsByCourtIdAndTimeSlotId(Long courtId, Long timeSlotId);
}
