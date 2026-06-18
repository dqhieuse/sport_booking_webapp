package com.sportbooking.module.booking.service;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.DuplicateResourceException;
import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.auth.service.CurrentUserService;
import com.sportbooking.module.booking.dto.BookingPaymentResponse;
import com.sportbooking.module.booking.dto.BookingDetailCourtResponse;
import com.sportbooking.module.booking.dto.BookingDetailPaymentResponse;
import com.sportbooking.module.booking.dto.BookingDetailResponse;
import com.sportbooking.module.booking.dto.BookingDetailUserResponse;
import com.sportbooking.module.booking.dto.BookingDetailVenueResponse;
import com.sportbooking.module.booking.dto.BookingCancellationResponse;
import com.sportbooking.module.booking.dto.CreateBookingRequest;
import com.sportbooking.module.booking.dto.CreateBookingResponse;
import com.sportbooking.module.booking.dto.CreatedBookingSlotResponse;
import com.sportbooking.module.booking.dto.MyBookingCourtResponse;
import com.sportbooking.module.booking.dto.MyBookingPaymentResponse;
import com.sportbooking.module.booking.dto.MyBookingResponse;
import com.sportbooking.module.booking.dto.MyBookingVenueResponse;
import com.sportbooking.module.booking.dto.VendorBookingCourtResponse;
import com.sportbooking.module.booking.dto.VendorBookingPaymentResponse;
import com.sportbooking.module.booking.dto.VendorBookingResponse;
import com.sportbooking.module.booking.dto.VendorBookingActionResponse;
import com.sportbooking.module.booking.dto.VendorBookingUserResponse;
import com.sportbooking.module.booking.dto.VendorCustomerLookupResponse;
import com.sportbooking.module.booking.dto.VendorCreateBookingRequest;
import com.sportbooking.module.booking.entity.Booking;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.entity.BookingTimeSlot;
import com.sportbooking.module.booking.repository.BookingRepository;
import com.sportbooking.module.booking.repository.BookingTimeSlotRepository;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.court.repository.CourtImageRepository;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.payment.entity.Payment;
import com.sportbooking.module.payment.entity.PaymentMethod;
import com.sportbooking.module.payment.entity.PaymentStatus;
import com.sportbooking.module.payment.repository.PaymentRepository;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    private final CourtImageRepository courtImageRepository;
    private final CourtTimeSlotRepository courtTimeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingTimeSlotRepository bookingTimeSlotRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<MyBookingResponse> getMyBookings(
            String authorizationHeader,
            BookingStatus status,
            Pageable pageable
    ) {
        User user = currentUserService.requireActiveCustomer(authorizationHeader);
        var bookingPage = status == null
                ? bookingRepository.findByUserId(user.getId(), pageable)
                : bookingRepository.findByUserIdAndStatus(user.getId(), status, pageable);
        List<Long> bookingIds = bookingPage.stream()
                .map(Booking::getId)
                .toList();
        Map<Long, List<BookingTimeSlot>> timeSlotsByBookingId = loadTimeSlotsByBookingId(bookingIds);
        Map<Long, Payment> paymentsByBookingId = loadPaymentsByBookingId(bookingIds);
        Map<Long, String> primaryImageUrlByCourtId = loadPrimaryCourtImageUrls(
                bookingPage.stream()
                        .map(booking -> booking.getCourt().getId())
                        .distinct()
                        .toList()
        );
        List<MyBookingResponse> items = bookingPage.stream()
                .map(booking -> toMyBookingResponse(
                        booking,
                        timeSlotsByBookingId.getOrDefault(booking.getId(), List.of()),
                        paymentsByBookingId.get(booking.getId()),
                        primaryImageUrlByCourtId.get(booking.getCourt().getId())
                ))
                .toList();

        return PageResponse.from(bookingPage, items);
    }

    @Transactional(readOnly = true)
    public PageResponse<VendorBookingResponse> getVendorBookings(
            String authorizationHeader,
            BookingStatus status,
            Long courtId,
            LocalDate date,
            Pageable pageable
    ) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);

        if (courtId != null) {
            Court court = courtRepository.findById(courtId)
                    .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
            if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
                throw new ForbiddenException("You do not own this court");
            }
        }

        Specification<Booking> specification = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("court").get("venue").get("vendor").get("id"), vendor.getId());
        if (status != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status)
            );
        }
        if (courtId != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("court").get("id"), courtId)
            );
        }
        if (date != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("bookingDate"), date)
            );
        }

        var bookingPage = bookingRepository.findAll(specification, pageable);
        List<Long> bookingIds = bookingPage.stream()
                .map(Booking::getId)
                .toList();

        Map<Long, List<BookingTimeSlot>> timeSlotsByBookingId = loadTimeSlotsByBookingId(bookingIds);
        Map<Long, Payment> paymentsByBookingId = loadPaymentsByBookingId(bookingIds);

        List<VendorBookingResponse> items = bookingPage.stream()
                .map(booking -> toVendorBookingResponse(
                        booking,
                        timeSlotsByBookingId.getOrDefault(booking.getId(), List.of()),
                        paymentsByBookingId.get(booking.getId())
                ))
                .toList();

        return PageResponse.from(bookingPage, items);
    }

    @Transactional
    public CreateBookingResponse createBookingByVendor(
            String authorizationHeader,
            VendorCreateBookingRequest request
    ) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        validateBookingDate(request.bookingDate());

        Court court = courtRepository.findById(request.courtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You do not own this court");
        }
        if (court.getStatus() != CourtStatus.ACTIVE) {
            throw new InvalidRequestException("Court is not active");
        }

        List<Long> timeSlotIds = normalizeTimeSlotIds(request.timeSlotIds());
        List<CourtTimeSlot> courtTimeSlots = loadActiveCourtTimeSlots(court.getId(), timeSlotIds);
        int durationMinutes = validateAndCalculateDuration(courtTimeSlots);
        validateBookingTime(request.bookingDate(), courtTimeSlots);
        validateNoDuplicateBookings(court.getId(), request.bookingDate(), courtTimeSlots);

        Booking booking = createVendorBooking(court, request, courtTimeSlots);
        Booking savedBooking = saveBookingWithDuplicateProtection(booking);
        Payment savedPayment = paymentRepository.saveAndFlush(
                createVendorPayment(savedBooking, request.paymentMethod())
        );
        return toResponse(savedBooking, savedPayment, durationMinutes);
    }

    @Transactional(readOnly = true)
    public VendorCustomerLookupResponse lookupCustomerByVendor(
            String authorizationHeader,
            String identifier
    ) {
        currentUserService.requireActiveVendor(authorizationHeader);
        User customer = findEligibleCustomer(identifier);
        if (customer == null) {
            return VendorCustomerLookupResponse.notFound();
        }
        return new VendorCustomerLookupResponse(
                true,
                customer.getId(),
                customer.getFullName(),
                maskEmail(customer.getEmail()),
                maskPhone(customer.getPhone())
        );
    }

    private VendorBookingResponse toVendorBookingResponse(
            Booking booking,
            List<BookingTimeSlot> bookingTimeSlots,
            Payment payment
    ) {
        if (bookingTimeSlots.isEmpty() || payment == null) {
            throw new IllegalStateException("Booking data is incomplete: " + booking.getId());
        }
        var court = booking.getCourt();
        var bookingUser = booking.getUser();

        return new VendorBookingResponse(
                booking.getId(),
                booking.getBookingDate(),
                bookingTimeSlots.getFirst().getTimeSlot().getStartTime(),
                bookingTimeSlots.getLast().getTimeSlot().getEndTime(),
                booking.getTotalPrice(),
                booking.getStatus(),
                new VendorBookingUserResponse(
                        bookingUser == null ? null : bookingUser.getId(),
                        bookingUser == null ? booking.getGuestCustomerName() : bookingUser.getFullName(),
                        bookingUser == null ? booking.getGuestCustomerPhone() : bookingUser.getPhone()
                ),
                new VendorBookingCourtResponse(court.getId(), court.getName()),
                new VendorBookingPaymentResponse(payment.getMethod(), payment.getStatus())
        );
    }

    private Booking getAndValidateVendorBooking(User vendor, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getCourt().getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You do not own this booking");
        }
        return booking;
    }

    @Transactional
    public VendorBookingActionResponse confirmBookingByVendor(String authorizationHeader, Long bookingId) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Booking booking = getAndValidateVendorBooking(vendor, bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidRequestException("Only pending bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking);

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseThrow();
        return new VendorBookingActionResponse(booking.getId(), booking.getStatus(), payment.getStatus());
    }

    @Transactional
    public VendorBookingActionResponse rejectBookingByVendor(String authorizationHeader, Long bookingId) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Booking booking = getAndValidateVendorBooking(vendor, bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidRequestException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.saveAndFlush(booking);

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseThrow();
        if (payment.getStatus() == PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.REFUND_PENDING);
            payment.setRefundAmount(payment.getAmount());
            payment.setRefundReason("Vendor rejected booking");
            paymentRepository.saveAndFlush(payment);
        }

        return new VendorBookingActionResponse(booking.getId(), booking.getStatus(), payment.getStatus());
    }

    @Transactional
    public VendorBookingActionResponse cancelBookingByVendor(String authorizationHeader, Long bookingId) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Booking booking = getAndValidateVendorBooking(vendor, bookingId);

        validateBookingCanBeCancelled(booking);

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking);

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseThrow();
        if (payment.getStatus() == PaymentStatus.PAID) {
            if (payment.getMethod() == PaymentMethod.VNPAY) {
                payment.setStatus(PaymentStatus.REFUND_PENDING);
                payment.setRefundAmount(payment.getAmount());
                payment.setRefundReason("Vendor cancelled booking");
                paymentRepository.saveAndFlush(payment);
            }
        }

        return new VendorBookingActionResponse(booking.getId(), booking.getStatus(), payment.getStatus());
    }

    @Transactional
    public VendorBookingActionResponse markCashPaidByVendor(String authorizationHeader, Long bookingId) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Booking booking = getAndValidateVendorBooking(vendor, bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new InvalidRequestException("Cannot mark paid for cancelled or rejected booking");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseThrow();
        if (payment.getMethod() != PaymentMethod.CASH_AT_COURT) {
            throw new InvalidRequestException("Only CASH_AT_COURT bookings can be marked as paid");
        }
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new InvalidRequestException("Payment is already paid");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.saveAndFlush(payment);

        return new VendorBookingActionResponse(booking.getId(), booking.getStatus(), payment.getStatus());
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetail(String authorizationHeader, Long bookingId) {
        User currentUser = currentUserService.requireActiveUser(authorizationHeader);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        validateBookingDetailPermission(currentUser, booking);

        return toBookingDetailResponse(booking);
    }

    @Transactional
    public BookingCancellationResponse cancelBooking(String authorizationHeader, Long bookingId) {
        User currentUser = currentUserService.requireActiveCustomer(authorizationHeader);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getUser() == null || !booking.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You cannot cancel this booking");
        }

        validateBookingCanBeCancelled(booking);
        Payment payment = paymentRepository.findByBookingId(bookingId).orElseThrow();
        handleCancellationPayment(payment);

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking);
        if (payment.getStatus() == PaymentStatus.REFUND_PENDING) {
            paymentRepository.saveAndFlush(payment);
        }

        return new BookingCancellationResponse(
                booking.getId(),
                booking.getStatus(),
                payment.getStatus()
        );
    }

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
        List<CourtTimeSlot> courtTimeSlots =
                courtTimeSlotRepository.findByCourtIdAndTimeSlotIdIn(courtId, timeSlotIds);
        if (courtTimeSlots.size() != timeSlotIds.size()) {
            throw new InvalidRequestException("Time slot is not configured for this court");
        }
        for (CourtTimeSlot courtTimeSlot : courtTimeSlots) {
            if (courtTimeSlot.getStatus() != TimeSlotStatus.ACTIVE
                    || courtTimeSlot.getTimeSlot().getStatus() != TimeSlotStatus.ACTIVE) {
                throw new InvalidRequestException("Time slot is not active for this court");
            }
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

    private Booking createVendorBooking(
            Court court,
            VendorCreateBookingRequest request,
            List<CourtTimeSlot> courtTimeSlots
    ) {
        Booking booking = new Booking();
        User customer = findEligibleCustomer(request.customerIdentifier());
        if (normalizeOptionalText(request.customerIdentifier()) != null && customer == null) {
            throw new InvalidRequestException("Customer account is no longer available");
        }
        if (customer != null) {
            booking.setUser(customer);
        } else {
            booking.setGuestCustomerName(request.customerName().trim());
            booking.setGuestCustomerPhone(normalizeOptionalText(request.customerPhone()));
        }
        booking.setCourt(court);
        booking.setBookingDate(request.bookingDate());
        booking.setStatus(
                request.paymentMethod() == PaymentMethod.CASH_AT_COURT
                        ? BookingStatus.CONFIRMED
                        : BookingStatus.PENDING
        );
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

    private Payment createVendorPayment(Booking booking, PaymentMethod paymentMethod) {
        Payment payment = createPayment(booking, paymentMethod);
        if (paymentMethod == PaymentMethod.CASH_AT_COURT) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
        }
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
                        booking.getTotalPrice(),
                        null
                )
        );
    }

    private MyBookingResponse toMyBookingResponse(
            Booking booking,
            List<BookingTimeSlot> bookingTimeSlots,
            Payment payment,
            String primaryImageUrl
    ) {
        if (bookingTimeSlots.isEmpty() || payment == null) {
            throw new IllegalStateException("Booking data is incomplete: " + booking.getId());
        }
        var court = booking.getCourt();
        var venue = court.getVenue();

        return new MyBookingResponse(
                booking.getId(),
                booking.getBookingDate(),
                bookingTimeSlots.getFirst().getTimeSlot().getStartTime(),
                bookingTimeSlots.getLast().getTimeSlot().getEndTime(),
                booking.getTotalPrice(),
                booking.getStatus(),
                new MyBookingCourtResponse(
                        court.getId(),
                        court.getName(),
                        primaryImageUrl
                ),
                new MyBookingVenueResponse(venue.getId(), venue.getName(), venue.getAddress()),
                new MyBookingPaymentResponse(payment.getMethod(), payment.getStatus())
        );
    }

    private Map<Long, List<BookingTimeSlot>> loadTimeSlotsByBookingId(List<Long> bookingIds) {
        if (bookingIds.isEmpty()) {
            return Map.of();
        }

        return bookingTimeSlotRepository.findAllWithTimeSlotByBookingIdIn(bookingIds).stream()
                .collect(Collectors.groupingBy(bookingTimeSlot -> bookingTimeSlot.getBooking().getId()));
    }

    private Map<Long, Payment> loadPaymentsByBookingId(List<Long> bookingIds) {
        if (bookingIds.isEmpty()) {
            return Map.of();
        }

        return paymentRepository.findAllByBookingIdIn(bookingIds).stream()
                .collect(Collectors.toMap(
                        payment -> payment.getBooking().getId(),
                        Function.identity()
                ));
    }

    private Map<Long, String> loadPrimaryCourtImageUrls(List<Long> courtIds) {
        if (courtIds.isEmpty()) {
            return Map.of();
        }

        return courtImageRepository.findPrimaryImagesByCourtIdIn(courtIds).stream()
                .collect(Collectors.toMap(
                        CourtImageRepository.PrimaryImageView::getCourtId,
                        CourtImageRepository.PrimaryImageView::getImageUrl
                ));
    }

    private void validateBookingDetailPermission(User currentUser, Booking booking) {
        RoleName roleName = currentUser.getRole().getName();
        boolean allowed = switch (roleName) {
            case USER -> booking.getUser() != null && booking.getUser().getId().equals(currentUser.getId());
            case VENDOR -> booking.getCourt().getVenue().getVendor().getId().equals(currentUser.getId());
            case ADMIN -> true;
        };
        if (!allowed) {
            throw new ForbiddenException("You cannot view this booking");
        }
    }

    private void validateBookingCanBeCancelled(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidRequestException("Booking cannot be cancelled in its current status");
        }

        if (booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Booking has already started");
        }
        if (booking.getBookingDate().isEqual(LocalDate.now())) {
            LocalTime startTime = booking.getTimeSlots().stream()
                    .map(bookingTimeSlot -> bookingTimeSlot.getTimeSlot().getStartTime())
                    .min(LocalTime::compareTo)
                    .orElseThrow();
            if (!startTime.isAfter(LocalTime.now())) {
                throw new InvalidRequestException("Booking has already started");
            }
        }
    }

    private void handleCancellationPayment(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) {
            return;
        }
        if (payment.getMethod() == PaymentMethod.CASH_AT_COURT) {
            throw new InvalidRequestException("Paid cash booking must be cancelled by the vendor");
        }

        payment.setStatus(PaymentStatus.REFUND_PENDING);
        payment.setRefundAmount(payment.getAmount());
        payment.setRefundReason("User cancelled booking");
    }

    private BookingDetailResponse toBookingDetailResponse(Booking booking) {
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
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElseThrow();
        User bookingUser = booking.getUser();
        var court = booking.getCourt();
        var venue = court.getVenue();

        return new BookingDetailResponse(
                booking.getId(),
                booking.getBookingDate(),
                bookingTimeSlots.getFirst().getTimeSlot().getStartTime(),
                bookingTimeSlots.getLast().getTimeSlot().getEndTime(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getNote(),
                slots,
                new BookingDetailUserResponse(
                        bookingUser == null ? null : bookingUser.getId(),
                        bookingUser == null ? booking.getGuestCustomerName() : bookingUser.getFullName(),
                        bookingUser == null ? null : bookingUser.getEmail(),
                        bookingUser == null ? booking.getGuestCustomerPhone() : bookingUser.getPhone()
                ),
                new BookingDetailCourtResponse(court.getId(), court.getName(), court.getPricePerHour()),
                new BookingDetailVenueResponse(venue.getId(), venue.getName(), venue.getAddress()),
                new BookingDetailPaymentResponse(
                        payment.getMethod(),
                        payment.getStatus(),
                        payment.getAmount(),
                        payment.getPaidAt()
                ),
                booking.getCreatedAt()
        );
    }

    private String normalizeNote(String note) {
        if (note == null || note.isBlank()) {
            return null;
        }
        return note.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private User findEligibleCustomer(String identifier) {
        String normalizedIdentifier = normalizeOptionalText(identifier);
        if (normalizedIdentifier == null) {
            return null;
        }
        return userRepository.findByEmailOrPhone(
                        normalizedIdentifier.toLowerCase(),
                        normalizedIdentifier
                )
                .filter(user -> user.getRole().getName() == RoleName.USER)
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .orElse(null);
    }

    private String maskEmail(String email) {
        int separatorIndex = email.indexOf('@');
        if (separatorIndex <= 1) {
            return email;
        }
        return email.charAt(0) + "***" + email.substring(separatorIndex);
    }

    private String maskPhone(String phone) {
        if (phone.length() <= 4) {
            return phone;
        }
        return "***" + phone.substring(phone.length() - 4);
    }
}
