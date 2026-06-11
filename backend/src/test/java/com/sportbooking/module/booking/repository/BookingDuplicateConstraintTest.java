package com.sportbooking.module.booking.repository;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
import com.sportbooking.module.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingDuplicateConstraintTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Test
    void databaseRejectsTwoActiveBookingsForSameCourtDateAndSlot() {
        LocalDate bookingDate = LocalDate.now().plusDays(1);
        bookingRepository.saveAndFlush(createBooking(bookingDate));

        assertThatThrownBy(() -> bookingRepository.saveAndFlush(createBooking(bookingDate)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void terminalBookingReleasesDatabaseSlotKey() {
        LocalDate bookingDate = LocalDate.now().plusDays(2);
        Booking cancelledBooking = bookingRepository.saveAndFlush(createBooking(bookingDate));

        cancelledBooking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(cancelledBooking);

        bookingRepository.saveAndFlush(createBooking(bookingDate));
    }

    private Booking createBooking(LocalDate bookingDate) {
        Booking booking = new Booking();
        booking.setUser(userRepository.findByEmail("user@sportbooking.local").orElseThrow());
        booking.setCourt(courtRepository.findById(1L).orElseThrow());
        booking.setBookingDate(bookingDate);
        booking.setTotalPrice(BigDecimal.valueOf(120000));
        booking.setStatus(BookingStatus.PENDING);

        BookingTimeSlot bookingTimeSlot = new BookingTimeSlot();
        bookingTimeSlot.setCourt(booking.getCourt());
        bookingTimeSlot.setBookingDate(bookingDate);
        bookingTimeSlot.setTimeSlot(timeSlotRepository.findById(1L).orElseThrow());
        bookingTimeSlot.setSlotPrice(BigDecimal.valueOf(120000));
        booking.addTimeSlot(bookingTimeSlot);
        return booking;
    }
}
