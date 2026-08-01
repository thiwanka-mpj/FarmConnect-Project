package com.farmconnect.orderservice.dto;

import com.farmconnect.orderservice.model.Delivery;
import java.time.LocalDateTime;

public class DeliveryResponse {

    private Long deliveryId;
    private Long orderId;
    private Long riderId;
    private LocalDateTime assignedAt;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveryTime;
    private Delivery.DeliveryStatus status;
    private String deliveryNotes;

    // Constructors
    public DeliveryResponse() {}

    public DeliveryResponse(Delivery delivery) {
        this.deliveryId = delivery.getDeliveryId();
        this.orderId = delivery.getOrderId();
        this.riderId = delivery.getRiderId();
        this.assignedAt = delivery.getAssignedAt();
        this.pickupTime = delivery.getPickupTime();
        this.deliveryTime = delivery.getDeliveryTime();
        this.status = delivery.getStatus();
        this.deliveryNotes = delivery.getDeliveryNotes();
    }

    // Getters and Setters
    public Long getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Long deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getRiderId() {
        return riderId;
    }

    public void setRiderId(Long riderId) {
        this.riderId = riderId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(LocalDateTime pickupTime) {
        this.pickupTime = pickupTime;
    }

    public LocalDateTime getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(LocalDateTime deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public Delivery.DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(Delivery.DeliveryStatus status) {
        this.status = status;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }
}