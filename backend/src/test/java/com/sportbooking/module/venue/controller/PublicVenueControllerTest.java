package com.sportbooking.module.venue.controller;

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
class PublicVenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getVenuesReturnsActiveVenuesWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/venues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.items", hasSize(2)))
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.items[0].primaryImageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.page", is(0)))
                .andExpect(jsonPath("$.data.size", is(10)))
                .andExpect(jsonPath("$.data.totalItems", is(2)));
    }

    @Test
    void getVenuesFiltersByKeywordAndIgnoresPublicStatusQuery() throws Exception {
        mockMvc.perform(get("/api/venues")
                        .param("keyword", "sunrise")
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].name", is("Sunrise Badminton Center")))
                .andExpect(jsonPath("$.data.items[0].status", is("ACTIVE")));
    }

    @Test
    void getVenueByIdReturnsVenueDetailsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/venues/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.primaryImageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.vendor.fullName", is("Demo Vendor")));
    }

    @Test
    void getVenueByIdReturnsNotFoundWhenVenueDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/venues/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Venue not found")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
    }
}
