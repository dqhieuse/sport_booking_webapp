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
import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.repository.BookingRepository;
import com.sportbooking.module.booking.repository.BookingTimeSlotRepository;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.payment.entity.Payment;
import com.sportbooking.module.payment.entity.PaymentMethod;
import com.sportbooking.module.payment.entity.PaymentStatus;
import com.sportbooking.module.payment.repository.PaymentRepository;
import com.sportbooking.module.sport.entity.Sport;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.repository.UserRepository;
import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VendorBookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtTimeSlotRepository courtTimeSlotRepository;

    @Autowired
    private BookingTimeSlotRepository bookingTimeSlotRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void createBookingByVendorCreatesPendingVnpayBooking() throws Exception {
        String bookingDate = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(post("/api/vendor/bookings")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": "Walk-in Customer",
                                  "customerPhone": "0901234567",
                                  "courtId": 1,
                                  "timeSlotIds": [1, 2],
                                  "bookingDate": "%s",
                                  "paymentMethod": "VNPAY",
                                  "note": " Walk-in customer "
                                }
                                """.formatted(bookingDate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Vendor booking created successfully")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.durationMinutes", is(120)))
                .andExpect(jsonPath("$.data.totalPrice", is(240000.0)))
                .andExpect(jsonPath("$.data.payment.method", is("VNPAY")))
                .andExpect(jsonPath("$.data.payment.status", is("PENDING")))
                .andExpect(jsonPath("$.data.payment.amount", is(240000.0)));

        Booking booking = bookingRepository.findAll().getFirst();
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        assertThat(booking.getUser()).isNull();
        assertThat(booking.getGuestCustomerName()).isEqualTo("Walk-in Customer");
        assertThat(booking.getGuestCustomerPhone()).isEqualTo("0901234567");
        assertThat(booking.getNote()).isEqualTo("Walk-in customer");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(payment.getAmount()).isEqualByComparingTo(booking.getTotalPrice());
        assertThat(payment.getPaidAt()).isNull();
    }

    @Test
    void createBookingByVendorCreatesConfirmedCashBooking() throws Exception {
        String bookingDate = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(post("/api/vendor/bookings")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": "Cash Customer",
                                  "courtId": 1,
                                  "timeSlotIds": [1],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT"
                                }
                                """.formatted(bookingDate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.data.payment.method", is("CASH_AT_COURT")))
                .andExpect(jsonPath("$.data.payment.status", is("PAID")));

        Booking booking = bookingRepository.findAll().getFirst();
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        assertThat(payment.getPaidAt()).isNotNull();
    }

    @Test
    void lookupCustomerByVendorReturnsActiveCustomerAccount() throws Exception {
        User customer = userRepository.findByEmail("user@sportbooking.local").orElseThrow();

        mockMvc.perform(get("/api/vendor/bookings/customer-lookup")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .param("identifier", customer.getPhone()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.found", is(true)))
                .andExpect(jsonPath("$.data.userId", is(customer.getId().intValue())))
                .andExpect(jsonPath("$.data.fullName", is(customer.getFullName())));
    }

    @Test
    void createBookingByVendorLinksRegisteredCustomer() throws Exception {
        User customer = userRepository.findByEmail("user@sportbooking.local").orElseThrow();

        mockMvc.perform(post("/api/vendor/bookings")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": "%s",
                                  "customerIdentifier": "%s",
                                  "courtId": 1,
                                  "timeSlotIds": [1],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT"
                                }
                                """.formatted(
                                customer.getFullName(),
                                customer.getEmail(),
                                LocalDate.now().plusDays(1)
                        )))
                .andExpect(status().isCreated());

        Booking booking = bookingRepository.findAll().getFirst();
        assertThat(booking.getUser()).isNotNull();
        assertThat(booking.getUser().getId()).isEqualTo(customer.getId());
        assertThat(booking.getGuestCustomerName()).isNull();
        assertThat(booking.getGuestCustomerPhone()).isNull();
    }

    @Test
    void createBookingByVendorRejectsCourtOwnedByAnotherVendor() throws Exception {
        User anotherVendor = createTestUser(
                "vendor-create-other@sportbooking.local",
                com.sportbooking.module.user.entity.RoleName.VENDOR
        );
        Venue anotherVenue = createTestVenue(anotherVendor, "Other Create Venue");
        Court anotherCourt = createTestCourt(anotherVenue, "Other Create Court");

        mockMvc.perform(post("/api/vendor/bookings")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": "Guest Customer",
                                  "courtId": %d,
                                  "timeSlotIds": [1],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT"
                                }
                                """.formatted(anotherCourt.getId(), LocalDate.now().plusDays(1))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You do not own this court")));
    }

    @Test
    void createBookingByVendorRequiresCustomerName() throws Exception {
        mockMvc.perform(post("/api/vendor/bookings")
                        .header("Authorization", bearerToken("vendor@sportbooking.local"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": " ",
                                  "courtId": 1,
                                  "timeSlotIds": [1],
                                  "bookingDate": "%s",
                                  "paymentMethod": "CASH_AT_COURT"
                                }
                                """.formatted(LocalDate.now().plusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation failed")));
    }

    @Test
    void getVendorBookingsReturnsOnlyOwnBookingsWithPagination() throws Exception {
        User anotherVendor = createTestUser("vendor2@sportbooking.local", com.sportbooking.module.user.entity.RoleName.VENDOR);
        Venue anotherVenue = createTestVenue(anotherVendor, "Another Venue");
        Court anotherCourt = createTestCourt(anotherVenue, "Another Court");
        createTestBooking(anotherCourt, LocalDate.now().plusDays(2), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking ownBooking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items[?(@.id == %d)]".formatted(ownBooking.getId())).exists())
                .andExpect(jsonPath("$.data.items[?(@.court.id == %d)]".formatted(anotherCourt.getId())).doesNotExist());
    }

    @Test
    void getVendorBookingsFiltersByStatus() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking1 = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking1.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking1);

        Booking booking2 = createTestBooking(ownCourt, LocalDate.now().plusDays(2), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking2.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking2);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].id", is(booking1.getId().intValue())));
    }

    @Test
    void getVendorBookingsFiltersByCourt() throws Exception {
        Court ownCourt1 = courtRepository.findById(1L).orElseThrow();
        Venue ownVenue = ownCourt1.getVenue();
        Court ownCourt2 = createTestCourt(ownVenue, "Court Dynamic");

        Booking booking1 = createTestBooking(ownCourt1, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        Booking booking2 = createTestBooking(ownCourt2, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("courtId", ownCourt1.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].id", is(booking1.getId().intValue())));
    }

    @Test
    void getVendorBookingsFiltersByDate() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        LocalDate targetDate = LocalDate.now().plusDays(3);
        Booking booking1 = createTestBooking(ownCourt, targetDate, PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        Booking booking2 = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("date", targetDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].id", is(booking1.getId().intValue())));
    }

    @Test
    void getVendorBookingsSortsByTotalPriceAscAndDesc() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();

        Booking booking1 = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking1.setTotalPrice(BigDecimal.valueOf(500000));
        bookingRepository.saveAndFlush(booking1);

        Booking booking2 = createTestBooking(ownCourt, LocalDate.now().plusDays(2), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking2.setTotalPrice(BigDecimal.valueOf(100000));
        bookingRepository.saveAndFlush(booking2);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("sortBy", "totalPrice")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].totalPrice").value(100000.0))
                .andExpect(jsonPath("$.data.items[1].totalPrice").value(500000.0));

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("sortBy", "totalPrice")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].totalPrice").value(500000.0))
                .andExpect(jsonPath("$.data.items[1].totalPrice").value(100000.0));
    }

    @Test
    void getVendorBookingsSortsByBookingDateAscAndDesc() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        LocalDate date1 = LocalDate.now().plusDays(1);
        LocalDate date2 = LocalDate.now().plusDays(5);

        createTestBooking(ownCourt, date2, PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        createTestBooking(ownCourt, date1, PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("sortBy", "bookingDate")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].bookingDate", is(date1.toString())))
                .andExpect(jsonPath("$.data.items[1].bookingDate", is(date2.toString())));

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("sortBy", "bookingDate")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].bookingDate", is(date2.toString())))
                .andExpect(jsonPath("$.data.items[1].bookingDate", is(date1.toString())));
    }

    @Test
    void getVendorBookingsRejectsUnknownCourt() throws Exception {
        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("courtId", "9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Court not found")));
    }

    @Test
    void getVendorBookingsRejectsCourtNotOwnedByVendor() throws Exception {
        User anotherVendor = createTestUser("vendor3@sportbooking.local", com.sportbooking.module.user.entity.RoleName.VENDOR);
        Venue anotherVenue = createTestVenue(anotherVendor, "Another Venue 3");
        Court anotherCourt = createTestCourt(anotherVenue, "Another Court 3");

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", token)
                        .param("courtId", anotherCourt.getId().toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You do not own this court")));
    }

    @Test
    void getVendorBookingsRequiresVendorRole() throws Exception {
        mockMvc.perform(get("/api/vendor/bookings")
                        .header("Authorization", bearerToken("user@sportbooking.local")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("Access denied")));
    }

    @Test
    void getVendorBookingsRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/vendor/bookings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Authentication is required")));
    }

    @Test
    void confirmBookingByVendorSucceeds() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/confirm", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Booking confirmed successfully")))
                .andExpect(jsonPath("$.data.bookingStatus", is("CONFIRMED")));

        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(updatedBooking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void confirmBookingByVendorRejectsNonPending() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/confirm", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Only pending bookings can be confirmed")));
    }

    @Test
    void confirmBookingByVendorRejectsNonOwner() throws Exception {
        User anotherVendor = createTestUser("vendor4@sportbooking.local", com.sportbooking.module.user.entity.RoleName.VENDOR);
        Venue anotherVenue = createTestVenue(anotherVendor, "Another Venue 4");
        Court anotherCourt = createTestCourt(anotherVenue, "Another Court 4");
        Booking booking = createTestBooking(anotherCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/confirm", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You do not own this booking")));
    }

    @Test
    void rejectBookingByVendorSucceedsAndReleasesSlots() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.VNPAY, PaymentStatus.PAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/reject", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Booking rejected successfully")))
                .andExpect(jsonPath("$.data.bookingStatus", is("REJECTED")))
                .andExpect(jsonPath("$.data.paymentStatus", is("REFUND_PENDING")));

        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(updatedBooking.getStatus()).isEqualTo(BookingStatus.REJECTED);
        assertThat(updatedBooking.getTimeSlots())
                .allSatisfy(slot -> assertThat(slot.getActiveSlotKey()).isNull());
    }

    @Test
    void rejectBookingByVendorRejectsNonPending() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/reject", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Only pending bookings can be rejected")));
    }

    @Test
    void cancelBookingByVendorSucceedsAndReleasesSlots() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.VNPAY, PaymentStatus.PAID);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Booking cancelled successfully")))
                .andExpect(jsonPath("$.data.bookingStatus", is("CANCELLED")))
                .andExpect(jsonPath("$.data.paymentStatus", is("REFUND_PENDING")));

        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(updatedBooking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(updatedBooking.getTimeSlots())
                .allSatisfy(slot -> assertThat(slot.getActiveSlotKey()).isNull());
    }

    @Test
    void cancelBookingByVendorRejectsStartedBooking() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().minusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/cancel", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Booking has already started")));
    }

    @Test
    void markCashPaidByVendorSucceeds() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/mark-cash-paid", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Payment marked as paid successfully")))
                .andExpect(jsonPath("$.data.paymentStatus", is("PAID")));

        Payment updatedPayment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        assertThat(updatedPayment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(updatedPayment.getPaidAt()).isNotNull();
    }

    @Test
    void markCashPaidByVendorRejectsVnpay() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.VNPAY, PaymentStatus.PENDING);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/mark-cash-paid", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Only CASH_AT_COURT bookings can be marked as paid")));
    }

    @Test
    void markCashPaidByVendorRejectsCancelledOrRejected() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/mark-cash-paid", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Cannot mark paid for cancelled or rejected booking")));
    }

    @Test
    void markCashPaidByVendorRejectsAlreadyPaid() throws Exception {
        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking booking = createTestBooking(ownCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.PAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/mark-cash-paid", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Payment is already paid")));
    }

    @Test
    void markCashPaidByVendorRejectsNonOwner() throws Exception {
        User anotherVendor = createTestUser("vendor5@sportbooking.local", com.sportbooking.module.user.entity.RoleName.VENDOR);
        Venue anotherVenue = createTestVenue(anotherVendor, "Another Venue 5");
        Court anotherCourt = createTestCourt(anotherVenue, "Another Court 5");
        Booking booking = createTestBooking(anotherCourt, LocalDate.now().plusDays(1), PaymentMethod.CASH_AT_COURT, PaymentStatus.UNPAID);

        String token = bearerToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/bookings/{id}/mark-cash-paid", booking.getId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You do not own this booking")));
    }

    private User createTestUser(String email, com.sportbooking.module.user.entity.RoleName roleName) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Test User");
        user.setPhone("0987654321");
        user.setPassword("password");
        user.setStatus(com.sportbooking.module.user.entity.UserStatus.ACTIVE);
        var role = new com.sportbooking.module.user.entity.Role();
        role.setId(roleName == com.sportbooking.module.user.entity.RoleName.VENDOR ? 2L : 1L);
        role.setName(roleName);
        user.setRole(role);
        return userRepository.saveAndFlush(user);
    }

    private Venue createTestVenue(User vendor, String name) {
        Venue venue = new Venue();
        venue.setVendor(vendor);
        venue.setName(name);
        venue.setAddress("Test Address");
        venue.setPhone("0123456789");
        venue.setOpeningTime(java.time.LocalTime.of(6, 0));
        venue.setClosingTime(java.time.LocalTime.of(22, 0));
        venue.setStatus(com.sportbooking.module.venue.entity.VenueStatus.ACTIVE);
        return venueRepository.saveAndFlush(venue);
    }

    private Court createTestCourt(Venue venue, String name) {
        Court court = new Court();
        court.setVenue(venue);
        court.setName(name);
        court.setPricePerHour(BigDecimal.valueOf(100000));
        Sport sport = new Sport();
        sport.setId(1L);
        court.setSport(sport);
        court.setStatus(com.sportbooking.module.court.entity.CourtStatus.ACTIVE);
        return courtRepository.saveAndFlush(court);
    }

    private Booking createTestBooking(Court court, LocalDate date, PaymentMethod paymentMethod, PaymentStatus paymentStatus) {
        com.sportbooking.module.timeslot.entity.TimeSlot ts = new com.sportbooking.module.timeslot.entity.TimeSlot();
        ts.setId(1L);
        ts.setStartTime(java.time.LocalTime.of(6, 0));
        ts.setEndTime(java.time.LocalTime.of(7, 0));

        if (courtTimeSlotRepository.findByCourtIdAndTimeSlotId(court.getId(), 1L).isEmpty()) {
            com.sportbooking.module.court.entity.CourtTimeSlot cts = new com.sportbooking.module.court.entity.CourtTimeSlot();
            cts.setCourt(court);
            cts.setTimeSlot(ts);
            cts.setStatus(com.sportbooking.module.timeslot.entity.TimeSlotStatus.ACTIVE);
            courtTimeSlotRepository.saveAndFlush(cts);
        }

        Booking booking = new Booking();
        booking.setUser(userRepository.findByEmail("user@sportbooking.local").orElseThrow());
        booking.setCourt(court);
        booking.setBookingDate(date);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalPrice(BigDecimal.valueOf(100000));

        com.sportbooking.module.booking.entity.BookingTimeSlot timeSlot = new com.sportbooking.module.booking.entity.BookingTimeSlot();
        timeSlot.setCourt(court);
        timeSlot.setBookingDate(date);
        timeSlot.setTimeSlot(ts);
        timeSlot.setSlotPrice(BigDecimal.valueOf(100000));
        booking.addTimeSlot(timeSlot);

        Booking savedBooking = bookingRepository.saveAndFlush(booking);

        com.sportbooking.module.payment.entity.Payment payment = new com.sportbooking.module.payment.entity.Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(savedBooking.getTotalPrice());
        payment.setMethod(paymentMethod);
        payment.setStatus(paymentStatus);
        paymentRepository.saveAndFlush(payment);

        return savedBooking;
    }

    private String bearerToken(String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        return "Bearer " + jwtAccessTokenService.generateToken(user);
    }
}
