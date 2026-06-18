package com.sportbooking.module.booking.repository;

import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    @Override
    @EntityGraph(attributePaths = {
            "court",
            "court.venue",
            "court.venue.vendor",
            "user",
            "timeSlots",
            "timeSlots.timeSlot"
    })
    Optional<Booking> findById(Long id);

    @EntityGraph(attributePaths = {"court", "court.venue"})
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"court", "court.venue"})
    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"court", "user"})
    Page<Booking> findAll(Specification<Booking> specification, Pageable pageable);
}
