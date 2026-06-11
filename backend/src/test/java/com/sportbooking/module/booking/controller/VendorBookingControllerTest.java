package com.sportbooking.module.booking.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.repository.BookingRepository;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
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
    private com.sportbooking.module.payment.repository.PaymentRepository paymentRepository;

    @Test
    void getVendorBookingsReturnsOnlyOwnBookingsWithPagination() throws Exception {
        User anotherVendor = createTestUser("vendor2@sportbooking.local", com.sportbooking.module.user.entity.RoleName.VENDOR);
        Venue anotherVenue = createTestVenue(anotherVendor, "Another Venue");
        Court anotherCourt = createTestCourt(anotherVenue, "Another Court");
        createTestBooking(anotherCourt, LocalDate.now().plusDays(2));

        Court ownCourt = courtRepository.findById(1L).orElseThrow();
        Booking ownBooking = createTestBooking(ownCourt, LocalDate.now().plusDays(1));

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
        Booking booking1 = createTestBooking(ownCourt, LocalDate.now().plusDays(1));
        booking1.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking1);

        Booking booking2 = createTestBooking(ownCourt, LocalDate.now().plusDays(2));
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

        Booking booking1 = createTestBooking(ownCourt1, LocalDate.now().plusDays(1));
        Booking booking2 = createTestBooking(ownCourt2, LocalDate.now().plusDays(1));

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
        Booking booking1 = createTestBooking(ownCourt, targetDate);
        Booking booking2 = createTestBooking(ownCourt, LocalDate.now().plusDays(1));

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

        Booking booking1 = createTestBooking(ownCourt, LocalDate.now().plusDays(1));
        booking1.setTotalPrice(BigDecimal.valueOf(500000));
        bookingRepository.saveAndFlush(booking1);

        Booking booking2 = createTestBooking(ownCourt, LocalDate.now().plusDays(2));
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

        createTestBooking(ownCourt, date2);
        createTestBooking(ownCourt, date1);

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

    private Booking createTestBooking(Court court, LocalDate date) {
        // Đảm bảo TimeSlot 1 tồn tại trong court_time_slots cho court này để tránh foreign key violation
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
        payment.setMethod(com.sportbooking.module.payment.entity.PaymentMethod.CASH_AT_COURT);
        payment.setStatus(com.sportbooking.module.payment.entity.PaymentStatus.UNPAID);
        paymentRepository.saveAndFlush(payment);

        return savedBooking;
    }

    private String bearerToken(String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        return "Bearer " + jwtAccessTokenService.generateToken(user);
    }
}
