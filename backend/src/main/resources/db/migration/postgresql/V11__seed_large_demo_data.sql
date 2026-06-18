-- Large local PostgreSQL dataset for browsing, pagination, and basic performance testing.
-- Expected seed size:
--   users, email_verification_tokens, refresh_tokens: 10000 rows each
--   sports: 20 rows, because this is reference data and should stay small
--   time_slots, venues, courts, venue_images, court_images: 10000 rows each
--   court_time_slots, bookings, booking_time_slots, payments: 10000 rows each
-- Demo password for seeded local accounts: Password@123

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
    'Seed User ' || LPAD(g::TEXT, 5, '0'),
    'seed-user-' || LPAD(g::TEXT, 5, '0') || '@sportbooking.local',
    '091' || LPAD(g::TEXT, 7, '0'),
    '{bcrypt}$2a$10$l7soS67Kpe6nKIhcyfMEJu4Pgi0trSouiFS60PCA5IjmhA9itbcFa',
    CASE
        WHEN g <= 2000 THEN (SELECT id FROM roles WHERE name = 'VENDOR')
        ELSE (SELECT id FROM roles WHERE name = 'USER')
    END,
    'LOCAL',
    TRUE,
    'ACTIVE'
FROM GENERATE_SERIES(1, 10000) AS g;

INSERT INTO email_verification_tokens (
    user_id,
    token,
    expires_at,
    used_at
)
SELECT
    users.id,
    'seed-email-token-' || LPAD(g::TEXT, 5, '0'),
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    CURRENT_TIMESTAMP
FROM GENERATE_SERIES(1, 10000) AS g
JOIN users
    ON users.email = 'seed-user-' || LPAD(g::TEXT, 5, '0') || '@sportbooking.local';

INSERT INTO refresh_tokens (
    user_id,
    token_hash,
    expires_at
)
SELECT
    users.id,
    'seed-refresh-token-hash-' || LPAD(g::TEXT, 5, '0'),
    CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM GENERATE_SERIES(1, 10000) AS g
JOIN users
    ON users.email = 'seed-user-' || LPAD(g::TEXT, 5, '0') || '@sportbooking.local';

INSERT INTO sports (
    name,
    description,
    status
)
SELECT
    'Seed Sport ' || LPAD(g::TEXT, 5, '0'),
    'Generated sport data for local testing #' || g,
    'ACTIVE'
FROM GENERATE_SERIES(1, 20) AS g;

INSERT INTO time_slots (
    start_time,
    end_time,
    status
)
SELECT
    TIME '00:00:00' + (g * INTERVAL '1 second'),
    TIME '00:00:00' + ((g + 1) * INTERVAL '1 second'),
    'ACTIVE'
FROM GENERATE_SERIES(1, 10000) AS g;

WITH numbered_venues AS (
    SELECT
        g,
        ((g - 1) % 2000) + 1 AS vendor_number
    FROM GENERATE_SERIES(1, 10000) AS g
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
    ON users.email = 'seed-user-' || LPAD(numbered_venues.vendor_number::TEXT, 5, '0') || '@sportbooking.local';

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
FROM GENERATE_SERIES(1, 10000) AS g
JOIN sports
    ON sports.name = 'Seed Sport ' || LPAD((((g - 1) % 20) + 1)::TEXT, 5, '0')
JOIN venues
    ON venues.name = 'Seed Venue ' || LPAD(g::TEXT, 5, '0');

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
FROM GENERATE_SERIES(1, 10000) AS g
JOIN venues
    ON venues.name = 'Seed Venue ' || LPAD(g::TEXT, 5, '0');

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
FROM GENERATE_SERIES(1, 10000) AS g
JOIN courts
    ON courts.name = 'Seed Court ' || LPAD(g::TEXT, 5, '0');

INSERT INTO court_time_slots (
    court_id,
    time_slot_id,
    status
)
SELECT
    courts.id,
    time_slots.id,
    'ACTIVE'
FROM GENERATE_SERIES(1, 10000) AS g
JOIN courts
    ON courts.name = 'Seed Court ' || LPAD(g::TEXT, 5, '0')
JOIN time_slots
    ON time_slots.start_time = TIME '00:00:00' + (g * INTERVAL '1 second')
    AND time_slots.end_time = TIME '00:00:00' + ((g + 1) * INTERVAL '1 second');

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
FROM GENERATE_SERIES(1, 10000) AS g
JOIN users
    ON users.email = 'seed-user-' || LPAD((((g - 1) % 8000) + 2001)::TEXT, 5, '0') || '@sportbooking.local'
JOIN courts
    ON courts.name = 'Seed Court ' || LPAD(g::TEXT, 5, '0');

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
FROM GENERATE_SERIES(1, 10000) AS g
JOIN bookings
    ON bookings.note = 'Generated booking data for local testing #' || g
JOIN time_slots
    ON time_slots.start_time = TIME '00:00:00' + (g * INTERVAL '1 second')
    AND time_slots.end_time = TIME '00:00:00' + ((g + 1) * INTERVAL '1 second');

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
FROM GENERATE_SERIES(1, 10000) AS g
JOIN bookings
    ON bookings.note = 'Generated booking data for local testing #' || g;
