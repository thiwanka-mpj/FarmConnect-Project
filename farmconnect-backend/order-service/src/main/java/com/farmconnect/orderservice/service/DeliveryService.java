package com.farmconnect.orderservice.service;

import com.farmconnect.orderservice.dto.DeliveryResponse;
import com.farmconnect.orderservice.model.Delivery;
import com.farmconnect.orderservice.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery not found for this order!"));
        return new DeliveryResponse(delivery);
    }

    public List<DeliveryResponse> getDeliveriesByRider(Long riderId) {
        return deliveryRepository.findByRiderIdOrderByAssignedAtDesc(riderId).stream()
                .map(DeliveryResponse::new)
                .collect(Collectors.toList());
    }

    public List<DeliveryResponse> getPendingDeliveries() {
        return deliveryRepository.findByStatus(Delivery.DeliveryStatus.PENDING).stream()
                .map(DeliveryResponse::new)
.collect(Collectors.toList());
    }

    public DeliveryResponse assignRider(Long deliveryId, Long riderId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found!"));
        
        delivery.setRiderId(riderId);
        delivery.setStatus(Delivery.DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(LocalDateTime.now());
        
        Delivery updatedDelivery = deliveryRepository.save(delivery);
        return new DeliveryResponse(updatedDelivery);
    }

    public DeliveryResponse updateDeliveryStatus(Long deliveryId, Delivery.DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found!"));
        
        delivery.setStatus(status);
        
        // Set timestamps based on status
        switch (status) {
            case PICKED_UP:
                delivery.setPickupTime(LocalDateTime.now());
                break;
            case DELIVERED:
                delivery.setDeliveryTime(LocalDateTime.now());
                break;
            default:
                break;
        }
        
        Delivery updatedDelivery = deliveryRepository.save(delivery);
        return new DeliveryResponse(updatedDelivery);
    }

    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryRepository.findAll().stream()
                .map(DeliveryResponse::new)
                .collect(Collectors.toList());
    }
}    