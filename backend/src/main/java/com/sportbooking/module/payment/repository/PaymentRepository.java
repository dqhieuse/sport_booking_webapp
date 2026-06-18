package com.sportbooking.module.payment.repository;

import com.sportbooking.module.payment.entity.Payment;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    List<Payment> findAllByBookingIdIn(Collection<Long> bookingIds);
}
