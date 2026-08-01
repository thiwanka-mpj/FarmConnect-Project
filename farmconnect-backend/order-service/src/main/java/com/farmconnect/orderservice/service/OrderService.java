package com.farmconnect.orderservice.service;

import com.farmconnect.orderservice.client.ProductServiceClient;
import com.farmconnect.orderservice.dto.OrderRequest;
import com.farmconnect.orderservice.dto.OrderResponse;
import com.farmconnect.orderservice.dto.ProductInfo;
import com.farmconnect.orderservice.event.OrderCreatedEvent;
import com.farmconnect.orderservice.event.OrderEventPublisher;
import com.farmconnect.orderservice.event.OrderItemEvent;
import com.farmconnect.orderservice.model.Delivery;
import com.farmconnect.orderservice.model.Order;
import com.farmconnect.orderservice.model.OrderItem;
import com.farmconnect.orderservice.repository.DeliveryRepository;
import com.farmconnect.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private ProductServiceClient productServiceClient;

    @Autowired
    private OrderEventPublisher orderEventPublisher;

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        // Create order
        Order order = new Order();
        order.setCustomerId(orderRequest.getCustomerId());
        order.setFarmerId(orderRequest.getFarmerId());
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setCustomerNotes(orderRequest.getCustomerNotes());

        // Validate every item against product-service instead of trusting whatever
        // price/availability the client sent - price is always taken from product-service,
        // never from the request body.
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItemEvent> eventItems = new ArrayList<>();
        for (var itemDTO : orderRequest.getOrderItems()) {
            ProductInfo product = productServiceClient.getProduct(itemDTO.getProductId());

            if (product == null) {
                throw new RuntimeException("Product " + itemDTO.getProductId() + " not found");
            }
            if (!Boolean.TRUE.equals(product.getIsAvailable())) {
                throw new RuntimeException("Product '" + product.getProductName() + "' is not currently available");
            }
            if (product.getQuantityAvailable() == null || product.getQuantityAvailable() < itemDTO.getQuantity()) {
                throw new RuntimeException("Not enough stock for '" + product.getProductName() + "'");
            }

            OrderItem orderItem = new OrderItem(
                    itemDTO.getProductId(),
                    itemDTO.getQuantity(),
                    product.getPrice()
            );
            orderItem.calculateSubtotal();
            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            eventItems.add(new OrderItemEvent(itemDTO.getProductId(), itemDTO.getQuantity()));
        }

        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Create delivery record
        Delivery delivery = new Delivery(savedOrder.getOrderId());
        deliveryRepository.save(delivery);

        // Stock is decremented asynchronously by product-service once it consumes this event -
        // keeps order creation from depending on a second synchronous write to another service.
        orderEventPublisher.publishOrderCreated(
                new OrderCreatedEvent(savedOrder.getOrderId(), eventItems));

        return new OrderResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        return new OrderResponse(order);
    }

    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customerId).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByFarmer(Long farmerId) {
        return orderRepository.findByFarmerIdOrderByOrderDateDesc(farmerId).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        return new OrderResponse(updatedOrder);
    }

    public List<OrderResponse> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        
        if (order.getStatus() == Order.OrderStatus.DELIVERED || 
            order.getStatus() == Order.OrderStatus.SHIPPED) {
            throw new RuntimeException("Cannot cancel order that is already shipped or delivered!");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    /** Used by admin-service's dashboard - avoids shipping every order row just to count/sum them. */
    public com.farmconnect.orderservice.dto.OrderCounts getOrderCounts() {
        com.farmconnect.orderservice.dto.OrderCounts counts = new com.farmconnect.orderservice.dto.OrderCounts();
        counts.setTotalOrders(orderRepository.count());
        counts.setPendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING));
        counts.setDeliveredOrders(orderRepository.countByStatus(Order.OrderStatus.DELIVERED));
        counts.setTotalRevenue(orderRepository.getTotalRevenue());
        counts.setDeliveredRevenue(orderRepository.getDeliveredOrdersRevenue());
        return counts;
    }
}