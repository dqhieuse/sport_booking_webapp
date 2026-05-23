package com.sportbooking.module.venue.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sportbooking.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PublicVenueServiceTest {

    @Autowired
    private PublicVenueService publicVenueService;

    @Test
    void getActiveVenuesReturnsPagedVenueSummariesWithPrimaryImage() {
        var response = publicVenueService.getActiveVenues(null, PageRequest.of(0, 10));

        assertThat(response.items()).hasSize(2);
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.totalItems()).isEqualTo(2);
        assertThat(response.items())
                .allSatisfy(venue -> {
                    assertThat(venue.status().name()).isEqualTo("ACTIVE");
                    assertThat(venue.primaryImageUrl()).isNotBlank();
                });
    }

    @Test
    void getActiveVenuesFiltersByKeyword() {
        var response = publicVenueService.getActiveVenues("sunrise", PageRequest.of(0, 10));

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().name()).isEqualTo("Sunrise Badminton Center");
    }

    @Test
    void getActiveVenueByIdReturnsDetailWithVendorAndPrimaryImage() {
        var listResponse = publicVenueService.getActiveVenues("green", PageRequest.of(0, 10));
        Long venueId = listResponse.items().getFirst().id();

        var response = publicVenueService.getActiveVenueById(venueId);

        assertThat(response.name()).isEqualTo("Green Field Sports Complex");
        assertThat(response.description()).isNotBlank();
        assertThat(response.primaryImageUrl()).isNotBlank();
        assertThat(response.vendor().fullName()).isEqualTo("Demo Vendor");
    }

    @Test
    void getActiveVenueByIdThrowsNotFoundWhenVenueDoesNotExist() {
        assertThatThrownBy(() -> publicVenueService.getActiveVenueById(9999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Venue not found");
    }
}
