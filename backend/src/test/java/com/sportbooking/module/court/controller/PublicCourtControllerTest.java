package com.sportbooking.module.court.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import com.sportbooking.module.booking.repository.BookingRepository;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
import com.sportbooking.module.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicCourtControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private CourtTimeSlotRepository courtTimeSlotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Test
    void getCourtsReturnsActiveCourtsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/courts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.items", hasSize(5)))
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.items[0].sport.name").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].venue.address").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].primaryImageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.totalItems", is(5)));
    }

    @Test
    void getCourtsFiltersByKeywordAndIgnoresPublicStatusQuery() throws Exception {
        mockMvc.perform(get("/api/courts")
                        .param("keyword", "pickleball")
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].name", is("Pickleball Court P1")))
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")));
    }

    @Test
    void getCourtByIdReturnsCourtDetailsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/courts/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.sport.name").isNotEmpty())
                .andExpect(jsonPath("$.data.venue.openingTime").isNotEmpty())
                .andExpect(jsonPath("$.data.primaryImageUrl").isNotEmpty());
    }

    @Test
    void getCourtByIdReturnsNotFoundWhenCourtDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/courts/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court not found")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void getCourtImagesReturnsGalleryWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/courts/{id}/images", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].imageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data[0].isPrimary", is(true)))
                .andExpect(jsonPath("$.data[0].sortOrder", is(0)));
    }

    @Test
    void getCourtImagesReturnsNotFoundWhenCourtDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/courts/{id}/images", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court not found")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void getAvailableSlotsReturnsConfiguredSlotsForSelectedDate() throws Exception {
        String bookingDate = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", bookingDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.courtId", is(1)))
                .andExpect(jsonPath("$.data.bookingDate", is(bookingDate)))
                .andExpect(jsonPath("$.data.items", hasSize(8)))
                .andExpect(jsonPath("$.data.items[0].startTime", is("06:00:00")))
                .andExpect(jsonPath("$.data.items[0].status", is("AVAILABLE")));
    }

    @Test
    @Transactional
    void getAvailableSlotsReturnsAvailableBookedAndMaintenanceStatuses() throws Exception {
        LocalDate bookingDate = LocalDate.now().plusDays(1);
        var court = courtRepository.findById(1L).orElseThrow();
        var bookedCourtSlot = courtTimeSlotRepository.findByCourtIdAndTimeSlotId(1L, 1L).orElseThrow();
        var maintenanceCourtSlot = courtTimeSlotRepository.findByCourtIdAndTimeSlotId(1L, 2L).orElseThrow();
        maintenanceCourtSlot.setStatus(TimeSlotStatus.INACTIVE);
        courtTimeSlotRepository.saveAndFlush(maintenanceCourtSlot);

        Booking booking = new Booking();
        booking.setUser(userRepository.findByEmail("user@sportbooking.local").orElseThrow());
        booking.setCourt(court);
        booking.setBookingDate(bookingDate);
        booking.setTotalPrice(BigDecimal.valueOf(120000));
        booking.setStatus(BookingStatus.PENDING);

        BookingTimeSlot bookingTimeSlot = new BookingTimeSlot();
        bookingTimeSlot.setCourt(court);
        bookingTimeSlot.setBookingDate(bookingDate);
        bookingTimeSlot.setTimeSlot(bookedCourtSlot.getTimeSlot());
        bookingTimeSlot.setSlotPrice(BigDecimal.valueOf(120000));
        booking.addTimeSlot(bookingTimeSlot);
        bookingRepository.saveAndFlush(booking);

        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", bookingDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(8)))
                .andExpect(jsonPath("$.data.items[0].status", is("BOOKED")))
                .andExpect(jsonPath("$.data.items[1].status", is("MAINTENANCE")))
                .andExpect(jsonPath("$.data.items[2].status", is("AVAILABLE")));
    }

    @Test
    void getAvailableSlotsRejectsPastDate() throws Exception {
        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", LocalDate.now().minusDays(1).toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Booking date must not be in the past")));
    }

    @Test
    @Transactional
    void getAvailableSlotsMarksElapsedSlotsUnavailableForToday() throws Exception {
        var elapsedSlot = timeSlotRepository.findById(1L).orElseThrow();
        elapsedSlot.setStartTime(LocalTime.MIN);
        elapsedSlot.setEndTime(LocalTime.of(0, 1));
        timeSlotRepository.saveAndFlush(elapsedSlot);

        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[?(@.id == 1)].status", is(java.util.List.of("EXPIRED"))));
    }

    @Test
    void getAvailableSlotsRejectsDateOutsideBookingWindow() throws Exception {
        mockMvc.perform(get("/api/courts/{id}/available-slots", 1)
                        .param("date", LocalDate.now().plusDays(14).toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Booking date must be within the next 14 days")));
    }
}
