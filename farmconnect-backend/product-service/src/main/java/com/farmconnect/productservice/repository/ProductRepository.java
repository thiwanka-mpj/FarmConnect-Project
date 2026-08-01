package com.farmconnect.productservice.repository;

import com.farmconnect.productservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByFarmerId(Long farmerId);
    
    List<Product> findByCategory(String category);
    
    List<Product> findByProductNameContainingIgnoreCase(String productName);
    
    List<Product> findByIsAvailableTrue();

    long countByIsAvailableTrue();
}