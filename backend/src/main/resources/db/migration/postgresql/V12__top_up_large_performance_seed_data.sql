-- Top up data after V11 has already been applied locally.
-- Adds rows 10001..100000 for high-traffic tables used in performance testing.

WITH numbered_venues AS (
    SELECT
        g,
        ((g - 1) % 2000) + 1 AS vendor_number
    FROM GENERATE_SERIES(10001, 100000) AS g
)
INSERT INTO venues (
    vendor_id,
    name,
    address,
    description,
    phone,
    opening_time,
    closing_time,
    status
)
SELECT
    users.id,
    'Seed Venue ' || LPAD(numbered_venues.g::TEXT, 5, '0'),
    'Seed Address ' || numbered_venues.g || ', Ho Chi Minh City',
    'Generated venue data for local testing #' || numbered_venues.g,
    '092' || LPAD(numbered_venues.g::TEXT, 7, '0'),
    '06:00',
    '22:00',
    'ACTIVE'
FROM numbered_venues
JOIN users
    ON users.email = 'seed-user-' || LPAD(numbered_venues.vendor_number::TEXT, 5, '0') || '@sportbooking.local'
WHERE NOT EXISTS (
    SELECT 1
    FROM venues existing_venues
    WHERE existing_venues.name = 'Seed Venue ' || LPAD(numbered_venues.g::TEXT, 5, '0')
);

INSERT INTO courts (
    name,
    sport_id,
    venue_id,
    price_per_hour,
    description,
    status
)
SELECT
    'Seed Court ' || LPAD(g::TEXT, 5, '0'),
    sports.id,
    venues.id,
    80000 + ((g % 12) * 10000),
    'Generated court data for local testing #' || g,
    CASE
        WHEN g % 25 = 0 THEN 'MAINTENANCE'
        ELSE 'ACTIVE'
    END
FROM GENERATE_SERIES(10001, 100000) AS g
JOIN sports
    ON sports.name = 'Seed Sport ' || LPAD((((g - 1) % 20) + 1)::TEXT, 5, '0')
JOIN venues
    ON venues.name = 'Seed Venue ' || LPAD(g::TEXT, 5, '0')
WHERE NOT EXISTS (
    SELECT 1
    FROM courts existing_courts
    WHERE existing_courts.name = 'Seed Court ' || LPAD(g::TEXT, 5, '0')
);

INSERT INTO venue_images (
    venue_id,
    image_url,
    public_id,
    sort_order,
    is_primary
)
SELECT
    venues.id,
    'https://placehold.co/1200x800?text=Seed+Venue+' || LPAD(g::TEXT, 5, '0'),
    'seed/venues/' || LPAD(g::TEXT, 5, '0') || '/primary',
    0,
    TRUE
FROM GENERATE_SERIES(10001, 100000) AS g
JOIN venues
    ON venues.name = 'Seed Venue ' || LPAD(g::TEXT, 5, '0')
WHERE NOT EXISTS (
    SELECT 1
    FROM venue_images existing_venue_images
    WHERE existing_venue_images.public_id = 'seed/venues/' || LPAD(g::TEXT, 5, '0') || '/primary'
);

INSERT INTO court_images (
    court_id,
    image_url,
    public_id,
    sort_order,
    is_primary
)
SELECT
    courts.id,
    'https://placehold.co/1200x800?text=Seed+Court+' || LPAD(g::TEXT, 5, '0'),
    'seed/courts/' || LPAD(g::TEXT, 5, '0') || '/primary',
    0,
    TRUE
FROM GENERATE_SERIES(10001, 100000) AS g
JOIN courts
    ON courts.name = 'Seed Court ' || LPAD(g::TEXT, 5, '0')
WHERE NOT EXISTS (
    SELECT 1
    FROM court_images existing_court_images
    WHERE existing_court_images.public_id = 'seed/courts/' || LPAD(g::TEXT, 5, '0') || '/primary'
);

WITH numbered_court_time_slots AS (
    SELECT
        g,
        ((g - 1) % 10000) + 1 AS time_slot_number
    FROM GENERATE_SERIES(10001, 100000) AS g
)
INSERT INTO court_time_slots (
    court_id,
    time_slot_id,
    status
)
SELECT
    courts.id,
    time_slots.id,
    'ACTIVE'
FROM numbered_court_time_slots
JOIN courts
    ON courts.name = 'Seed Court ' || LPAD(numbered_court_time_slots.g::TEXT, 5, '0')
