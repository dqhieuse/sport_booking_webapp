ALTER TABLE bookings ADD COLUMN guest_customer_name VARCHAR(100);
ALTER TABLE bookings ADD COLUMN guest_customer_phone VARCHAR(20);
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE bookings
    ADD CONSTRAINT chk_bookings_customer_identity
    CHECK (user_id IS NOT NULL OR guest_customer_name IS NOT NULL);
