package com.farmconnect.adminservice.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    /**
     * @LoadBalanced lets us call http://user-service/... (etc) and have Spring Cloud
     * LoadBalancer resolve the name to a live instance via Eureka. An interceptor forwards
     * the admin's own bearer token onto every downstream call - each service still runs its
     * own full authorization check (ownership, ROLE_ADMIN, etc.) using that same token, so
     * admin-service isn't a bypass around the checks the other services already enforce.
     */
    @Bean
    @LoadBalanced
    public RestTemplate loadBalancedRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(3))
                .interceptors((request, body, execution) -> {
                    ServletRequestAttributes attrs =
                            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attrs != null) {
                        HttpServletRequest currentRequest = attrs.getRequest();
                        String auth = currentRequest.getHeader(HttpHeaders.AUTHORIZATION);
                        if (auth != null) {
                            request.getHeaders().add(HttpHeaders.AUTHORIZATION, auth);
                        }
                    }
                    return execution.execute(request, body);
                })
                .build();
    }
}
