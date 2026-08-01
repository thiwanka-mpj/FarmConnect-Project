package com.farmconnect.userservice.service;

import com.farmconnect.userservice.dto.AuthResponse;
import com.farmconnect.userservice.dto.LoginRequest;
import com.farmconnect.userservice.dto.SignupRequest;
import com.farmconnect.userservice.model.User;
import com.farmconnect.userservice.repository.UserRepository;
import com.farmconnect.userservice.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UserService userService;

    private SignupRequest signupRequest;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setEmail("farmer@example.com");
        signupRequest.setPassword("plaintext-password");
        signupRequest.setFullName("Test Farmer");
        signupRequest.setRole(User.Role.FARMER);
        signupRequest.setPhoneNumber("0771234567");
        signupRequest.setAddress("Colombo");
    }

    @Test
    void signup_rejectsDuplicateEmail() {
        when(userRepository.existsByEmail("farmer@example.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.signup(signupRequest));
        assertEquals("Email already exists!", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void signup_hashesPasswordBeforeSaving() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("plaintext-password")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(1L);
            return u;
        });
        when(jwtTokenProvider.generateToken(anyString(), anyLong(), anyString())).thenReturn("fake-jwt");

        AuthResponse response = userService.signup(signupRequest);

        assertEquals("fake-jwt", response.getToken());
        assertEquals("farmer@example.com", response.getEmail());
        verify(passwordEncoder).encode("plaintext-password");
        verify(userRepository).save(argThat(u -> "hashed-password".equals(u.getPassword())));
    }

    @Test
    void login_rejectsUnknownEmail() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nobody@example.com");
        request.setPassword("whatever");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.login(request));
    }

    @Test
    void login_rejectsWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("farmer@example.com");
        request.setPassword("wrong-password");

        User existing = new User();
        existing.setUserId(1L);
        existing.setEmail("farmer@example.com");
        existing.setPassword("hashed-password");
        existing.setRole(User.Role.FARMER);

        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("Invalid email or password!", ex.getMessage());
    }

    @Test
    void login_succeedsAndReturnsToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("farmer@example.com");
        request.setPassword("correct-password");

        User existing = new User();
        existing.setUserId(1L);
        existing.setEmail("farmer@example.com");
        existing.setPassword("hashed-password");
        existing.setFullName("Test Farmer");
        existing.setRole(User.Role.FARMER);

        when(userRepository.findByEmail("farmer@example.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("correct-password", "hashed-password")).thenReturn(true);
        when(jwtTokenProvider.generateToken("farmer@example.com", 1L, "FARMER")).thenReturn("fake-jwt");

        AuthResponse response = userService.login(request);

        assertEquals("fake-jwt", response.getToken());
        assertEquals(1L, response.getUserId());
    }
}
