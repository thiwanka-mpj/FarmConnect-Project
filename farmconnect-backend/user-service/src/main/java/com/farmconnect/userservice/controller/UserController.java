package com.farmconnect.userservice.controller;

import com.farmconnect.userservice.dto.UserResponse;
import com.farmconnect.userservice.model.User;
import com.farmconnect.userservice.security.SecurityUtils;
import com.farmconnect.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// CORS is handled centrally by SecurityConfig#corsConfigurationSource - no per-controller wildcard.
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own profile");
        }
        try {
            UserResponse response = userService.getUserProfile(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UserResponse userResponse) {
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own profile");
        }
        try {
            UserResponse response = userService.updateUserProfile(userId, userResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<UserResponse> users = userService.getUsersByRole(userRole);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        // Was previously reachable by anyone with a token, regardless of whose record they
        // asked for - same ownership rule as /profile/{userId} now applies here too.
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own profile");
        }
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new UserResponse(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin-only: full user list, used by admin-service's dashboard. */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<UserResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin-only: used by admin-service's dashboard user-management screen. */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok("User deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin-only: aggregate counts for admin-service's dashboard - avoids shipping every row. */
    @GetMapping("/stats/counts")
    public ResponseEntity<?> getUserCounts() {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        return ResponseEntity.ok(userService.getUserCounts());
    }
}