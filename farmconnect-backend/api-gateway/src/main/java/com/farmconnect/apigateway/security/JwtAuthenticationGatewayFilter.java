package com.farmconnect.apigateway.security;

import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * This is a fast-fail, defense-in-depth layer only. Every downstream service still runs
 * its own full JwtAuthenticationFilter + SecurityConfig and is the source of truth for
 * authorization (role checks, resource ownership, etc.) - the gateway just avoids sending
 * obviously-unauthenticated traffic further into the mesh.
 */
@Component
public class JwtAuthenticationGatewayFilter implements GlobalFilter, Ordered {

    private final JwtValidator jwtValidator;

    // Routes reachable without a token. Product browsing (GET) and auth are public;
    // everything else needs a bearer token to even reach a backend service.
    private static final List<String> PUBLIC_GET_PREFIXES = List.of("/api/products", "/uploads");
    private static final String AUTH_PREFIX = "/api/auth";

    public JwtAuthenticationGatewayFilter(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (isPublic(request, path)) {
            return chain.filter(exchange);
        }

        String header = request.getHeaders().getFirst("Authorization");
        if (header == null || !header.startsWith("Bearer ") || !jwtValidator.isValid(header.substring(7))) {
            return unauthorized(exchange);
        }

        return chain.filter(exchange);
    }

    private boolean isPublic(ServerHttpRequest request, String path) {
        if (path.startsWith(AUTH_PREFIX)) {
            return true;
        }
        if (request.getMethod() == HttpMethod.GET) {
            return PUBLIC_GET_PREFIXES.stream().anyMatch(path::startsWith);
        }
        return false;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        DataBuffer buffer = response.bufferFactory().wrap(
                "{\"error\":\"Missing or invalid bearer token\"}".getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
