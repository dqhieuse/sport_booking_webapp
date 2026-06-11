package com.sportbooking.module.booking.repository;

import com.sportbooking.module.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
