package com.sportbooking.module.booking.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.repository.BookingRepository;
import com.sportbooking.module.booking.repository.BookingTimeSlotRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.payment.repository.PaymentRepository;
import com.sportbooking.module.payment.entity.PaymentStatus;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.user.repository.UserRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingTimeSlotRepository bookingTimeSlotRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CourtTimeSlotRepository courtTimeSlotRepository;

    @Test
    void createBookingCreatesOneBookingWithThreeConsecutiveSlotsAndOneCashPayment() throws Exception {
        String bookingDate = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courtId": 1,
                                  "timeSlotIds": [1, 2, 3],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT",
                                  "note": "  Three-hour practice  "
                                }
                                """.formatted(bookingDate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Booking created successfully")))
                .andExpect(jsonPath("$.data.startTime", is("06:00:00")))
                .andExpect(jsonPath("$.data.endTime", is("09:00:00")))
                .andExpect(jsonPath("$.data.durationMinutes", is(180)))
                .andExpect(jsonPath("$.data.totalPrice", is(360000.0)))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.slots", hasSize(3)))
                .andExpect(jsonPath("$.data.payment.method", is("CASH_AT_COURT")))
                .andExpect(jsonPath("$.data.payment.status", is("UNPAID")))
                .andExpect(jsonPath("$.data.payment.amount", is(360000.0)));

        assertThat(bookingRepository.count()).isEqualTo(1);
        assertThat(bookingTimeSlotRepository.count()).isEqualTo(3);
        assertThat(paymentRepository.count()).isEqualTo(1);
        assertThat(bookingRepository.findAll().getFirst().getNote()).isEqualTo("Three-hour practice");
        assertThat(bookingTimeSlotRepository.findAll())
                .allSatisfy(bookingTimeSlot -> assertThat(bookingTimeSlot.getActiveSlotKey()).isNotBlank());

        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", bookingDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].status", is("BOOKED")))
                .andExpect(jsonPath("$.data.items[1].status", is("BOOKED")))
                .andExpect(jsonPath("$.data.items[2].status", is("BOOKED")));
    }

    @Test
    void createBookingCreatesSingleSlotBookingAndVnpayPendingPayment() throws Exception {
        String bookingDate = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courtId": 1,
                                  "timeSlotIds": [4],
                                  "bookingDate": "%s",
                                  "paymentMethod": "VNPAY"
                                }
                                """.formatted(bookingDate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slots", hasSize(1)))
                .andExpect(jsonPath("$.data.durationMinutes", is(60)))
                .andExpect(jsonPath("$.data.totalPrice", is(120000.0)))
                .andExpect(jsonPath("$.data.payment.method", is("VNPAY")))
                .andExpect(jsonPath("$.data.payment.status", is("PENDING")))
                .andExpect(jsonPath("$.data.payment.paymentUrl").value(org.hamcrest.Matchers.nullValue()));
    }

    @Test
    void createBookingRejectsNonConsecutiveSlotsWithoutSavingAnything() throws Exception {
        long bookingCount = bookingRepository.count();
        long paymentCount = paymentRepository.count();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courtId": 1,
                                  "timeSlotIds": [1, 4],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT"
                                }
                                """.formatted(LocalDate.now().plusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Selected time slots must be consecutive")));

        assertThat(bookingRepository.count()).isEqualTo(bookingCount);
        assertThat(bookingTimeSlotRepository.count()).isZero();
        assertThat(paymentRepository.count()).isEqualTo(paymentCount);
    }

    @Test
    void createBookingRejectsInactiveCourtSlotAndRollsBackWholeSelection() throws Exception {
        var inactiveSlot = courtTimeSlotRepository.findByCourtIdAndTimeSlotId(1L, 2L).orElseThrow();
        inactiveSlot.setStatus(TimeSlotStatus.INACTIVE);
        courtTimeSlotRepository.saveAndFlush(inactiveSlot);
        long bookingCount = bookingRepository.count();
        long paymentCount = paymentRepository.count();

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courtId": 1,
                                  "timeSlotIds": [1, 2],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT"
                                }
                                """.formatted(LocalDate.now().plusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Time slot is not active for this court")));

        assertThat(bookingRepository.count()).isEqualTo(bookingCount);
        assertThat(bookingTimeSlotRepository.count()).isZero();
        assertThat(paymentRepository.count()).isEqualTo(paymentCount);
    }

    @Test
    void createBookingRejectsPastAndOutsideFourteenDayWindow() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSingleSlotRequest(LocalDate.now().minusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation failed")));

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSingleSlotRequest(LocalDate.now().plusDays(14))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Booking date must be within the next 14 days")));
    }

    @Test
    void createBookingRejectsDuplicateActiveSlot() throws Exception {
        String request = validSingleSlotRequest(LocalDate.now().plusDays(1));
        String token = bearerToken("user@sportbooking.local");

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("One or more selected time slots are no longer available")));

        assertThat(bookingRepository.count()).isEqualTo(1);
        assertThat(bookingTimeSlotRepository.count()).isEqualTo(1);
        assertThat(paymentRepository.count()).isEqualTo(1);
    }

    @Test
    void createBookingRequiresUserRole() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSingleSlotRequest(LocalDate.now().plusDays(1))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("User role is required")));
    }

    @Test
    void createBookingRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSingleSlotRequest(LocalDate.now().plusDays(1))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Authentication is required")));
    }

    @Test
    void getMyBookingsReturnsCurrentUserBookingsWithPagination() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        createSingleSlotBooking(LocalDate.now().plusDays(2));

        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].bookingDate", is(LocalDate.now().plusDays(2).toString())))
                .andExpect(jsonPath("$.data.items[0].startTime", is("06:00:00")))
                .andExpect(jsonPath("$.data.items[0].endTime", is("07:00:00")))
                .andExpect(jsonPath("$.data.items[0].court.name", is("Badminton Court A1")))
                .andExpect(jsonPath("$.data.items[0].venue.name", is("Sunrise Badminton Center")))
                .andExpect(jsonPath("$.data.items[0].payment.method", is("CASH_AT_COURT")))
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(1)))
                .andExpect(jsonPath("$.data.totalItems", is(2)))
                .andExpect(jsonPath("$.data.totalPages", is(2)));
    }

    @Test
    void getMyBookingsFiltersByStatus() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        createSingleSlotBooking(LocalDate.now().plusDays(2));
        var confirmedBooking = bookingRepository.findAll().getLast();
        confirmedBooking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(confirmedBooking);

        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].status", is("CONFIRMED")));
    }

    @Test
    void getMyBookingsRequiresUserRole() throws Exception {
        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", bearerToken("vendor@sportbooking.local")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("User role is required")));
    }

    @Test
    void getBookingDetailReturnsFullDetailForOwner() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        Long bookingId = bookingRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(bookingId.intValue())))
                .andExpect(jsonPath("$.data.user.email", is("user@sportbooking.local")))
                .andExpect(jsonPath("$.data.court.name", is("Badminton Court A1")))
                .andExpect(jsonPath("$.data.venue.name", is("Sunrise Badminton Center")))
                .andExpect(jsonPath("$.data.slots", hasSize(1)))
                .andExpect(jsonPath("$.data.payment.status", is("UNPAID")));
    }

    @Test
    void getBookingDetailRejectsUserWhoDoesNotOwnBooking() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        var booking = bookingRepository.findAll().getFirst();
        booking.setUser(userRepository.findByEmail("vendor@sportbooking.local").orElseThrow());
        bookingRepository.saveAndFlush(booking);

        mockMvc.perform(get("/api/bookings/{id}", booking.getId())
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You cannot view this booking")));
    }

    @Test
    void getBookingDetailAllowsCourtVendorAndAdmin() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        Long bookingId = bookingRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearerToken("vendor@sportbooking.local")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(bookingId.intValue())));

        mockMvc.perform(get("/api/bookings/{id}", bookingId)
                        .header("Authorization", bearerToken("admin@sportbooking.local")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(bookingId.intValue())));
    }

    @Test
    void getBookingDetailReturnsNotFoundForUnknownBooking() throws Exception {
        mockMvc.perform(get("/api/bookings/{id}", 9999)
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Booking not found")));
    }

    @Test
    void cancelBookingCancelsPendingBookingAndReleasesSlot() throws Exception {
        LocalDate bookingDate = LocalDate.now().plusDays(1);
        createSingleSlotBooking(bookingDate);
        Long bookingId = bookingRepository.findAll().getFirst().getId();

        mockMvc.perform(put("/api/bookings/{id}/cancel", bookingId)
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Booking cancelled successfully")))
                .andExpect(jsonPath("$.data.bookingStatus", is("CANCELLED")))
                .andExpect(jsonPath("$.data.paymentStatus", is("UNPAID")));

        assertThat(bookingRepository.findById(bookingId).orElseThrow().getStatus())
                .isEqualTo(BookingStatus.CANCELLED);
        assertThat(bookingTimeSlotRepository.findAll().getFirst().getActiveSlotKey()).isNull();

        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", bookingDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].status", is("AVAILABLE")));
    }

    @Test
    void cancelBookingMarksPaidVnpayPaymentAsRefundPending() throws Exception {
        createVnpayBooking(LocalDate.now().plusDays(1));
        var booking = bookingRepository.findAll().getFirst();
        var payment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        payment.setStatus(PaymentStatus.PAID);
        paymentRepository.saveAndFlush(payment);

        mockMvc.perform(put("/api/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingStatus", is("CANCELLED")))
                .andExpect(jsonPath("$.data.paymentStatus", is("REFUND_PENDING")));

        var updatedPayment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        assertThat(updatedPayment.getRefundAmount()).isEqualByComparingTo(updatedPayment.getAmount());
        assertThat(updatedPayment.getRefundReason()).isEqualTo("User cancelled booking");
    }

    @Test
    void cancelBookingRejectsUserWhoDoesNotOwnBooking() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        var booking = bookingRepository.findAll().getFirst();
        booking.setUser(userRepository.findByEmail("vendor@sportbooking.local").orElseThrow());
        bookingRepository.saveAndFlush(booking);

        mockMvc.perform(put("/api/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You cannot cancel this booking")));
    }

    @Test
    void cancelBookingRejectsTerminalBooking() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        var booking = bookingRepository.findAll().getFirst();
        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.saveAndFlush(booking);

        mockMvc.perform(put("/api/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Booking cannot be cancelled in its current status")));
    }

    @Test
    void cancelBookingRejectsPaidCashBooking() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        var booking = bookingRepository.findAll().getFirst();
        var payment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        payment.setStatus(PaymentStatus.PAID);
        paymentRepository.saveAndFlush(payment);

        mockMvc.perform(put("/api/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Paid cash booking must be cancelled by the vendor")));

        assertThat(bookingRepository.findById(booking.getId()).orElseThrow().getStatus())
                .isEqualTo(BookingStatus.PENDING);
    }

    @Test
    void cancelBookingRejectsBookingThatHasAlreadyStarted() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        var booking = bookingRepository.findAll().getFirst();
        booking.setBookingDate(LocalDate.now().minusDays(1));
        bookingRepository.saveAndFlush(booking);

        mockMvc.perform(put("/api/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Booking has already started")));
    }

    @Test
    void cancelBookingRequiresUserRole() throws Exception {
        createSingleSlotBooking(LocalDate.now().plusDays(1));
        Long bookingId = bookingRepository.findAll().getFirst().getId();

        mockMvc.perform(put("/api/bookings/{id}/cancel", bookingId)
                        .header("Authorization", bearerToken("vendor@sportbooking.local")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("User role is required")));
    }

    private void createSingleSlotBooking(LocalDate bookingDate) throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSingleSlotRequest(bookingDate)))
                .andExpect(status().isCreated());
    }

    private void createVnpayBooking(LocalDate bookingDate) throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courtId": 1,
                                  "timeSlotIds": [1],
                                  "bookingDate": "%s",
                                  "paymentMethod": "VNPAY"
                                }
                                """.formatted(bookingDate)))
                .andExpect(status().isCreated());
    }

    private String bearerToken(String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        return "Bearer " + jwtAccessTokenService.generateToken(user);
    }

    private String validSingleSlotRequest(LocalDate bookingDate) {
        return """
                {
                  "courtId": 1,
                  "timeSlotIds": [1],
                  "bookingDate": "%s",
                  "paymentMethod": "CASH_AT_COURT"
                }
                """.formatted(bookingDate);
    }
}
