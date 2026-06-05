package com.sportbooking.module.court.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.repository.CourtImageRepository;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.sport.entity.SportStatus;
import com.sportbooking.module.sport.repository.SportRepository;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.user.entity.AuthProvider;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.RoleRepository;
import com.sportbooking.module.user.repository.UserRepository;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VendorCourtControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private CourtImageRepository courtImageRepository;

    @Autowired
    private CourtTimeSlotRepository courtTimeSlotRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Test
    void getOwnCourtsReturnsOnlyCurrentVendorCourts() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/courts")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.items", hasSize(5)))
                .andExpect(jsonPath("$.data.items[0].id").exists())
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.items[0].sport.name").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].venue.name").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].primaryImageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].activeTimeSlotCount", is(8)))
                .andExpect(jsonPath("$.data.items[0].createdAt").exists())
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(10)))
                .andExpect(jsonPath("$.data.totalItems", is(5)));
    }

    @Test
    void getOwnCourtsFiltersByVenueSportAndStatus() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        var inactiveCourt = courtRepository.findAll().getFirst();
        inactiveCourt.setStatus(CourtStatus.INACTIVE);
        courtRepository.saveAndFlush(inactiveCourt);

        mockMvc.perform(get("/api/vendor/courts")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("venueId", inactiveCourt.getVenue().getId().toString())
                        .param("sportId", inactiveCourt.getSport().getId().toString())
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].id", is(inactiveCourt.getId().intValue())))
                .andExpect(jsonPath("$.data.items[0].status", is("INACTIVE")));
    }

    @Test
    void getOwnCourtByIdReturnsCurrentVendorCourtDetail() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = courtRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/vendor/courts/{id}", courtId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(courtId.intValue())))
                .andExpect(jsonPath("$.data.sport.name").isNotEmpty())
                .andExpect(jsonPath("$.data.venue.name").isNotEmpty());
    }

    @Test
    void getOwnCourtByIdReturnsForbiddenWhenCourtBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingCourtId = courtRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/vendor/courts/{id}", existingCourtId)
                        .header("Authorization", "Bearer " + otherVendorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot view another vendor's court")));
    }

    @Test
    void getOwnCourtByIdReturnsNotFoundWhenCourtDoesNotExist() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/courts/{id}", 9999)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court not found")));
    }

    @Test
    void getOwnCourtTimeSlotsReturnsConfiguredSlotsForCurrentVendorCourt() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);

        mockMvc.perform(get("/api/vendor/courts/{id}/time-slots", courtId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(8)))
                .andExpect(jsonPath("$.data[0].timeSlotId", is(1)))
                .andExpect(jsonPath("$.data[0].startTime", is("06:00:00")))
                .andExpect(jsonPath("$.data[0].endTime", is("07:00:00")))
                .andExpect(jsonPath("$.data[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data[1].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data[2].status", is("INACTIVE")));
    }

    @Test
    void getOwnCourtTimeSlotsReturnsForbiddenWhenCourtBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingCourtId = courtRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/vendor/courts/{id}/time-slots", existingCourtId)
                        .header("Authorization", "Bearer " + otherVendorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot view another vendor's court time slots")));
    }

    @Test
    void getOwnCourtTimeSlotsReturnsNotFoundWhenCourtDoesNotExist() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/vendor/courts/{id}/time-slots", 9999)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court not found")));
    }

    @Test
    void createCourtCreatesActiveCourtUnderCurrentVendorVenue() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long sportId = sportRepository.findByStatus(SportStatus.ACTIVE).getFirst().getId();
        Long venueId = currentVendorVenueId();

        MvcResult result = mockMvc.perform(post("/api/vendor/courts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Vendor Badminton Court C1",
                                  "sportId": %d,
                                  "venueId": %d,
                                  "pricePerHour": 135000,
                                  "description": "New indoor court",
                                  "timeSlotIds": [1, 2]
                                }
                                """.formatted(sportId, venueId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Court created successfully")))
                .andExpect(jsonPath("$.data.name", is("Vendor Badminton Court C1")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.sport.id", is(sportId.intValue())))
                .andExpect(jsonPath("$.data.venue.id", is(venueId.intValue())))
                .andReturn();

        Integer courtId = JsonPath.read(result.getResponse().getContentAsString(), "$.data.id");
        assertThat(courtTimeSlotRepository.findByCourtIdAndStatus(courtId.longValue(), TimeSlotStatus.ACTIVE))
                .hasSize(2);
    }

    @Test
    void uploadCourtImageStoresFirstImageAsPrimary() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "court.png",
                "image/png",
                "fake-png-content".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/vendor/courts/{id}/images", courtId)
                        .file(image)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Court image uploaded successfully")))
                .andExpect(jsonPath("$.data.imageUrl").exists())
                .andExpect(jsonPath("$.data.isPrimary", is(true)))
                .andExpect(jsonPath("$.data.sortOrder", is(1)))
                .andReturn();

        String imageUrl = JsonPath.read(result.getResponse().getContentAsString(), "$.data.imageUrl");
        assertThat(Files.exists(localCourtImagePath(imageUrl))).isTrue();
        mockMvc.perform(get(URI.create(imageUrl).getPath()))
                .andExpect(status().isOk());
    }

    @Test
    void uploadCourtImageCanInsertAtSortOrderAndSetPrimary() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        uploadCourtImageAndReturnId(accessToken, courtId, "first.png", null, false);

        Long secondImageId = uploadCourtImageAndReturnId(accessToken, courtId, "second.png", 1, true);

        var images = courtImageRepository.findByCourtIdOrderBySortOrderAsc(courtId);
        assertThat(images).hasSize(2);
        assertThat(images.get(0).getId()).isEqualTo(secondImageId);
        assertThat(images.get(0).getSortOrder()).isEqualTo(1);
        assertThat(images.get(0).isPrimary()).isTrue();
        assertThat(images.get(1).getSortOrder()).isEqualTo(2);
        assertThat(images.get(1).isPrimary()).isFalse();
    }

    @Test
    void uploadCourtImageShiftsExistingImagesWhenInsertedInMiddle() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        Long firstImageId = uploadCourtImageAndReturnId(accessToken, courtId, "first.png", null, false);
        Long secondImageId = uploadCourtImageAndReturnId(accessToken, courtId, "second.png", null, false);

        Long middleImageId = uploadCourtImageAndReturnId(accessToken, courtId, "middle.png", 2, false);

        var images = courtImageRepository.findByCourtIdOrderBySortOrderAsc(courtId);
        assertThat(images).hasSize(3);
        assertThat(images).extracting("id").containsExactly(firstImageId, middleImageId, secondImageId);
        assertThat(images).extracting("sortOrder").containsExactly(1, 2, 3);
    }

    @Test
    void uploadCourtImageReturnsBadRequestWhenContentTypeIsInvalid() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "court.txt",
                "text/plain",
                "not-an-image".getBytes()
        );

        mockMvc.perform(multipart("/api/vendor/courts/{id}/images", courtId)
                        .file(image)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court image must be JPEG, PNG, or WebP")));
    }

    @Test
    void uploadCourtImageReturnsBadRequestWhenSortOrderIsInvalid() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "court.png",
                "image/png",
                "fake-png-content".getBytes()
        );

        mockMvc.perform(multipart("/api/vendor/courts/{id}/images", courtId)
                        .file(image)
                        .param("sortOrder", "0")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Sort order must be greater than 0")));
    }

    @Test
    void uploadCourtImageReturnsForbiddenWhenCourtBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingCourtId = courtRepository.findAll().getFirst().getId();
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "court.png",
                "image/png",
                "fake-png-content".getBytes()
        );

        mockMvc.perform(multipart("/api/vendor/courts/{id}/images", existingCourtId)
                        .file(image)
                        .header("Authorization", "Bearer " + otherVendorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot upload images for another vendor's court")));
    }

    @Test
    void setPrimaryCourtImageUnsetsPreviousPrimary() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        Long firstImageId = uploadCourtImageAndReturnId(accessToken, courtId, "first.png", null, false);
        Long secondImageId = uploadCourtImageAndReturnId(accessToken, courtId, "second.png", null, false);

        mockMvc.perform(put("/api/vendor/courts/{id}/images/{imageId}/primary", courtId, secondImageId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Court primary image updated successfully")))
                .andExpect(jsonPath("$.data.id", is(secondImageId.intValue())))
                .andExpect(jsonPath("$.data.isPrimary", is(true)));

        var firstImage = courtImageRepository.findById(firstImageId).orElseThrow();
        var secondImage = courtImageRepository.findById(secondImageId).orElseThrow();
        assertThat(firstImage.isPrimary()).isFalse();
        assertThat(secondImage.isPrimary()).isTrue();
    }

    @Test
    void deleteCourtImageRemovesFileShiftsOrderAndPromotesNextPrimary() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = createCourtAndReturnId(accessToken);
        Long firstImageId = uploadCourtImageAndReturnId(accessToken, courtId, "first.png", null, false);
        Long secondImageId = uploadCourtImageAndReturnId(accessToken, courtId, "second.png", null, false);
        var firstImagePath = localCourtImagePath(courtImageRepository.findById(firstImageId).orElseThrow().getImageUrl());

        mockMvc.perform(delete("/api/vendor/courts/{id}/images/{imageId}", courtId, firstImageId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Court image deleted successfully")));

        assertThat(courtImageRepository.findById(firstImageId)).isEmpty();
        assertThat(Files.exists(firstImagePath)).isFalse();
        var remainingImages = courtImageRepository.findByCourtIdOrderBySortOrderAsc(courtId);
        assertThat(remainingImages).hasSize(1);
        assertThat(remainingImages.getFirst().getId()).isEqualTo(secondImageId);
        assertThat(remainingImages.getFirst().getSortOrder()).isEqualTo(1);
        assertThat(remainingImages.getFirst().isPrimary()).isTrue();
    }

    @Test
    void updateCourtUpdatesOnlyCurrentVendorCourtAndSyncsTimeSlots() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        Long courtId = courtRepository.findAll().getFirst().getId();
        Long sportId = sportRepository.findByStatus(SportStatus.ACTIVE).getFirst().getId();
        Long venueId = currentVendorVenueId();

        mockMvc.perform(put("/api/vendor/courts/{id}", courtId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Updated Vendor Court",
                                  "sportId": %d,
                                  "venueId": %d,
                                  "pricePerHour": 180000,
                                  "description": "",
                                  "timeSlotIds": [1, 2, 3]
                                }
                                """.formatted(sportId, venueId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Court updated successfully")))
                .andExpect(jsonPath("$.data.name", is("Updated Vendor Court")))
                .andExpect(jsonPath("$.data.description").doesNotExist())
                .andExpect(jsonPath("$.data.sport.id", is(sportId.intValue())))
                .andExpect(jsonPath("$.data.venue.id", is(venueId.intValue())));

        var updatedCourt = courtRepository.findById(courtId).orElseThrow();
        assertThat(updatedCourt.getStatus()).isEqualTo(CourtStatus.ACTIVE);
        assertThat(courtTimeSlotRepository.findByCourtIdAndStatus(courtId, TimeSlotStatus.ACTIVE)).hasSize(3);
    }

    @Test
    void createCourtReturnsForbiddenWhenVenueBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();

        mockMvc.perform(post("/api/vendor/courts")
                        .header("Authorization", "Bearer " + otherVendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCourtJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot manage courts under another vendor's venue")));
    }

    @Test
    void updateCourtReturnsForbiddenWhenCourtBelongsToAnotherVendor() throws Exception {
        String otherVendorToken = createVendorAndReturnAccessToken();
        Long existingCourtId = courtRepository.findAll().getFirst().getId();

        mockMvc.perform(put("/api/vendor/courts/{id}", existingCourtId)
                        .header("Authorization", "Bearer " + otherVendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCourtJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("You cannot update another vendor's court")));
    }

    @Test
    void updateCourtReturnsNotFoundWhenCourtDoesNotExist() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(put("/api/vendor/courts/{id}", 9999)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCourtJson()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court not found")));
    }

    @Test
    void createCourtReturnsBadRequestWhenVenueIsInactive() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        var venue = venueRepository.findById(currentVendorVenueId()).orElseThrow();
        venue.setStatus(VenueStatus.INACTIVE);
        venueRepository.saveAndFlush(venue);

        mockMvc.perform(post("/api/vendor/courts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCourtJson()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Venue must be active")));
    }

    @Test
    void createCourtReturnsBadRequestWhenRequestIsInvalid() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(post("/api/vendor/courts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "sportId": null,
                                  "venueId": null,
                                  "pricePerHour": -1,
                                  "description": "Invalid court"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    void createCourtReturnsUnauthorizedWhenAccessTokenIsMissing() throws Exception {
        mockMvc.perform(post("/api/vendor/courts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCourtJson()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Authentication is required")));
    }

    private Long currentVendorVenueId() {
        Long vendorId = userRepository.findByEmail("vendor@sportbooking.local").orElseThrow().getId();
        return venueRepository.findByVendorIdAndStatus(vendorId, VenueStatus.ACTIVE).getFirst().getId();
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

    private Long createCourtAndReturnId(String accessToken) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/vendor/courts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCourtJson()))
                .andExpect(status().isCreated())
                .andReturn();

        Integer id = JsonPath.read(result.getResponse().getContentAsString(), "$.data.id");
        return id.longValue();
    }

    private Long uploadCourtImageAndReturnId(
            String accessToken,
            Long courtId,
            String filename,
            Integer sortOrder,
            boolean isPrimary
    ) throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "file",
                filename,
                "image/png",
                ("fake-content-" + filename).getBytes()
        );
        var request = multipart("/api/vendor/courts/{id}/images", courtId)
                .file(image)
                .header("Authorization", "Bearer " + accessToken)
                .param("isPrimary", Boolean.toString(isPrimary));
        if (sortOrder != null) {
            request.param("sortOrder", sortOrder.toString());
        }

        MvcResult result = mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andReturn();

        Integer id = JsonPath.read(result.getResponse().getContentAsString(), "$.data.id");
        return id.longValue();
    }

    private Path localCourtImagePath(String imageUrl) {
        String filename = Path.of(URI.create(imageUrl).getPath()).getFileName().toString();
        return Path.of("target/test-uploads/courts").toAbsolutePath().normalize().resolve(filename);
    }

    private String createVendorAndReturnAccessToken() {
        User vendor = new User();
        vendor.setFullName("Other Court Vendor");
        vendor.setEmail("other-court-vendor-" + UUID.randomUUID() + "@sportbooking.local");
        vendor.setPhone("09" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        vendor.setRole(roleRepository.findByName(RoleName.VENDOR).orElseThrow());
        vendor.setProvider(AuthProvider.LOCAL);
        vendor.setEmailVerified(true);
        vendor.setStatus(UserStatus.ACTIVE);

        return jwtAccessTokenService.generateToken(userRepository.saveAndFlush(vendor));
    }

    private String validCourtJson() {
        return """
                {
                  "name": "Valid Court",
                  "sportId": 1,
                  "venueId": 1,
                  "pricePerHour": 120000,
                  "description": "Valid court",
                  "timeSlotIds": [1, 2]
                }
                """;
    }
}
