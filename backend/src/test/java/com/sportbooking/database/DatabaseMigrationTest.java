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
        Integer bookingTableCount = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_name = 'bookings'",
                Integer.class
        );

        assertThat(roleCount).isEqualTo(3);
        assertThat(sportCount).isEqualTo(5);
        assertThat(timeSlotCount).isEqualTo(8);
        assertThat(bookingTableCount).isEqualTo(1);
    }
}
