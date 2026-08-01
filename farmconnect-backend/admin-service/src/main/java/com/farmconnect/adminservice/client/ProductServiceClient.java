package com.farmconnect.adminservice.client;

import com.farmconnect.adminservice.dto.ProductCounts;
import com.farmconnect.adminservice.dto.ProductSummary;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
public class ProductServiceClient {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceClient.class);

    private final RestTemplate restTemplate;

    public ProductServiceClient(RestTemplate loadBalancedRestTemplate) {
        this.restTemplate = loadBalancedRestTemplate;
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackCounts")
    @Retry(name = "productService")
    public ProductCounts getProductCounts() {
        return restTemplate.getForObject("http://product-service/api/products/stats/counts", ProductCounts.class);
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackList")
    @Retry(name = "productService")
    public List<ProductSummary> getAllProducts() {
        ProductSummary[] products = restTemplate.getForObject("http://product-service/api/products", ProductSummary[].class);
        return products == null ? Collections.emptyList() : List.of(products);
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackGet")
    @Retry(name = "productService")
    public ProductSummary getProductById(Long productId) {
        return restTemplate.getForObject("http://product-service/api/products/{id}", ProductSummary.class, productId);
    }

    public void deleteProduct(Long productId) {
        restTemplate.delete("http://product-service/api/products/{id}", productId);
    }

    private ProductCounts fallbackCounts(Throwable t) {
        log.error("product-service unavailable while fetching counts: {}", t.getMessage());
        throw new DownstreamServiceUnavailableException("product-service", t);
    }

    private List<ProductSummary> fallbackList(Throwable t) {
        log.error("product-service unavailable while fetching all products: {}", t.getMessage());
        throw new DownstreamServiceUnavailableException("product-service", t);
    }

    private ProductSummary fallbackGet(Long productId, Throwable t) {
        log.error("product-service unavailable while fetching product {}: {}", productId, t.getMessage());
        throw new DownstreamServiceUnavailableException("product-service", t);
    }
}
