package com.sportbooking.module.booking.repository;

import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingTimeSlotRepository extends JpaRepository<BookingTimeSlot, Long> {

    boolean existsByCourtIdAndBookingDateAndTimeSlotIdAndBookingStatusIn(
            Long courtId,
            LocalDate bookingDate,
            Long timeSlotId,
            Collection<BookingStatus> statuses
    );

    @Query("""
            select bookingTimeSlot.timeSlot.id
            from BookingTimeSlot bookingTimeSlot
            where bookingTimeSlot.court.id = :courtId
              and bookingTimeSlot.bookingDate = :bookingDate
              and bookingTimeSlot.booking.status in :statuses
            """)
    Set<Long> findBookedTimeSlotIds(
            @Param("courtId") Long courtId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("statuses") Collection<BookingStatus> statuses
    );
}
