package com.farmconnect.productservice.security;

/**
 * The principal stored in the SecurityContext once a JWT is validated.
 * Lets controllers/services check "does this user own this resource" without
 * a network call back to user-service.
 */
public record AuthenticatedUser(Long userId, String email, String role) {
}
