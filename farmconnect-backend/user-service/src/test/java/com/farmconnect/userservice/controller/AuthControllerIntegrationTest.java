package com.farmconnect.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full Spring context, real HTTP layer, real Spring Security filter chain, real (H2) database -
 * exercises signup -> login -> "hit a protected endpoint without a token gets rejected" end to end.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void signupThenLogin_returnsAToken() throws Exception {
        var signupBody = objectMapper.writeValueAsString(new SignupPayload(
                "integration-test@example.com", "supersecret123", "Integration Tester", "CUSTOMER"));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType("application/json")
                        .content(signupBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("integration-test@example.com"));

        var loginBody = objectMapper.writeValueAsString(new LoginPayload(
                "integration-test@example.com", "supersecret123"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        var signupBody = objectMapper.writeValueAsString(new SignupPayload(
                "wrongpass@example.com", "correct-password", "Someone", "CUSTOMER"));
        mockMvc.perform(post("/api/auth/signup").contentType("application/json").content(signupBody))
                .andExpect(status().isCreated());

        var loginBody = objectMapper.writeValueAsString(new LoginPayload(
                "wrongpass@example.com", "totally-wrong"));
        mockMvc.perform(post("/api/auth/login").contentType("application/json").content(loginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withoutToken_isRejected() throws Exception {
        mockMvc.perform(get("/api/users/profile/1"))
                .andExpect(status().isForbidden());
    }

    // Small local payload records - avoids depending on the exact DTO validation annotations
    // for what is fundamentally just a JSON body in this test.
    record SignupPayload(String email, String password, String fullName, String role) {
    }

    record LoginPayload(String email, String password) {
    }
}
