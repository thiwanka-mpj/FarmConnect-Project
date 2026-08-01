package com.farmconnect.adminservice.dto;

import java.math.BigDecimal;

public class DashboardStatistics {

    private Long totalUsers;
    private Long totalCustomers;
    private Long totalFarmers;
    private Long totalRiders;
    private Long totalProducts;
    private Long availableProducts;
    private Long totalOrders;
    private Long pendingOrders;
    private Long deliveredOrders;
    private BigDecimal totalRevenue;
    private BigDecimal deliveredRevenue;

    // Constructors
    public DashboardStatistics() {}

    // Getters and Setters
    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getTotalFarmers() {
        return totalFarmers;
    }

    public void setTotalFarmers(Long totalFarmers) {
        this.totalFarmers = totalFarmers;
    }

    public Long getTotalRiders() {
        return totalRiders;
    }

    public void setTotalRiders(Long totalRiders) {
        this.totalRiders = totalRiders;
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Long getAvailableProducts() {
        return availableProducts;
    }

    public void setAvailableProducts(Long availableProducts) {
        this.availableProducts = availableProducts;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public Long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(Long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getDeliveredRevenue() {
        return deliveredRevenue;
    }

    public void setDeliveredRevenue(BigDecimal deliveredRevenue) {
        this.deliveredRevenue = deliveredRevenue;
    }
}