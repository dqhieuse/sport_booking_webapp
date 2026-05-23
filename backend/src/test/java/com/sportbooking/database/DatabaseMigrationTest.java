package com.sportbooking.database;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DatabaseMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void migrationsCreateCoreTablesAndSeedReferenceData() {
        Integer roleCount = jdbcTemplate.queryForObject("select count(*) from roles", Integer.class);
        Integer sportCount = jdbcTemplate.queryForObject("select count(*) from sports", Integer.class);
        Integer timeSlotCount = jdbcTemplate.queryForObject("select count(*) from time_slots", Integer.class);
        Integer userCount = jdbcTemplate.queryForObject("select count(*) from users", Integer.class);
        Integer venueCount = jdbcTemplate.queryForObject("select count(*) from venues", Integer.class);
        Integer courtCount = jdbcTemplate.queryForObject("select count(*) from courts", Integer.class);
        Integer venueImageCount = jdbcTemplate.queryForObject("select count(*) from venue_images", Integer.class);
        Integer courtImageCount = jdbcTemplate.queryForObject("select count(*) from court_images", Integer.class);
        Integer courtTimeSlotCount = jdbcTemplate.queryForObject("select count(*) from court_time_slots", Integer.class);
        Integer bookingTableCount = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_name = 'bookings'",
                Integer.class
        );

        assertThat(roleCount).isEqualTo(3);
        assertThat(sportCount).isEqualTo(5);
        assertThat(timeSlotCount).isEqualTo(8);
        assertThat(userCount).isEqualTo(3);
        assertThat(venueCount).isEqualTo(2);
        assertThat(courtCount).isEqualTo(5);
        assertThat(venueImageCount).isEqualTo(2);
        assertThat(courtImageCount).isEqualTo(5);
        assertThat(courtTimeSlotCount).isEqualTo(40);
        assertThat(bookingTableCount).isEqualTo(1);
    }
}
