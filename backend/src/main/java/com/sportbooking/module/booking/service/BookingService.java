package com.sportbooking.module.booking.service;

import com.sportbooking.common.exception.DuplicateResourceException;
import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.auth.service.CurrentUserService;
import com.sportbooking.module.booking.dto.BookingPaymentResponse;
import com.sportbooking.module.booking.dto.CreateBookingRequest;
import com.sportbooking.module.booking.dto.CreateBookingResponse;
import com.sportbooking.module.booking.dto.CreatedBookingSlotResponse;
import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import com.sportbooking.module.booking.repository.BookingRepository;
import com.sportbooking.module.booking.repository.BookingTimeSlotRepository;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.payment.entity.Payment;
import com.sportbooking.module.payment.entity.PaymentMethod;
import com.sportbooking.module.payment.entity.PaymentStatus;
import com.sportbooking.module.payment.repository.PaymentRepository;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.user.entity.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int MAX_BOOKING_DAYS_AHEAD = 13;
    private static final long MIN_BOOKING_MINUTES = 60;
    private static final long MAX_BOOKING_MINUTES = 180;
    private static final Set<BookingStatus> ACTIVE_BOOKING_STATUSES =
            Set.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final CurrentUserService currentUserService;
    private final CourtRepository courtRepository;
    private final CourtTimeSlotRepository courtTimeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingTimeSlotRepository bookingTimeSlotRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public CreateBookingResponse createBooking(String authorizationHeader, CreateBookingRequest request) {
        User user = currentUserService.requireActiveCustomer(authorizationHeader);
        validateBookingDate(request.bookingDate());

        Court court = courtRepository.findById(request.courtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (court.getStatus() != CourtStatus.ACTIVE) {
            throw new InvalidRequestException("Court is not active");
        }

        List<Long> timeSlotIds = normalizeTimeSlotIds(request.timeSlotIds());
        List<CourtTimeSlot> courtTimeSlots = loadActiveCourtTimeSlots(court.getId(), timeSlotIds);
        int durationMinutes = validateAndCalculateDuration(courtTimeSlots);
        validateBookingTime(request.bookingDate(), courtTimeSlots);
        validateNoDuplicateBookings(court.getId(), request.bookingDate(), courtTimeSlots);

        Booking booking = createBooking(user, court, request, courtTimeSlots);

        Booking savedBooking = saveBookingWithDuplicateProtection(booking);
        Payment savedPayment = paymentRepository.saveAndFlush(
                createPayment(savedBooking, request.paymentMethod())
        );
        return toResponse(savedBooking, savedPayment, durationMinutes);
    }

    private Booking saveBookingWithDuplicateProtection(Booking booking) {
        try {
            return bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateResourceException("One or more selected time slots are no longer available");
        }
    }

    private List<Long> normalizeTimeSlotIds(List<Long> timeSlotIds) {
        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(timeSlotIds);
        if (uniqueIds.size() != timeSlotIds.size()) {
            throw new InvalidRequestException("Time slot IDs must be unique");
        }
        return List.copyOf(uniqueIds);
    }

    private void validateBookingDate(LocalDate bookingDate) {
        LocalDate today = LocalDate.now();
        if (bookingDate.isBefore(today)) {
            throw new InvalidRequestException("Booking date must not be in the past");
        }
        if (bookingDate.isAfter(today.plusDays(MAX_BOOKING_DAYS_AHEAD))) {
            throw new InvalidRequestException("Booking date must be within the next 14 days");
        }
    }

    private List<CourtTimeSlot> loadActiveCourtTimeSlots(Long courtId, List<Long> timeSlotIds) {
        List<CourtTimeSlot> courtTimeSlots = new ArrayList<>();
        for (Long timeSlotId : timeSlotIds) {
            CourtTimeSlot courtTimeSlot = courtTimeSlotRepository
                    .findByCourtIdAndTimeSlotId(courtId, timeSlotId)
                    .orElseThrow(() -> new InvalidRequestException("Time slot is not configured for this court"));

            if (courtTimeSlot.getStatus() != TimeSlotStatus.ACTIVE
                    || courtTimeSlot.getTimeSlot().getStatus() != TimeSlotStatus.ACTIVE) {
                throw new InvalidRequestException("Time slot is not active for this court");
            }
            courtTimeSlots.add(courtTimeSlot);
        }

        return courtTimeSlots.stream()
                .sorted((first, second) -> first.getTimeSlot().getStartTime()
                        .compareTo(second.getTimeSlot().getStartTime()))
                .toList();
    }

    private int validateAndCalculateDuration(List<CourtTimeSlot> courtTimeSlots) {
        long totalMinutes = 0;
        for (int index = 0; index < courtTimeSlots.size(); index++) {
            var currentTimeSlot = courtTimeSlots.get(index).getTimeSlot();
            long slotMinutes = Duration.between(
                    currentTimeSlot.getStartTime(),
                    currentTimeSlot.getEndTime()
            ).toMinutes();
            if (slotMinutes <= 0) {
                throw new InvalidRequestException("Time slot duration is invalid");
            }
            totalMinutes += slotMinutes;

            if (index > 0) {
                var previousTimeSlot = courtTimeSlots.get(index - 1).getTimeSlot();
                if (!previousTimeSlot.getEndTime().equals(currentTimeSlot.getStartTime())) {
                    throw new InvalidRequestException("Selected time slots must be consecutive");
                }
            }
        }

        if (totalMinutes < MIN_BOOKING_MINUTES || totalMinutes > MAX_BOOKING_MINUTES) {
            throw new InvalidRequestException("Booking duration must be between 1 and 3 hours");
        }
        return Math.toIntExact(totalMinutes);
    }

    private void validateBookingTime(LocalDate bookingDate, List<CourtTimeSlot> courtTimeSlots) {
        if (!bookingDate.isEqual(LocalDate.now())) {
            return;
        }

        LocalTime firstStartTime = courtTimeSlots.getFirst().getTimeSlot().getStartTime();
        if (!firstStartTime.isAfter(LocalTime.now())) {
            throw new InvalidRequestException("Selected booking time has already started");
        }
    }

    private void validateNoDuplicateBookings(
            Long courtId,
            LocalDate bookingDate,
            List<CourtTimeSlot> courtTimeSlots
    ) {
        for (CourtTimeSlot courtTimeSlot : courtTimeSlots) {
            boolean duplicateExists = bookingTimeSlotRepository
                    .existsByCourtIdAndBookingDateAndTimeSlotIdAndBookingStatusIn(
                            courtId,
                            bookingDate,
                            courtTimeSlot.getTimeSlot().getId(),
                            ACTIVE_BOOKING_STATUSES
                    );
            if (duplicateExists) {
                throw new DuplicateResourceException("One or more selected time slots are no longer available");
            }
        }
    }

    private Booking createBooking(
            User user,
            Court court,
            CreateBookingRequest request,
            List<CourtTimeSlot> courtTimeSlots
    ) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setBookingDate(request.bookingDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setNote(normalizeNote(request.note()));

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CourtTimeSlot courtTimeSlot : courtTimeSlots) {
            BigDecimal slotPrice = calculateSlotPrice(court, courtTimeSlot);
            totalPrice = totalPrice.add(slotPrice);

            BookingTimeSlot bookingTimeSlot = new BookingTimeSlot();
            bookingTimeSlot.setCourt(court);
            bookingTimeSlot.setBookingDate(request.bookingDate());
            bookingTimeSlot.setTimeSlot(courtTimeSlot.getTimeSlot());
            bookingTimeSlot.setSlotPrice(slotPrice);
            booking.addTimeSlot(bookingTimeSlot);
        }
        booking.setTotalPrice(totalPrice);
        return booking;
    }

    private BigDecimal calculateSlotPrice(Court court, CourtTimeSlot courtTimeSlot) {
        long minutes = Duration.between(
                courtTimeSlot.getTimeSlot().getStartTime(),
                courtTimeSlot.getTimeSlot().getEndTime()
        ).toMinutes();

        return court.getPricePerHour()
                .multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private Payment createPayment(Booking booking, PaymentMethod paymentMethod) {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setMethod(paymentMethod);
        payment.setAmount(booking.getTotalPrice());
        payment.setStatus(paymentMethod == PaymentMethod.VNPAY ? PaymentStatus.PENDING : PaymentStatus.UNPAID);
        return payment;
    }

    private CreateBookingResponse toResponse(Booking booking, Payment payment, int durationMinutes) {
        List<BookingTimeSlot> bookingTimeSlots = booking.getTimeSlots().stream()
                .sorted((first, second) -> first.getTimeSlot().getStartTime()
                        .compareTo(second.getTimeSlot().getStartTime()))
                .toList();

        List<CreatedBookingSlotResponse> slots = bookingTimeSlots.stream()
                .map(bookingTimeSlot -> new CreatedBookingSlotResponse(
                        bookingTimeSlot.getId(),
                        bookingTimeSlot.getTimeSlot().getId(),
                        bookingTimeSlot.getTimeSlot().getStartTime(),
                        bookingTimeSlot.getTimeSlot().getEndTime(),
                        bookingTimeSlot.getSlotPrice()
                ))
                .toList();

        return new CreateBookingResponse(
                booking.getId(),
                booking.getCourt().getId(),
                booking.getCourt().getName(),
                booking.getBookingDate(),
                bookingTimeSlots.getFirst().getTimeSlot().getStartTime(),
                bookingTimeSlots.getLast().getTimeSlot().getEndTime(),
                durationMinutes,
                booking.getTotalPrice(),
                booking.getStatus(),
                slots,
                new BookingPaymentResponse(
                        payment.getMethod(),
                        payment.getStatus(),
                        payment.getAmount(),
                        null
                )
        );
    }

    private String normalizeNote(String note) {
        if (note == null || note.isBlank()) {
            return null;
        }
        return note.trim();
    }
}
