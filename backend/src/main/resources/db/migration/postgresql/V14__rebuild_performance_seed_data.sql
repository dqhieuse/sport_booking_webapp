-- Rebuild generated seed data with a more realistic performance dataset.
-- Target size:
--   performance users: 1000 vendors + 9000 customers
--   performance venues: 20000
--   performance courts: 100000
--   performance court_time_slots: 800000
--   performance bookings, booking_time_slots, payments: 200000 each

DELETE FROM payments
WHERE booking_id IN (
    SELECT id
    FROM bookings
    WHERE note LIKE 'Generated booking data for local testing #%'
       OR note LIKE 'Performance booking #%'
);

DELETE FROM booking_time_slots
WHERE booking_id IN (
    SELECT id
    FROM bookings
    WHERE note LIKE 'Generated booking data for local testing #%'
       OR note LIKE 'Performance booking #%'
)
OR court_id IN (
    SELECT id
    FROM courts
    WHERE name LIKE 'Seed Court %'
       OR name LIKE 'Performance Court %'
);

DELETE FROM bookings
WHERE note LIKE 'Generated booking data for local testing #%'
   OR note LIKE 'Performance booking #%'
   OR court_id IN (
       SELECT id
       FROM courts
       WHERE name LIKE 'Seed Court %'
          OR name LIKE 'Performance Court %'
   )
   OR user_id IN (
       SELECT id
       FROM users
       WHERE email LIKE 'seed-user-%@sportbooking.local'
          OR email LIKE 'perf-vendor-%@sportbooking.local'
          OR email LIKE 'perf-customer-%@sportbooking.local'
   );

DELETE FROM court_time_slots
WHERE court_id IN (
    SELECT id
    FROM courts
    WHERE name LIKE 'Seed Court %'
       OR name LIKE 'Performance Court %'
);

DELETE FROM court_images
WHERE public_id LIKE 'seed/courts/%'
   OR public_id LIKE 'performance/courts/%'
   OR court_id IN (
       SELECT id
       FROM courts
       WHERE name LIKE 'Seed Court %'
          OR name LIKE 'Performance Court %'
   );

DELETE FROM courts
WHERE name LIKE 'Seed Court %'
   OR name LIKE 'Performance Court %';

DELETE FROM venue_images
WHERE public_id LIKE 'seed/venues/%'
   OR public_id LIKE 'performance/venues/%'
   OR venue_id IN (
       SELECT id
       FROM venues
       WHERE name LIKE 'Seed Venue %'
          OR name LIKE 'Performance Venue %'
   );

DELETE FROM venues
WHERE name LIKE 'Seed Venue %'
   OR name LIKE 'Performance Venue %'
   OR vendor_id IN (
       SELECT id
       FROM users
       WHERE email LIKE 'seed-user-%@sportbooking.local'
          OR email LIKE 'perf-vendor-%@sportbooking.local'
   );

DELETE FROM refresh_tokens
WHERE token_hash LIKE 'seed-refresh-token-hash-%'
   OR token_hash LIKE 'perf-refresh-token-hash-%'
   OR user_id IN (
       SELECT id
       FROM users
       WHERE email LIKE 'seed-user-%@sportbooking.local'
          OR email LIKE 'perf-vendor-%@sportbooking.local'
          OR email LIKE 'perf-customer-%@sportbooking.local'
   );

DELETE FROM email_verification_tokens
WHERE token LIKE 'seed-email-token-%'
   OR token LIKE 'perf-email-token-%'
   OR user_id IN (
       SELECT id
       FROM users
       WHERE email LIKE 'seed-user-%@sportbooking.local'
          OR email LIKE 'perf-vendor-%@sportbooking.local'
          OR email LIKE 'perf-customer-%@sportbooking.local'
   );

DELETE FROM users
WHERE email LIKE 'seed-user-%@sportbooking.local'
   OR email LIKE 'perf-vendor-%@sportbooking.local'
   OR email LIKE 'perf-customer-%@sportbooking.local';

