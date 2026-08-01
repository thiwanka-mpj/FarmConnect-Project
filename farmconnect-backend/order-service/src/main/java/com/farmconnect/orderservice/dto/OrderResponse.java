package com.farmconnect.orderservice.dto;

import com.farmconnect.orderservice.model.Order;
import com.farmconnect.orderservice.model.OrderItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {

    private Long orderId;
    private Long customerId;
    private Long farmerId;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private LocalDateTime orderDate;
    private String deliveryAddress;
    private String customerNotes;
    private List<OrderItemResponse> orderItems;

    // Constructors
    public OrderResponse() {}

    public OrderResponse(Order order) {
        this.orderId = order.getOrderId();
        this.customerId = order.getCustomerId();
        this.farmerId = order.getFarmerId();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.orderDate = order.getOrderDate();
        this.deliveryAddress = order.getDeliveryAddress();
        this.customerNotes = order.getCustomerNotes();
        this.orderItems = order.getOrderItems().stream()
                .map(OrderItemResponse::new)
                .collect(Collectors.toList());
    }

    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Order.OrderStatus getStatus() {
        return status;
    }

    public void setStatus(Order.OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getCustomerNotes() {
        return customerNotes;
    }

    public void setCustomerNotes(String customerNotes) {
        this.customerNotes = customerNotes;
    }

    public List<OrderItemResponse> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemResponse> orderItems) {
        this.orderItems = orderItems;
    }

    // Inner class for OrderItem Response
    public static class OrderItemResponse {
        private Long orderItemId;
        private Long productId;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
        private BigDecimal subtotal;

        public OrderItemResponse() {}

        public OrderItemResponse(OrderItem orderItem) {
            this.orderItemId = orderItem.getOrderItemId();
            this.productId = orderItem.getProductId();
            this.quantity = orderItem.getQuantity();
            this.priceAtPurchase = orderItem.getPriceAtPurchase();
            this.subtotal = orderItem.getSubtotal();
        }

        // Getters and Setters
        public Long getOrderItemId() {
            return orderItemId;
        }

        public void setOrderItemId(Long orderItemId) {
            this.orderItemId = orderItemId;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getPriceAtPurchase() {
            return priceAtPurchase;
        }

        public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
            this.priceAtPurchase = priceAtPurchase;
        }

        public BigDecimal getSubtotal() {
            return subtotal;
        }

        public void setSubtotal(BigDecimal subtotal) {
            this.subtotal = subtotal;
        }
    }
}