package com.farmconnect.adminservice.client;

import com.farmconnect.adminservice.dto.UserCounts;
import com.farmconnect.adminservice.dto.UserSummary;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestTemplate restTemplate;

    public UserServiceClient(RestTemplate loadBalancedRestTemplate) {
        this.restTemplate = loadBalancedRestTemplate;
    }

    @CircuitBreaker(name = "userService", fallbackMethod = "fallbackCounts")
    @Retry(name = "userService")
    public UserCounts getUserCounts() {
        return restTemplate.getForObject("http://user-service/api/users/stats/counts", UserCounts.class);
    }

    @CircuitBreaker(name = "userService", fallbackMethod = "fallbackList")
    @Retry(name = "userService")
    public List<UserSummary> getAllUsers() {
        UserSummary[] users = restTemplate.getForObject("http://user-service/api/users", UserSummary[].class);
        return users == null ? Collections.emptyList() : List.of(users);
    }

    @CircuitBreaker(name = "userService", fallbackMethod = "fallbackGet")
    @Retry(name = "userService")
    public UserSummary getUserById(Long userId) {
        return restTemplate.getForObject("http://user-service/api/users/{id}", UserSummary.class, userId);
    }

    public void deleteUser(Long userId) {
        // Deletion isn't retried/circuit-broken - retrying a DELETE on a flaky connection
        // risks double-processing; better to surface the failure to the admin directly.
        restTemplate.delete("http://user-service/api/users/{id}", userId);
    }

    private UserCounts fallbackCounts(Throwable t) {
        log.error("user-service unavailable while fetching counts: {}", t.getMessage());
        throw new DownstreamServiceUnavailableException("user-service", t);
    }

    private List<UserSummary> fallbackList(Throwable t) {
        log.error("user-service unavailable while fetching all users: {}", t.getMessage());
        throw new DownstreamServiceUnavailableException("user-service", t);
    }

    private UserSummary fallbackGet(Long userId, Throwable t) {
        log.error("user-service unavailable while fetching user {}: {}", userId, t.getMessage());
        throw new DownstreamServiceUnavailableException("user-service", t);
    }
}