DELETE FROM sports
WHERE name LIKE 'Seed Sport %'
   OR name LIKE 'Performance Sport %';

DELETE FROM time_slots
WHERE start_time >= TIME '00:00:01'
  AND start_time < TIME '03:00:00';

INSERT INTO users (
    full_name,
    email,
    phone,
    password,
    role_id,
    provider,
    email_verified,
    status
)
SELECT
    'Performance Vendor ' || LPAD(g::TEXT, 6, '0'),
    'perf-vendor-' || LPAD(g::TEXT, 6, '0') || '@sportbooking.local',
    '093' || LPAD(g::TEXT, 7, '0'),
    '{bcrypt}$2a$10$l7soS67Kpe6nKIhcyfMEJu4Pgi0trSouiFS60PCA5IjmhA9itbcFa',
    (SELECT id FROM roles WHERE name = 'VENDOR'),
    'LOCAL',
    TRUE,
    'ACTIVE'
FROM GENERATE_SERIES(1, 1000) AS g;

INSERT INTO users (
    full_name,
    email,
    phone,
    password,
    role_id,
    provider,
    email_verified,
    status
)
SELECT
    'Performance Customer ' || LPAD(g::TEXT, 6, '0'),
    'perf-customer-' || LPAD(g::TEXT, 6, '0') || '@sportbooking.local',
    '095' || LPAD(g::TEXT, 7, '0'),
    '{bcrypt}$2a$10$l7soS67Kpe6nKIhcyfMEJu4Pgi0trSouiFS60PCA5IjmhA9itbcFa',
    (SELECT id FROM roles WHERE name = 'USER'),
    'LOCAL',
    TRUE,
    'ACTIVE'
FROM GENERATE_SERIES(1, 9000) AS g;

INSERT INTO email_verification_tokens (
    user_id,
    token,
    expires_at,
    used_at
)
SELECT
    users.id,
    'perf-email-token-' || LPAD(g::TEXT, 6, '0'),
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    CURRENT_TIMESTAMP
FROM GENERATE_SERIES(1, 10000) AS g
JOIN users
    ON users.email = CASE
        WHEN g <= 1000 THEN 'perf-vendor-' || LPAD(g::TEXT, 6, '0') || '@sportbooking.local'
        ELSE 'perf-customer-' || LPAD((g - 1000)::TEXT, 6, '0') || '@sportbooking.local'
    END;

INSERT INTO refresh_tokens (
    user_id,
    token_hash,
    expires_at
)
SELECT
    users.id,
    'perf-refresh-token-hash-' || LPAD(g::TEXT, 6, '0'),
    CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM GENERATE_SERIES(1, 10000) AS g
JOIN users
    ON users.email = CASE
        WHEN g <= 1000 THEN 'perf-vendor-' || LPAD(g::TEXT, 6, '0') || '@sportbooking.local'
        ELSE 'perf-customer-' || LPAD((g - 1000)::TEXT, 6, '0') || '@sportbooking.local'
    END;

