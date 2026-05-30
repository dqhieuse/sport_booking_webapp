package com.sportbooking.module.venue.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.user.entity.AuthProvider;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.RoleRepository;
import com.sportbooking.module.user.repository.UserRepository;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VendorVenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void getOwnVenuesReturnsOnlyCurrentVendorVenues() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/venues")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.items", hasSize(2)))
                .andExpect(jsonPath("$.data.items[0].id").exists())
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.items[0].courtCount").isNumber())
                .andExpect(jsonPath("$.data.items[0].createdAt").exists())
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(10)))
                .andExpect(jsonPath("$.data.totalItems", is(2)));
    }

    @Test
    void getOwnVenuesFiltersByStatus() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        var vendor = userRepository.findByEmail("vendor@sportbooking.local").orElseThrow();
        var inactiveVenue = venueRepository.findByVendorId(vendor.getId()).getFirst();
        inactiveVenue.setStatus(VenueStatus.INACTIVE);
        venueRepository.saveAndFlush(inactiveVenue);

        mockMvc.perform(get("/api/vendor/venues")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].id", is(inactiveVenue.getId().intValue())))
                .andExpect(jsonPath("$.data.items[0].status", is("INACTIVE")));
    }

    @Test
    void getOwnVenueByIdReturnsCurrentVendorVenueDetail() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long venueId = venueRepository.findByVendorId(
                userRepository.findByEmail("vendor@sportbooking.local").orElseThrow().getId()
        ).getFirst().getId();

        mockMvc.perform(get("/api/vendor/venues/{id}", venueId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(venueId.intValue())))
                .andExpect(jsonPath("$.data.vendor.fullName", is("Demo Vendor")));
    }

    @Test
    void getOwnVenueByIdReturnsForbiddenWhenVenueBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingVenueId = venueRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/vendor/venues/{id}", existingVenueId)
                        .header("Authorization", "Bearer " + otherVendorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot view another vendor's venue")));
    }

    @Test
    void getOwnVenueByIdReturnsNotFoundWhenVenueDoesNotExist() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/venues/{id}", 9999)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Venue not found")));
    }

    @Test
    void createVenueCreatesActiveVenueForCurrentVendor() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(post("/api/vendor/venues")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "ABC Sports Complex",
                                  "address": "District 1, Ho Chi Minh City",
                                  "description": "Multi-sport venue",
                                  "phone": "0900000000",
                                  "openingTime": "06:00",
                                  "closingTime": "22:00"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Venue created successfully")))
                .andExpect(jsonPath("$.data.name", is("ABC Sports Complex")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.vendor.fullName", is("Demo Vendor")));
    }

    @Test
    void updateVenueUpdatesOnlyCurrentVendorVenue() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long venueId = venueRepository.findByVendorId(
                userRepository.findByEmail("vendor@sportbooking.local").orElseThrow().getId()
        ).getFirst().getId();

        mockMvc.perform(put("/api/vendor/venues/{id}", venueId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Updated Vendor Venue",
                                  "address": "Updated Address",
                                  "description": "",
                                  "phone": "0900111222",
                                  "openingTime": "07:00",
                                  "closingTime": "21:30"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Venue updated successfully")))
                .andExpect(jsonPath("$.data.name", is("Updated Vendor Venue")))
                .andExpect(jsonPath("$.data.description").doesNotExist())
                .andExpect(jsonPath("$.data.openingTime", is("07:00")))
                .andExpect(jsonPath("$.data.closingTime", is("21:30")));
    }

    @Test
    void updateVenueReturnsForbiddenWhenVenueBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingVenueId = venueRepository.findAll().getFirst().getId();

        mockMvc.perform(put("/api/vendor/venues/{id}", existingVenueId)
                        .header("Authorization", "Bearer " + otherVendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validVenueJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot update another vendor's venue")));
    }

    @Test
    void deactivateVenueSetsVenueAndOwnCourtsInactive() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long venueId = venueRepository.findByVendorId(
                userRepository.findByEmail("vendor@sportbooking.local").orElseThrow().getId()
        ).getFirst().getId();

        mockMvc.perform(delete("/api/vendor/venues/{id}", venueId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Venue deactivated successfully")))
                .andExpect(jsonPath("$.data.id", is(venueId.intValue())))
                .andExpect(jsonPath("$.data.status", is("INACTIVE")));

        var deactivatedVenue = venueRepository.findById(venueId).orElseThrow();
        assertThat(deactivatedVenue.getStatus()).isEqualTo(VenueStatus.INACTIVE);
        assertThat(courtRepository.findByVenueIdAndStatus(venueId, CourtStatus.ACTIVE)).isEmpty();
    }

    @Test
    void deactivateVenueReturnsForbiddenWhenVenueBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingVenueId = venueRepository.findAll().getFirst().getId();

        mockMvc.perform(delete("/api/vendor/venues/{id}", existingVenueId)
                        .header("Authorization", "Bearer " + otherVendorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot deactivate another vendor's venue")));
    }

    @Test
    void deactivateVenueReturnsNotFoundWhenVenueDoesNotExist() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(delete("/api/vendor/venues/{id}", 9999)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Venue not found")));
    }

    @Test
    void createVenueReturnsForbiddenWhenUserIsNotVendor() throws Exception {
        String userToken = loginAndReturnAccessToken("user@sportbooking.local");

        mockMvc.perform(post("/api/vendor/venues")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validVenueJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Access denied")));
    }

    @Test
    void createVenueReturnsUnauthorizedWhenAccessTokenIsMissing() throws Exception {
        mockMvc.perform(post("/api/vendor/venues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validVenueJson()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Authentication is required")));
    }

    @Test
    void createVenueReturnsBadRequestWhenOpeningTimeIsNotBeforeClosingTime() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(post("/api/vendor/venues")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Invalid Time Venue",
                                  "address": "District 1",
                                  "description": "Invalid hours",
                                  "phone": "0900000000",
                                  "openingTime": "22:00",
                                  "closingTime": "06:00"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Opening time must be before closing time")));
    }

    @Test
    void createVenueReturnsBadRequestWhenRequestIsInvalid() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(post("/api/vendor/venues")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "address": "",
                                  "phone": "",
                                  "openingTime": null,
                                  "closingTime": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(5))));
    }

    private String loginAndReturnAccessToken(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        return JsonPath.read(result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    private String createVendorAndReturnAccessToken() {
        User vendor = new User();
        vendor.setFullName("Other Vendor");
        vendor.setEmail("other-vendor-" + UUID.randomUUID() + "@sportbooking.local");
        vendor.setPhone("09" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        vendor.setRole(roleRepository.findByName(RoleName.VENDOR).orElseThrow());
        vendor.setProvider(AuthProvider.LOCAL);
        vendor.setEmailVerified(true);
        vendor.setStatus(UserStatus.ACTIVE);

        return jwtAccessTokenService.generateToken(userRepository.saveAndFlush(vendor));
    }

    private String validVenueJson() {
        return """
                {
                  "name": "Valid Venue",
                  "address": "Valid Address",
                  "description": "Valid description",
                  "phone": "0900000000",
                  "openingTime": "06:00",
                  "closingTime": "22:00"
                }
                """;
    }
}
