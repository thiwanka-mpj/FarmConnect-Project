package com.farmconnect.orderservice.controller;

import com.farmconnect.orderservice.dto.OrderRequest;
import com.farmconnect.orderservice.dto.OrderResponse;
import com.farmconnect.orderservice.model.Order;
import com.farmconnect.orderservice.security.AuthenticatedUser;
import com.farmconnect.orderservice.security.SecurityUtils;
import com.farmconnect.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// CORS is handled centrally by SecurityConfig#corsConfigurationSource - no per-controller wildcard.
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        try {
            AuthenticatedUser user = SecurityUtils.currentUser();
            // A customer may only ever place an order as themselves.
            orderRequest.setCustomerId(user.userId());
            OrderResponse response = orderService.createOrder(orderRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<OrderResponse> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);
            if (!canView(order)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot view this order");
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Long customerId) {
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(customerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own orders");
        }
        try {
            List<OrderResponse> orders = orderService.getOrdersByCustomer(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getOrdersByFarmer(@PathVariable Long farmerId) {
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(farmerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own farm's orders");
        }
        try {
            List<OrderResponse> orders = orderService.getOrdersByFarmer(farmerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<OrderResponse> orders = orderService.getOrdersByStatus(orderStatus);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        try {
            OrderResponse existing = orderService.getOrderById(orderId);
            // Farmers update the status of orders placed against their own products; admins can update any.
            if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(existing.getFarmerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot update this order");
            }
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderResponse response = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            OrderResponse existing = orderService.getOrderById(orderId);
            // Only the customer who placed the order (or an admin) may cancel it.
            if (!SecurityUtils.isAdmin() && !SecurityUtils.isOwner(existing.getCustomerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot cancel this order");
            }
            orderService.cancelOrder(orderId);
            return ResponseEntity.ok("Order cancelled successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin-only: aggregate counts/revenue for admin-service's dashboard. */
    @GetMapping("/stats/counts")
    public ResponseEntity<?> getOrderCounts() {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        return ResponseEntity.ok(orderService.getOrderCounts());
    }

    private boolean canView(OrderResponse order) {
        return SecurityUtils.isAdmin()
                || SecurityUtils.isOwner(order.getCustomerId())
                || SecurityUtils.isOwner(order.getFarmerId());
    }
}