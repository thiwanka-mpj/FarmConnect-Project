package com.farmconnect.orderservice.client;

import com.farmconnect.orderservice.dto.ProductInfo;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Order creation used to blindly trust whatever price/availability the client sent in the
 * request body. This client calls product-service's public GET endpoint (no auth needed -
 * it's the same data anyone browsing the storefront can see) to get authoritative product
 * data before an order is ever committed, wrapped in a circuit breaker + retry so a slow or
 * down product-service degrades gracefully instead of hanging every order request.
 */
@Component
public class ProductServiceClient {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceClient.class);

    private final RestTemplate restTemplate;

    public ProductServiceClient(RestTemplate loadBalancedRestTemplate) {
        this.restTemplate = loadBalancedRestTemplate;
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackGetProduct")
    @Retry(name = "productService")
    public ProductInfo getProduct(Long productId) {
        return restTemplate.getForObject(
                "http://product-service/api/products/{id}", ProductInfo.class, productId);
    }

    /**
     * Called when product-service is down/circuit-open, or the retries are exhausted.
     * A 404 (product genuinely doesn't exist) is a client error, not an infrastructure
     * failure, so it's rethrown as-is rather than treated as a fallback case.
     */
    private ProductInfo fallbackGetProduct(Long productId, Throwable t) {
        if (t instanceof HttpClientErrorException.NotFound) {
            throw (HttpClientErrorException.NotFound) t;
        }
        log.error("product-service unavailable while looking up product {}: {}", productId, t.getMessage());
        throw new ProductServiceUnavailableException(
                "Could not verify product " + productId + " right now - please try again shortly");
    }
}
