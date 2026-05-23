package com.sportbooking.module.court.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicCourtControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getCourtsReturnsActiveCourtsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/courts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.items", hasSize(5)))
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.items[0].sport.name").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].venue.address").isNotEmpty())
                .andExpect(jsonPath("$.data.items[0].primaryImageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.totalItems", is(5)));
    }

    @Test
    void getCourtsFiltersByKeywordAndIgnoresPublicStatusQuery() throws Exception {
        mockMvc.perform(get("/api/courts")
                        .param("keyword", "pickleball")
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].name", is("Pickleball Court P1")))
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")));
    }

    @Test
    void getCourtByIdReturnsCourtDetailsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/courts/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.sport.name").isNotEmpty())
                .andExpect(jsonPath("$.data.venue.openingTime").isNotEmpty())
                .andExpect(jsonPath("$.data.primaryImageUrl").isNotEmpty());
    }

    @Test
    void getCourtByIdReturnsNotFoundWhenCourtDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/courts/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Court not found")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
    }
}
