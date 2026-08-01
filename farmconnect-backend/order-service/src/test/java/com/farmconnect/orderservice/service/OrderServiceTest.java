package com.farmconnect.orderservice.service;

import com.farmconnect.orderservice.client.ProductServiceClient;
import com.farmconnect.orderservice.dto.OrderItemDTO;
import com.farmconnect.orderservice.dto.OrderRequest;
import com.farmconnect.orderservice.dto.OrderResponse;
import com.farmconnect.orderservice.dto.ProductInfo;
import com.farmconnect.orderservice.event.OrderEventPublisher;
import com.farmconnect.orderservice.model.Delivery;
import com.farmconnect.orderservice.model.Order;
import com.farmconnect.orderservice.repository.DeliveryRepository;
import com.farmconnect.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * These tests cover the behaviour added when order-service started validating orders
 * against product-service instead of trusting client-supplied price/availability.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private DeliveryRepository deliveryRepository;
    @Mock
    private ProductServiceClient productServiceClient;
    @Mock
    private OrderEventPublisher orderEventPublisher;

    @InjectMocks
    private OrderService orderService;

    private OrderRequest request;

    @BeforeEach
    void setUp() {
        request = new OrderRequest();
        request.setCustomerId(1L);
        request.setFarmerId(2L);
        request.setDeliveryAddress("123 Galle Road, Colombo");
        // Client sends a suspiciously low price - createOrder must ignore this and use
        // product-service's authoritative price instead.
        request.setOrderItems(List.of(new OrderItemDTO(100L, 2, new BigDecimal("0.01"))));
    }

    private ProductInfo availableProduct(BigDecimal price, int stock) {
        ProductInfo info = new ProductInfo();
        info.setProductId(100L);
        info.setProductName("Organic Tomatoes");
        info.setPrice(price);
        info.setQuantityAvailable(stock);
        info.setIsAvailable(true);
        return info;
    }

    @Test
    void createOrder_usesProductServicePriceNotClientSuppliedPrice() {
        when(productServiceClient.getProduct(100L)).thenReturn(availableProduct(new BigDecimal("300.00"), 10));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setOrderId(50L);
            return o;
        });
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.createOrder(request);

        // 2 units * authoritative 300.00 = 600.00, NOT 2 * 0.01
        assertEquals(0, new BigDecimal("600.00").compareTo(response.getTotalAmount()));
        verify(orderEventPublisher).publishOrderCreated(any());
    }

    @Test
    void createOrder_rejectsWhenProductUnavailable() {
        ProductInfo unavailable = availableProduct(new BigDecimal("300.00"), 10);
        unavailable.setIsAvailable(false);
        when(productServiceClient.getProduct(100L)).thenReturn(unavailable);

        assertThrows(RuntimeException.class, () -> orderService.createOrder(request));
        verify(orderRepository, never()).save(any());
        verify(orderEventPublisher, never()).publishOrderCreated(any());
    }

    @Test
    void createOrder_rejectsWhenInsufficientStock() {
        // Only 1 in stock, but the request asks for 2.
        when(productServiceClient.getProduct(100L)).thenReturn(availableProduct(new BigDecimal("300.00"), 1));

        assertThrows(RuntimeException.class, () -> orderService.createOrder(request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void cancelOrder_rejectsAlreadyShippedOrder() {
        Order shipped = new Order();
        shipped.setOrderId(1L);
        shipped.setStatus(Order.OrderStatus.SHIPPED);

        when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(shipped));

        assertThrows(RuntimeException.class, () -> orderService.cancelOrder(1L));
        verify(orderRepository, never()).save(any());
    }
}
