INSERT INTO roles (name)
VALUES
    ('USER'),
    ('VENDOR'),
    ('ADMIN');

INSERT INTO sports (name, description, status)
VALUES
    ('Football', 'Outdoor team sport', 'ACTIVE'),
    ('Badminton', 'Indoor racket sport', 'ACTIVE'),
    ('Pickleball', 'Paddle sport combining elements of tennis, badminton, and table tennis', 'ACTIVE'),
    ('Tennis', 'Racket sport played individually or in doubles', 'ACTIVE'),
    ('Basketball', 'Indoor or outdoor team sport', 'ACTIVE');

INSERT INTO time_slots (start_time, end_time, status)
VALUES
    ('06:00', '07:00', 'ACTIVE'),
    ('07:00', '08:00', 'ACTIVE'),
    ('08:00', '09:00', 'ACTIVE'),
    ('17:00', '18:00', 'ACTIVE'),
    ('18:00', '19:00', 'ACTIVE'),
    ('19:00', '20:00', 'ACTIVE'),
    ('20:00', '21:00', 'ACTIVE'),
    ('21:00', '22:00', 'ACTIVE');
