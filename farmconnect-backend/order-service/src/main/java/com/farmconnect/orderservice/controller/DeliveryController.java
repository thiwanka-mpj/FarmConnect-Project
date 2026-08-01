package com.farmconnect.orderservice.controller;

import com.farmconnect.orderservice.dto.DeliveryResponse;
import com.farmconnect.orderservice.model.Delivery;
import com.farmconnect.orderservice.security.SecurityUtils;
import com.farmconnect.orderservice.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// CORS is handled centrally by SecurityConfig#corsConfigurationSource - no per-controller wildcard.
@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getDeliveryByOrderId(@PathVariable Long orderId) {
        try {
            DeliveryResponse delivery = deliveryService.getDeliveryByOrderId(orderId);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rider/{riderId}")
    public ResponseEntity<?> getDeliveriesByRider(@PathVariable Long riderId) {
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(riderId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own deliveries");
        }
        try {
            List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByRider(riderId);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingDeliveries() {
        try {
            List<DeliveryResponse> deliveries = deliveryService.getPendingDeliveries();
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllDeliveries() {
        try {
            List<DeliveryResponse> deliveries = deliveryService.getAllDeliveries();
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{deliveryId}/assign")
    public ResponseEntity<?> assignRider(
            @PathVariable Long deliveryId,
            @RequestParam Long riderId) {
        try {
            DeliveryResponse response = deliveryService.assignRider(deliveryId, riderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{deliveryId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long deliveryId,
            @RequestParam String status) {
        try {
            Delivery.DeliveryStatus deliveryStatus = Delivery.DeliveryStatus.valueOf(status.toUpperCase());
            DeliveryResponse response = deliveryService.updateDeliveryStatus(deliveryId, deliveryStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}