package com.farmconnect.orderservice.repository;

import com.farmconnect.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByCustomerId(Long customerId);
    
    List<Order> findByFarmerId(Long farmerId);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);
    
    List<Order> findByFarmerIdOrderByOrderDateDesc(Long farmerId);

    long countByStatus(Order.OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    java.math.BigDecimal getTotalRevenue();

    @org.springframework.data.jpa.repository.Query(
            "SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal getDeliveredOrdersRevenue();
}