package com.sportbooking.module.court.repository;

import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourtTimeSlotRepository extends JpaRepository<CourtTimeSlot, Long> {

    List<CourtTimeSlot> findByCourtId(Long courtId);

    List<CourtTimeSlot> findByCourtIdAndStatus(Long courtId, TimeSlotStatus status);

    @Query("""
            select courtTimeSlot
            from CourtTimeSlot courtTimeSlot
            join fetch courtTimeSlot.timeSlot timeSlot
            where courtTimeSlot.court.id = :courtId
              and courtTimeSlot.status = :status
              and timeSlot.status = :status
            order by timeSlot.startTime asc
            """)
    List<CourtTimeSlot> findActiveBookableSlots(
            @Param("courtId") Long courtId,
            @Param("status") TimeSlotStatus status
    );

    @Query("""
            select courtTimeSlot
            from CourtTimeSlot courtTimeSlot
            join fetch courtTimeSlot.timeSlot timeSlot
            where courtTimeSlot.court.id = :courtId
            order by timeSlot.startTime asc
            """)
    List<CourtTimeSlot> findConfiguredSlots(@Param("courtId") Long courtId);

    long countByCourtIdAndStatus(Long courtId, TimeSlotStatus status);

    Optional<CourtTimeSlot> findByCourtIdAndTimeSlotId(Long courtId, Long timeSlotId);

    boolean existsByCourtIdAndTimeSlotId(Long courtId, Long timeSlotId);
}
