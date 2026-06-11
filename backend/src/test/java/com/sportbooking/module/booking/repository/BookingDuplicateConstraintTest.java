package com.sportbooking.module.booking.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

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

    @Autowired
    private PlatformTransactionManager transactionManager;

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

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void databaseAllowsOnlyOneOfTwoConcurrentBookingsForSameCourtDateAndSlot() throws Exception {
        LocalDate bookingDate = LocalDate.now().plusDays(3);
        CyclicBarrier startBarrier = new CyclicBarrier(2);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        List<Long> savedBookingIds = new java.util.concurrent.CopyOnWriteArrayList<>();

        try {
            Future<BookingAttempt> firstAttempt = executor.submit(concurrentBookingAttempt(
                    "user@sportbooking.local",
                    bookingDate,
                    startBarrier
            ));
            Future<BookingAttempt> secondAttempt = executor.submit(concurrentBookingAttempt(
                    "vendor@sportbooking.local",
                    bookingDate,
                    startBarrier
            ));

            List<BookingAttempt> attempts = List.of(
                    firstAttempt.get(10, TimeUnit.SECONDS),
                    secondAttempt.get(10, TimeUnit.SECONDS)
            );
            attempts.stream()
                    .filter(BookingAttempt::successful)
                    .map(BookingAttempt::bookingId)
                    .forEach(savedBookingIds::add);

            assertThat(attempts).filteredOn(BookingAttempt::successful).hasSize(1);
            assertThat(attempts)
                    .filteredOn(attempt -> !attempt.successful())
                    .singleElement()
                    .extracting(BookingAttempt::failure)
                    .isInstanceOf(DataIntegrityViolationException.class);
        } finally {
            executor.shutdownNow();
            savedBookingIds.forEach(this::deleteCommittedBooking);
        }
    }

    private Callable<BookingAttempt> concurrentBookingAttempt(
            String userEmail,
            LocalDate bookingDate,
            CyclicBarrier startBarrier
    ) {
        return () -> {
            TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
            try {
                Long bookingId = transactionTemplate.execute(status -> {
                    User user = userRepository.findByEmail(userEmail).orElseThrow();
                    Booking booking = createBooking(user, bookingDate);
                    await(startBarrier);
                    return bookingRepository.saveAndFlush(booking).getId();
                });
                return BookingAttempt.success(bookingId);
            } catch (RuntimeException exception) {
                return BookingAttempt.failure(exception);
            }
        };
    }

    private void deleteCommittedBooking(Long bookingId) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            bookingRepository.deleteById(bookingId);
            bookingRepository.flush();
        });
    }

    private void await(CyclicBarrier barrier) {
        try {
            barrier.await(5, TimeUnit.SECONDS);
        } catch (Exception exception) {
            throw new IllegalStateException("Concurrent booking workers did not start together", exception);
        }
    }

    private Booking createBooking(LocalDate bookingDate) {
        User user = userRepository.findByEmail("user@sportbooking.local").orElseThrow();
        return createBooking(user, bookingDate);
    }

    private Booking createBooking(User user, LocalDate bookingDate) {
        Booking booking = new Booking();
        booking.setUser(user);
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

    private record BookingAttempt(boolean successful, Long bookingId, RuntimeException failure) {

        private static BookingAttempt success(Long bookingId) {
            return new BookingAttempt(true, bookingId, null);
        }

        private static BookingAttempt failure(RuntimeException failure) {
            return new BookingAttempt(false, null, failure);
        }
    }
}
