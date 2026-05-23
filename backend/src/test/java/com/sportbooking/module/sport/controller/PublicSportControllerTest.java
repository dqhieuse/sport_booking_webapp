package com.sportbooking.module.sport.controller;

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
class PublicSportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getSportsReturnsActiveSportsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/sports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(5)))
                .andExpect(jsonPath("$.data[0].name", is("Badminton")))
                .andExpect(jsonPath("$.data[0].status", is("ACTIVE")));
    }

    @Test
    void getSportsIgnoresStatusQueryForPublicAccess() throws Exception {
        mockMvc.perform(get("/api/sports").param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(5)))
                .andExpect(jsonPath("$.data[0].status", is("ACTIVE")));
    }

    @Test
    void getSportByIdReturnsSportDetailsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/sports/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.name").isNotEmpty())
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));
    }

    @Test
    void getSportByIdReturnsNotFoundWhenSportDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/sports/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Sport not found")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
    }
}
