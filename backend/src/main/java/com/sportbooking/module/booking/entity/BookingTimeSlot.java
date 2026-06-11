package com.sportbooking.module.booking.entity;

import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.timeslot.entity.TimeSlot;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "booking_time_slots")
@Getter
@Setter
@NoArgsConstructor
public class BookingTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "slot_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal slotPrice;

    @Column(name = "active_slot_key", length = 255)
    private String activeSlotKey;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    void updateActiveSlotKey() {
        refreshActiveSlotKey();
    }

    public void refreshActiveSlotKey() {
        BookingStatus bookingStatus = booking.getStatus();
        if (bookingStatus == BookingStatus.PENDING || bookingStatus == BookingStatus.CONFIRMED) {
            activeSlotKey = court.getId() + ":" + bookingDate + ":" + timeSlot.getId();
            return;
        }
        activeSlotKey = null;
    }
}
