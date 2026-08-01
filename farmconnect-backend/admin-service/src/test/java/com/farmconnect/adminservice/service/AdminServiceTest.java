package com.farmconnect.adminservice.service;

import com.farmconnect.adminservice.client.OrderServiceClient;
import com.farmconnect.adminservice.client.ProductServiceClient;
import com.farmconnect.adminservice.client.UserServiceClient;
import com.farmconnect.adminservice.dto.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserServiceClient userServiceClient;
    @Mock
    private ProductServiceClient productServiceClient;
    @Mock
    private OrderServiceClient orderServiceClient;

    @InjectMocks
    private AdminService adminService;

    @Test
    void getDashboardStatistics_aggregatesFromAllThreeServices() {
        UserCounts userCounts = new UserCounts();
        userCounts.setTotalUsers(5);
        userCounts.setTotalCustomers(3);
        userCounts.setTotalFarmers(1);
        userCounts.setTotalRiders(1);
        when(userServiceClient.getUserCounts()).thenReturn(userCounts);

        ProductCounts productCounts = new ProductCounts();
        productCounts.setTotalProducts(10);
        productCounts.setAvailableProducts(8);
        when(productServiceClient.getProductCounts()).thenReturn(productCounts);

        // No orders yet - order-service legitimately returns null for SUM()
        OrderCounts orderCounts = new OrderCounts();
        orderCounts.setTotalOrders(0);
        orderCounts.setPendingOrders(0);
        orderCounts.setDeliveredOrders(0);
        orderCounts.setTotalRevenue(null);
        orderCounts.setDeliveredRevenue(null);
        when(orderServiceClient.getOrderCounts()).thenReturn(orderCounts);

        DashboardStatistics stats = adminService.getDashboardStatistics();

        assertEquals(5, stats.getTotalUsers());
        assertEquals(10, stats.getTotalProducts());
        assertEquals(BigDecimal.ZERO, stats.getTotalRevenue());
        assertEquals(BigDecimal.ZERO, stats.getDeliveredRevenue());
    }

    @Test
    void deleteUser_delegatesToUserServiceClient() {
        adminService.deleteUser(2L);

        verify(userServiceClient).deleteUser(2L);
    }

    @Test
    void deleteProduct_delegatesToProductServiceClient() {
        adminService.deleteProduct(7L);

        verify(productServiceClient).deleteProduct(7L);
    }

    @Test
    void getAllOrders_returnsWhatOrderServiceClientReturns() {
        OrderSummary order = new OrderSummary();
        order.setOrderId(1L);
        order.setTotalAmount(new BigDecimal("500.00"));
        when(orderServiceClient.getAllOrders()).thenReturn(java.util.List.of(order));

        var orders = adminService.getAllOrders();

        assertEquals(1, orders.size());
        assertEquals(new BigDecimal("500.00"), orders.get(0).getTotalAmount());
    }
}
