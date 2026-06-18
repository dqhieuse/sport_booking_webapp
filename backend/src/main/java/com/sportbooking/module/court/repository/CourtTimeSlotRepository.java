package com.sportbooking.module.court.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;

public interface CourtTimeSlotRepository extends JpaRepository<CourtTimeSlot, Long> {

    interface ActiveTimeSlotCountView {

        Long getCourtId();

        long getActiveCount();
    }

    @EntityGraph(attributePaths = "timeSlot")
    List<CourtTimeSlot> findByCourtId(Long courtId);

    @EntityGraph(attributePaths = "timeSlot")
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
            where courtTimeSlot.court.id = :courtId and courtTimeSlot.status != "INACTIVE"
            order by timeSlot.startTime asc
            """)
    List<CourtTimeSlot> findConfiguredSlots(@Param("courtId") Long courtId);

    long countByCourtIdAndStatus(Long courtId, TimeSlotStatus status);

    @Query("""
            select courtTimeSlot.court.id as courtId, count(courtTimeSlot.id) as activeCount
            from CourtTimeSlot courtTimeSlot
            where courtTimeSlot.court.id in :courtIds
              and courtTimeSlot.status = :status
            group by courtTimeSlot.court.id
            """)
    List<ActiveTimeSlotCountView> countByCourtIdInAndStatus(
            @Param("courtIds") Collection<Long> courtIds,
            @Param("status") TimeSlotStatus status
    );

    Optional<CourtTimeSlot> findByCourtIdAndTimeSlotId(Long courtId, Long timeSlotId);

    @EntityGraph(attributePaths = "timeSlot")
    List<CourtTimeSlot> findByCourtIdAndTimeSlotIdIn(Long courtId, Collection<Long> timeSlotIds);

    boolean existsByCourtIdAndTimeSlotId(Long courtId, Long timeSlotId);
}
