package com.sportbooking.module.court.service;

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
class PublicCourtServiceTest {

    @Autowired
    private PublicCourtService publicCourtService;

    @Test
    void getActiveCourtsReturnsPagedCourtSummariesWithSportVenueAndPrimaryImage() {
        var response = publicCourtService.getActiveCourts(null, null, null, PageRequest.of(0, 10));

        assertThat(response.items()).hasSize(5);
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(10);
        assertThat(response.totalItems()).isEqualTo(5);
        assertThat(response.items())
                .allSatisfy(court -> {
                    assertThat(court.status().name()).isEqualTo("ACTIVE");
                    assertThat(court.sport().name()).isNotBlank();
                    assertThat(court.venue().address()).isNotBlank();
                    assertThat(court.primaryImageUrl()).isNotBlank();
                });
    }

    @Test
    void getActiveCourtsFiltersByKeyword() {
        var response = publicCourtService.getActiveCourts(null, null, "pickleball", PageRequest.of(0, 10));

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().name()).isEqualTo("Pickleball Court P1");
    }

    @Test
    void getActiveCourtsFiltersBySportId() {
        var allCourts = publicCourtService.getActiveCourts(null, null, "badminton", PageRequest.of(0, 10));
        Long badmintonSportId = allCourts.items().getFirst().sport().id();

        var response = publicCourtService.getActiveCourts(badmintonSportId, null, null, PageRequest.of(0, 10));

        assertThat(response.items()).hasSize(2);
        assertThat(response.items())
                .allSatisfy(court -> assertThat(court.sport().name()).isEqualTo("Badminton"));
    }

    @Test
    void getActiveCourtByIdReturnsDetailWithSportVenueAndPrimaryImage() {
        var listResponse = publicCourtService.getActiveCourts(null, null, "football", PageRequest.of(0, 10));
        Long courtId = listResponse.items().getFirst().id();

        var response = publicCourtService.getActiveCourtById(courtId);

        assertThat(response.name()).isEqualTo("Football Field F1");
        assertThat(response.description()).isNotBlank();
        assertThat(response.sport().name()).isEqualTo("Football");
        assertThat(response.venue().openingTime()).isNotNull();
        assertThat(response.primaryImageUrl()).isNotBlank();
    }

    @Test
    void getActiveCourtByIdThrowsNotFoundWhenCourtDoesNotExist() {
        assertThatThrownBy(() -> publicCourtService.getActiveCourtById(9999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Court not found");
    }
}
