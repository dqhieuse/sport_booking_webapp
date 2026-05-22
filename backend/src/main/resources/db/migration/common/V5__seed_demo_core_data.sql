-- Demo password for seeded local accounts: Password@123
INSERT INTO users (full_name, email, phone, password, role_id, provider, email_verified, status)
VALUES
    (
        'Demo Admin',
        'admin@sportbooking.local',
        '0900000001',
        '$2a$10$l7soS67Kpe6nKIhcyfMEJu4Pgi0trSouiFS60PCA5IjmhA9itbcFa',
        (SELECT id FROM roles WHERE name = 'ADMIN'),
        'LOCAL',
        TRUE,
        'ACTIVE'
    ),
    (
        'Demo Vendor',
        'vendor@sportbooking.local',
        '0900000002',
        '$2a$10$l7soS67Kpe6nKIhcyfMEJu4Pgi0trSouiFS60PCA5IjmhA9itbcFa',
        (SELECT id FROM roles WHERE name = 'VENDOR'),
        'LOCAL',
        TRUE,
        'ACTIVE'
    ),
    (
        'Demo User',
        'user@sportbooking.local',
        '0900000003',
        '$2a$10$l7soS67Kpe6nKIhcyfMEJu4Pgi0trSouiFS60PCA5IjmhA9itbcFa',
        (SELECT id FROM roles WHERE name = 'USER'),
        'LOCAL',
        TRUE,
        'ACTIVE'
    );

INSERT INTO venues (vendor_id, name, address, description, phone, opening_time, closing_time, status)
VALUES
    (
        (SELECT id FROM users WHERE email = 'vendor@sportbooking.local'),
        'Sunrise Badminton Center',
        '12 Le Van Luong, Thanh Xuan, Ha Noi',
        'Indoor badminton venue with clean courts, bright lighting, and evening booking slots.',
        '0243000001',
        '06:00',
        '22:00',
        'ACTIVE'
    ),
    (
        (SELECT id FROM users WHERE email = 'vendor@sportbooking.local'),
        'Green Field Sports Complex',
        '88 Nguyen Van Linh, District 7, Ho Chi Minh City',
        'Outdoor and indoor sport complex for football, tennis, basketball, and pickleball.',
        '0283000002',
        '06:00',
        '22:00',
        'ACTIVE'
    );

INSERT INTO courts (name, sport_id, venue_id, price_per_hour, description, status)
VALUES
    (
        'Badminton Court A1',
        (SELECT id FROM sports WHERE name = 'Badminton'),
        (SELECT id FROM venues WHERE name = 'Sunrise Badminton Center'),
        120000.00,
        'Standard indoor badminton court near the entrance, suitable for casual play.',
        'ACTIVE'
    ),
    (
        'Badminton Court A2',
        (SELECT id FROM sports WHERE name = 'Badminton'),
        (SELECT id FROM venues WHERE name = 'Sunrise Badminton Center'),
        120000.00,
        'Indoor badminton court with good lighting for evening sessions.',
        'ACTIVE'
    ),
    (
        'Football Field F1',
        (SELECT id FROM sports WHERE name = 'Football'),
        (SELECT id FROM venues WHERE name = 'Green Field Sports Complex'),
        450000.00,
        'Outdoor five-a-side football field with artificial turf.',
        'ACTIVE'
    ),
    (
        'Tennis Court T1',
        (SELECT id FROM sports WHERE name = 'Tennis'),
        (SELECT id FROM venues WHERE name = 'Green Field Sports Complex'),
        220000.00,
        'Hard tennis court for singles and doubles practice.',
        'ACTIVE'
    ),
    (
        'Pickleball Court P1',
        (SELECT id FROM sports WHERE name = 'Pickleball'),
        (SELECT id FROM venues WHERE name = 'Green Field Sports Complex'),
        160000.00,
        'Pickleball court prepared for beginner and intermediate players.',
        'ACTIVE'
    );

INSERT INTO venue_images (venue_id, image_url, public_id, sort_order, is_primary)
VALUES
    (
        (SELECT id FROM venues WHERE name = 'Sunrise Badminton Center'),
        'https://placehold.co/1200x800?text=Sunrise+Badminton+Center',
        'demo/venues/sunrise-badminton-primary',
        0,
        TRUE
    ),
    (
        (SELECT id FROM venues WHERE name = 'Green Field Sports Complex'),
        'https://placehold.co/1200x800?text=Green+Field+Sports+Complex',
        'demo/venues/green-field-primary',
        0,
        TRUE
    );

INSERT INTO court_images (court_id, image_url, public_id, sort_order, is_primary)
VALUES
    (
        (SELECT id FROM courts WHERE name = 'Badminton Court A1'),
        'https://placehold.co/1200x800?text=Badminton+Court+A1',
        'demo/courts/badminton-a1-primary',
        0,
        TRUE
    ),
    (
        (SELECT id FROM courts WHERE name = 'Badminton Court A2'),
        'https://placehold.co/1200x800?text=Badminton+Court+A2',
        'demo/courts/badminton-a2-primary',
        0,
        TRUE
    ),
    (
        (SELECT id FROM courts WHERE name = 'Football Field F1'),
        'https://placehold.co/1200x800?text=Football+Field+F1',
        'demo/courts/football-f1-primary',
        0,
        TRUE
    ),
    (
        (SELECT id FROM courts WHERE name = 'Tennis Court T1'),
        'https://placehold.co/1200x800?text=Tennis+Court+T1',
        'demo/courts/tennis-t1-primary',
        0,
        TRUE
    ),
    (
        (SELECT id FROM courts WHERE name = 'Pickleball Court P1'),
        'https://placehold.co/1200x800?text=Pickleball+Court+P1',
        'demo/courts/pickleball-p1-primary',
        0,
        TRUE
    );

INSERT INTO court_time_slots (court_id, time_slot_id, status)
SELECT courts.id, time_slots.id, 'ACTIVE'
FROM courts
CROSS JOIN time_slots
WHERE courts.name IN (
    'Badminton Court A1',
    'Badminton Court A2',
    'Football Field F1',
    'Tennis Court T1',
    'Pickleball Court P1'
)
AND time_slots.status = 'ACTIVE';
