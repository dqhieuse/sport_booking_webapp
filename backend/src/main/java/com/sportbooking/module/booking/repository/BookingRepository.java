package com.sportbooking.module.booking.repository;

import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.court.venue.vendor.id = :vendorId " +
           "AND (:status IS NULL OR b.status = :status) " +
           "AND (:courtId IS NULL OR b.court.id = :courtId) " +
           "AND (:date IS NULL OR b.bookingDate = :date)")
    Page<Booking> findVendorBookings(
            @Param("vendorId") Long vendorId,
            @Param("status") BookingStatus status,
            @Param("courtId") Long courtId,
            @Param("date") LocalDate date,
            Pageable pageable
    );
}
