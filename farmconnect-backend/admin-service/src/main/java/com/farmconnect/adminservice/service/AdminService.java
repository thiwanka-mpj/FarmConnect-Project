package com.farmconnect.adminservice.service;

import com.farmconnect.adminservice.client.OrderServiceClient;
import com.farmconnect.adminservice.client.ProductServiceClient;
import com.farmconnect.adminservice.client.UserServiceClient;
import com.farmconnect.adminservice.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * admin-service owns no database of its own (see database-per-service split) - every
 * number here is fetched live from user-service, product-service, and order-service via
 * their REST APIs, each call wrapped in a circuit breaker + retry (see the *ServiceClient
 * classes). The admin's own JWT is forwarded on every downstream call, so each service's
 * normal authorization checks still apply - this layer aggregates, it doesn't bypass.
 */
@Service
public class AdminService {

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private ProductServiceClient productServiceClient;

    @Autowired
    private OrderServiceClient orderServiceClient;

    public DashboardStatistics getDashboardStatistics() {
        DashboardStatistics stats = new DashboardStatistics();

        UserCounts userCounts = userServiceClient.getUserCounts();
        stats.setTotalUsers(userCounts.getTotalUsers());
        stats.setTotalCustomers(userCounts.getTotalCustomers());
        stats.setTotalFarmers(userCounts.getTotalFarmers());
        stats.setTotalRiders(userCounts.getTotalRiders());

        ProductCounts productCounts = productServiceClient.getProductCounts();
        stats.setTotalProducts(productCounts.getTotalProducts());
        stats.setAvailableProducts(productCounts.getAvailableProducts());

        OrderCounts orderCounts = orderServiceClient.getOrderCounts();
        stats.setTotalOrders(orderCounts.getTotalOrders());
        stats.setPendingOrders(orderCounts.getPendingOrders());
        stats.setDeliveredOrders(orderCounts.getDeliveredOrders());
        stats.setTotalRevenue(orderCounts.getTotalRevenue() != null ? orderCounts.getTotalRevenue() : BigDecimal.ZERO);
        stats.setDeliveredRevenue(orderCounts.getDeliveredRevenue() != null ? orderCounts.getDeliveredRevenue() : BigDecimal.ZERO);

        return stats;
    }

    public List<UserSummary> getAllUsers() {
        return userServiceClient.getAllUsers();
    }

    public UserSummary getUserById(Long userId) {
        return userServiceClient.getUserById(userId);
    }

    public void deleteUser(Long userId) {
        // user-service itself refuses to delete an ADMIN account - no need to duplicate
        // that rule here, just surface whatever it returns.
        userServiceClient.deleteUser(userId);
    }

    public List<ProductSummary> getAllProducts() {
        return productServiceClient.getAllProducts();
    }

    public ProductSummary getProductById(Long productId) {
        return productServiceClient.getProductById(productId);
    }

    public void deleteProduct(Long productId) {
        productServiceClient.deleteProduct(productId);
    }

    public List<OrderSummary> getAllOrders() {
        return orderServiceClient.getAllOrders();
    }

    public OrderSummary getOrderById(Long orderId) {
        return orderServiceClient.getOrderById(orderId);
    }
}
