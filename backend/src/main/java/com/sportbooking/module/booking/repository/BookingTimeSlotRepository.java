package com.sportbooking.module.booking.repository;

import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import java.time.LocalDate;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingTimeSlotRepository extends JpaRepository<BookingTimeSlot, Long> {

    boolean existsByCourtIdAndBookingDateAndTimeSlotIdAndBookingStatusIn(
            Long courtId,
            LocalDate bookingDate,
            Long timeSlotId,
            Collection<BookingStatus> statuses
    );
}
