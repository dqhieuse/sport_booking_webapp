CREATE UNIQUE INDEX uk_venue_images_primary
    ON venue_images (venue_id)
    WHERE is_primary = TRUE;

CREATE UNIQUE INDEX uk_court_images_primary
    ON court_images (court_id)
    WHERE is_primary = TRUE;

CREATE UNIQUE INDEX uk_bookings_active_slot
    ON bookings (court_id, booking_date, time_slot_id)
    WHERE status IN ('PENDING', 'CONFIRMED');
