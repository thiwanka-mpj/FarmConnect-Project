package com.farmconnect.orderservice.repository;

import com.farmconnect.orderservice.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    Optional<Delivery> findByOrderId(Long orderId);
    
    List<Delivery> findByRiderId(Long riderId);
    
    List<Delivery> findByStatus(Delivery.DeliveryStatus status);
    
    List<Delivery> findByRiderIdOrderByAssignedAtDesc(Long riderId);
}