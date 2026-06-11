package com.sportbooking.module.booking.repository;

import com.sportbooking.module.booking.entity.BookingTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingTimeSlotRepository extends JpaRepository<BookingTimeSlot, Long> {
}