WITH numbered_venues AS (
    SELECT
        g,
        ((g - 1) % 1000) + 1 AS vendor_number
    FROM GENERATE_SERIES(1, 20000) AS g
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
    'Performance Venue ' || LPAD(numbered_venues.g::TEXT, 6, '0'),
    CASE numbered_venues.g % 5
        WHEN 0 THEN numbered_venues.g || ' Nguyen Trai, Thanh Xuan, Ha Noi'
        WHEN 1 THEN numbered_venues.g || ' Le Loi, District 1, Ho Chi Minh City'
        WHEN 2 THEN numbered_venues.g || ' Bach Dang, Hai Chau, Da Nang'
        WHEN 3 THEN numbered_venues.g || ' Tran Phu, Nha Trang'
        ELSE numbered_venues.g || ' Vo Van Kiet, Can Tho'
    END,
    'Performance seed venue with multiple courts, images, and booking history #' || numbered_venues.g,
    '094' || LPAD(numbered_venues.g::TEXT, 7, '0'),
    CASE WHEN numbered_venues.g % 4 = 0 THEN TIME '05:30' ELSE TIME '06:00' END,
    CASE WHEN numbered_venues.g % 3 = 0 THEN TIME '23:00' ELSE TIME '22:00' END,
    CASE WHEN numbered_venues.g % 40 = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM numbered_venues
JOIN users
    ON users.email = 'perf-vendor-' || LPAD(numbered_venues.vendor_number::TEXT, 6, '0') || '@sportbooking.local';

INSERT INTO venue_images (
    venue_id,
    image_url,
    public_id,
    sort_order,
    is_primary
)
SELECT
    venues.id,
    'https://placehold.co/1200x800?text=Performance+Venue+' || LPAD(g::TEXT, 6, '0'),
    'performance/venues/' || LPAD(g::TEXT, 6, '0') || '/primary',
    0,
    TRUE
FROM GENERATE_SERIES(1, 20000) AS g
JOIN venues
    ON venues.name = 'Performance Venue ' || LPAD(g::TEXT, 6, '0');

WITH sport_pool AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY name) AS sport_number
    FROM sports
    WHERE name IN ('Badminton', 'Basketball', 'Football', 'Pickleball', 'Tennis')
),
numbered_courts AS (
    SELECT
        g,
        ((g - 1) % 20000) + 1 AS venue_number,
        ((g - 1) % 5) + 1 AS sport_number
    FROM GENERATE_SERIES(1, 100000) AS g
)
INSERT INTO courts (
    name,
    sport_id,
    venue_id,
    price_per_hour,
    description,
    status
)
SELECT
    'Performance Court ' || LPAD(numbered_courts.g::TEXT, 6, '0'),
    sport_pool.id,
    venues.id,
    90000 + ((numbered_courts.g % 18) * 10000),
    'Performance seed court with configured slots and booking history #' || numbered_courts.g,
    CASE
        WHEN numbered_courts.g % 50 = 0 THEN 'MAINTENANCE'
        WHEN numbered_courts.g % 90 = 0 THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END
FROM numbered_courts
JOIN venues
    ON venues.name = 'Performance Venue ' || LPAD(numbered_courts.venue_number::TEXT, 6, '0')
JOIN sport_pool
    ON sport_pool.sport_number = numbered_courts.sport_number;

INSERT INTO court_images (
    court_id,
    image_url,
    public_id,
    sort_order,
    is_primary
)
SELECT
    courts.id,
    'https://placehold.co/1200x800?text=Performance+Court+' || LPAD(g::TEXT, 6, '0'),
    'performance/courts/' || LPAD(g::TEXT, 6, '0') || '/primary',
    0,
    TRUE
FROM GENERATE_SERIES(1, 100000) AS g
JOIN courts
    ON courts.name = 'Performance Court ' || LPAD(g::TEXT, 6, '0');

WITH base_slots AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY start_time) AS slot_number
    FROM time_slots
    WHERE start_time IN (
        TIME '06:00',
        TIME '07:00',
        TIME '08:00',
        TIME '17:00',
        TIME '18:00',
        TIME '19:00',
        TIME '20:00',
        TIME '21:00'
    )
),
performance_courts AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY name) AS court_number
    FROM courts
    WHERE name LIKE 'Performance Court %'
)
INSERT INTO court_time_slots (
    court_id,
    time_slot_id,
    status
)
SELECT
    performance_courts.id,
    base_slots.id,
    'ACTIVE'
FROM performance_courts
CROSS JOIN base_slots;

