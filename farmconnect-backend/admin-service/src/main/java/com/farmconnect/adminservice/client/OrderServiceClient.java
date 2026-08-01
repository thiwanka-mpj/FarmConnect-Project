package com.farmconnect.adminservice.client;

import com.farmconnect.adminservice.dto.OrderCounts;
import com.farmconnect.adminservice.dto.OrderSummary;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
public class OrderServiceClient {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceClient.class);

    private final RestTemplate restTemplate;

    public OrderServiceClient(RestTemplate loadBalancedRestTemplate) {
        this.restTemplate = loadBalancedRestTemplate;
    }

    @CircuitBreaker(name = "orderService", fallbackMethod = "fallbackCounts")
    @Retry(name = "orderService")
    public OrderCounts getOrderCounts() {
        return restTemplate.getForObject("http://order-service/api/orders/stats/counts", OrderCounts.class);
    }

    @CircuitBreaker(name = "orderService", fallbackMethod = "fallbackList")
    @Retry(name = "orderService")
    public List<OrderSummary> getAllOrders() {
        OrderSummary[] orders = restTemplate.getForObject("http://order-service/api/orders", OrderSummary[].class);
        return orders == null ? Collections.emptyList() : List.of(orders);
    }

    @CircuitBreaker(name = "orderService", fallbackMethod = "fallbackGet")
    @Retry(name = "orderService")
    public OrderSummary getOrderById(Long orderId) {
        return restTemplate.getForObject("http://order-service/api/orders/{id}", OrderSummary.class, orderId);
    }

    private OrderCounts fallbackCounts(Throwable t) {
        log.error("order-service unavailable while fetching counts: {}", t.getMessage());
        throw new DownstreamServiceUnavailableException("order-service", t);
    }

    private List<OrderSummary> fallbackList(Throwable t) {
        log.error("order-service unavailable while fetching all orders: {}", t.getMessage());
        throw new DownstreamServiceUnavailableException("order-service", t);
    }

    private OrderSummary fallbackGet(Long orderId, Throwable t) {
        log.error("order-service unavailable while fetching order {}: {}", orderId, t.getMessage());
        throw new DownstreamServiceUnavailableException("order-service", t);
    }
}
