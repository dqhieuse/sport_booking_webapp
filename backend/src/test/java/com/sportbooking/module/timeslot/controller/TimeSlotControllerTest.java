package com.sportbooking.module.timeslot.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
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
class TimeSlotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Test
    void getTimeSlotsReturnsGlobalSlotsForVendor() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");

        mockMvc.perform(get("/api/time-slots")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(8)))
                .andExpect(jsonPath("$.data[0].id", is(1)))
                .andExpect(jsonPath("$.data[0].startTime", is("06:00:00")))
                .andExpect(jsonPath("$.data[0].endTime", is("07:00:00")))
                .andExpect(jsonPath("$.data[0].status", is("ACTIVE")));
    }

    @Test
    void getTimeSlotsReturnsGlobalSlotsForAdmin() throws Exception {
        String accessToken = loginAndReturnAccessToken("admin@sportbooking.local");

        mockMvc.perform(get("/api/time-slots")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(8)));
    }

    @Test
    void getTimeSlotsFiltersByStatus() throws Exception {
        String accessToken = loginAndReturnAccessToken("vendor@sportbooking.local");
        var firstSlot = timeSlotRepository.findAllByOrderByStartTimeAscEndTimeAsc().getFirst();
        firstSlot.setStatus(TimeSlotStatus.INACTIVE);
        timeSlotRepository.saveAndFlush(firstSlot);

        mockMvc.perform(get("/api/time-slots")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(firstSlot.getId().intValue())))
                .andExpect(jsonPath("$.data[0].status", is("INACTIVE")));
    }

    @Test
    void getTimeSlotsReturnsForbiddenForRegularUser() throws Exception {
        String accessToken = loginAndReturnAccessToken("user@sportbooking.local");

        mockMvc.perform(get("/api/time-slots")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Vendor or admin role is required")));
    }

    @Test
    void getTimeSlotsReturnsUnauthorizedWhenAccessTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/time-slots"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Authentication is required")));
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
}