WITH base_slots AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY start_time) AS slot_number
    FROM time_slots
    WHERE start_time IN (
        TIME '06:00',
        TIME '07:00',
        TIME '08:00',
        TIME '17:00',
        TIME '18:00',
        TIME '19:00',
        TIME '20:00',
        TIME '21:00'
    )
),
numbered_bookings AS (
    SELECT
        g,
        ((g - 1) % 100000) + 1 AS court_number,
        ((g - 1) % 9000) + 1 AS customer_number,
        ((g - 1) % 8) + 1 AS slot_number,
        ((g - 1) / 100000)::INTEGER AS date_offset
    FROM GENERATE_SERIES(1, 200000) AS g
)
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
    CURRENT_DATE + numbered_bookings.date_offset,
    courts.price_per_hour,
    CASE
        WHEN numbered_bookings.g % 15 = 0 THEN 'COMPLETED'
        WHEN numbered_bookings.g % 13 = 0 THEN 'CANCELLED'
        WHEN numbered_bookings.g % 11 = 0 THEN 'REJECTED'
        WHEN numbered_bookings.g % 7 = 0 THEN 'PENDING'
        ELSE 'CONFIRMED'
    END,
    'Performance booking #' || numbered_bookings.g,
    NULL,
    NULL
FROM numbered_bookings
JOIN users
    ON users.email = 'perf-customer-' || LPAD(numbered_bookings.customer_number::TEXT, 6, '0') || '@sportbooking.local'
JOIN courts
    ON courts.name = 'Performance Court ' || LPAD(numbered_bookings.court_number::TEXT, 6, '0')
JOIN base_slots
    ON base_slots.slot_number = numbered_bookings.slot_number;

WITH base_slots AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY start_time) AS slot_number
    FROM time_slots
    WHERE start_time IN (
        TIME '06:00',
        TIME '07:00',
        TIME '08:00',
        TIME '17:00',
        TIME '18:00',
        TIME '19:00',
        TIME '20:00',
        TIME '21:00'
    )
),
numbered_booking_slots AS (
    SELECT
        g,
        ((g - 1) % 8) + 1 AS slot_number
    FROM GENERATE_SERIES(1, 200000) AS g
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
    base_slots.id,
    bookings.total_price,
    CASE
        WHEN bookings.status IN ('PENDING', 'CONFIRMED')
            THEN bookings.court_id || ':' || bookings.booking_date || ':' || base_slots.id
        ELSE NULL
    END
FROM numbered_booking_slots
JOIN bookings
    ON bookings.note = 'Performance booking #' || numbered_booking_slots.g
JOIN base_slots
    ON base_slots.slot_number = numbered_booking_slots.slot_number;

INSERT INTO payments (
    booking_id,
    method,
    amount,
    status,
    provider_transaction_id,
    paid_at,
    refund_amount,
    refund_reason,
    refunded_at
)
SELECT
    bookings.id,
    CASE
        WHEN g % 3 = 0 THEN 'VNPAY'
        ELSE 'CASH_AT_COURT'
    END,
    bookings.total_price,
    CASE
        WHEN bookings.status = 'CANCELLED' THEN 'REFUNDED'
        WHEN bookings.status = 'REJECTED' THEN 'FAILED'
        WHEN bookings.status = 'PENDING' THEN 'UNPAID'
        ELSE 'PAID'
    END,
    CASE
        WHEN bookings.status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')
            THEN 'PERF-TXN-' || LPAD(g::TEXT, 6, '0')
        ELSE NULL
    END,
    CASE
        WHEN bookings.status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')
            THEN CURRENT_TIMESTAMP - ((g % 30) * INTERVAL '1 day')
        ELSE NULL
    END,
    CASE
        WHEN bookings.status = 'CANCELLED' THEN bookings.total_price
        ELSE NULL
    END,
    CASE
        WHEN bookings.status = 'CANCELLED' THEN 'Performance seed cancellation refund'
        ELSE NULL
    END,
    CASE
        WHEN bookings.status = 'CANCELLED'
            THEN CURRENT_TIMESTAMP - ((g % 10) * INTERVAL '1 day')
        ELSE NULL
    END
FROM GENERATE_SERIES(1, 200000) AS g
JOIN bookings
    ON bookings.note = 'Performance booking #' || g;

ANALYZE users;
ANALYZE venues;
ANALYZE courts;
ANALYZE court_time_slots;
ANALYZE bookings;
ANALYZE booking_time_slots;
ANALYZE payments;