JOIN time_slots
    ON time_slots.start_time = TIME '00:00:00' + (numbered_court_time_slots.time_slot_number * INTERVAL '1 second')
    AND time_slots.end_time = TIME '00:00:00' + ((numbered_court_time_slots.time_slot_number + 1) * INTERVAL '1 second')
WHERE NOT EXISTS (
    SELECT 1
    FROM court_time_slots existing_court_time_slots
    WHERE existing_court_time_slots.court_id = courts.id
      AND existing_court_time_slots.time_slot_id = time_slots.id
);

INSERT INTO bookings (
    user_id,
    court_id,
    booking_date,
    total_price,
    status,
    note,
    guest_customer_name,
    guest_customer_phone
)
SELECT
    users.id,
    courts.id,
    CURRENT_DATE + (g % 30)::INTEGER,
    courts.price_per_hour,
    CASE
        WHEN g % 10 = 0 THEN 'COMPLETED'
        WHEN g % 9 = 0 THEN 'CANCELLED'
        WHEN g % 7 = 0 THEN 'PENDING'
        ELSE 'CONFIRMED'
    END,
    'Generated booking data for local testing #' || g,
    NULL,
    NULL
FROM GENERATE_SERIES(10001, 100000) AS g
JOIN users
    ON users.email = 'seed-user-' || LPAD((((g - 1) % 8000) + 2001)::TEXT, 5, '0') || '@sportbooking.local'
JOIN courts
    ON courts.name = 'Seed Court ' || LPAD(g::TEXT, 5, '0')
WHERE NOT EXISTS (
    SELECT 1
    FROM bookings existing_bookings
    WHERE existing_bookings.note = 'Generated booking data for local testing #' || g
);

WITH numbered_booking_time_slots AS (
    SELECT
        g,
        ((g - 1) % 10000) + 1 AS time_slot_number
    FROM GENERATE_SERIES(10001, 100000) AS g
)
INSERT INTO booking_time_slots (
    booking_id,
    court_id,
    booking_date,
    time_slot_id,
    slot_price,
    active_slot_key
)
SELECT
    bookings.id,
    bookings.court_id,
    bookings.booking_date,
    time_slots.id,
    bookings.total_price,
    CASE
        WHEN bookings.status IN ('PENDING', 'CONFIRMED')
            THEN bookings.court_id || ':' || bookings.booking_date || ':' || time_slots.id
        ELSE NULL
    END
FROM numbered_booking_time_slots
JOIN bookings
    ON bookings.note = 'Generated booking data for local testing #' || numbered_booking_time_slots.g
JOIN time_slots
    ON time_slots.start_time = TIME '00:00:00' + (numbered_booking_time_slots.time_slot_number * INTERVAL '1 second')
    AND time_slots.end_time = TIME '00:00:00' + ((numbered_booking_time_slots.time_slot_number + 1) * INTERVAL '1 second')
WHERE NOT EXISTS (
    SELECT 1
    FROM booking_time_slots existing_booking_time_slots
    WHERE existing_booking_time_slots.booking_id = bookings.id
      AND existing_booking_time_slots.time_slot_id = time_slots.id
);

INSERT INTO payments (
    booking_id,
    method,
    amount,
    status,
    provider_transaction_id,
    paid_at
)
SELECT
    bookings.id,
    CASE
        WHEN g % 2 = 0 THEN 'VNPAY'
        ELSE 'CASH_AT_COURT'
    END,
    bookings.total_price,
    CASE
        WHEN bookings.status = 'CANCELLED' THEN 'REFUNDED'
        WHEN bookings.status = 'PENDING' THEN 'UNPAID'
        ELSE 'PAID'
    END,
    CASE
        WHEN bookings.status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')
            THEN 'SEED-TXN-' || LPAD(g::TEXT, 5, '0')
        ELSE NULL
    END,
    CASE
        WHEN bookings.status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')
            THEN CURRENT_TIMESTAMP - ((g % 20) * INTERVAL '1 day')
        ELSE NULL
    END
FROM GENERATE_SERIES(10001, 100000) AS g
JOIN bookings
    ON bookings.note = 'Generated booking data for local testing #' || g
WHERE NOT EXISTS (
    SELECT 1
    FROM payments existing_payments
    WHERE existing_payments.booking_id = bookings.id
);
