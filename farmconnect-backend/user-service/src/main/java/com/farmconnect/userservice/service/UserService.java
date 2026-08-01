package com.farmconnect.userservice.service;

import com.farmconnect.userservice.dto.*;
import com.farmconnect.userservice.model.User;
import com.farmconnect.userservice.repository.UserRepository;
import com.farmconnect.userservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse signup(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        // Create new user
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        user.setRole(signupRequest.getRole());
        user.setPhoneNumber(signupRequest.getPhoneNumber());
        user.setAddress(signupRequest.getAddress());

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(
                savedUser.getEmail(),
                savedUser.getUserId(),
                savedUser.getRole().toString()
        );

        return new AuthResponse(
                token,
                savedUser.getUserId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest loginRequest) {
        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getUserId(),
                user.getRole().toString()
        );

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return new UserResponse(user);
    }

    public UserResponse updateUserProfile(Long userId, UserResponse userResponse) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setFullName(userResponse.getFullName());
        user.setPhoneNumber(userResponse.getPhoneNumber());
        user.setAddress(userResponse.getAddress());

        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }

    public List<UserResponse> getUsersByRole(User.Role role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin user!");
        }
        userRepository.delete(user);
    }

    public UserCounts getUserCounts() {
        UserCounts counts = new UserCounts();
        counts.setTotalUsers(userRepository.count());
        counts.setTotalCustomers(userRepository.countByRole(User.Role.CUSTOMER));
        counts.setTotalFarmers(userRepository.countByRole(User.Role.FARMER));
        counts.setTotalRiders(userRepository.countByRole(User.Role.RIDER));
        return counts;
    }
}