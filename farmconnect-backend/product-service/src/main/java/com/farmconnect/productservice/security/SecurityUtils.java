package com.farmconnect.productservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthenticatedUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            return null;
        }
        return user;
    }

    public static boolean isAdmin() {
        AuthenticatedUser user = currentUser();
        return user != null && "ADMIN".equals(user.role());
    }

    public static boolean isOwner(Long resourceOwnerId) {
        AuthenticatedUser user = currentUser();
        return user != null && user.userId() != null && user.userId().equals(resourceOwnerId);
    }
}
