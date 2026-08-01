package com.farmconnect.orderservice.event;

import java.util.List;

/**
 * Published to the "order-events" Kafka topic after an order is committed. product-service
 * consumes this to decrement stock asynchronously instead of order-service reaching into
 * product-service's database directly (which would break service boundaries).
 */
public class OrderCreatedEvent {
    private Long orderId;
    private List<OrderItemEvent> items;

    public OrderCreatedEvent() {
    }

    public OrderCreatedEvent(Long orderId, List<OrderItemEvent> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public List<OrderItemEvent> getItems() {
        return items;
    }

    public void setItems(List<OrderItemEvent> items) {
        this.items = items;
    }
}
