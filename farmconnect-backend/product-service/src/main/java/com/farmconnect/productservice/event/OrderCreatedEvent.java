package com.farmconnect.productservice.event;

import java.util.List;

/** Mirrors order-service's event of the same name by shape - no shared jar between services. */
public class OrderCreatedEvent {
    private Long orderId;
    private List<OrderItemEvent> items;

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
