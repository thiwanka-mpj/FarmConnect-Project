package com.farmconnect.productservice.controller;

import com.farmconnect.productservice.dto.ProductRequest;
import com.farmconnect.productservice.dto.ProductResponse;
import com.farmconnect.productservice.security.AuthenticatedUser;
import com.farmconnect.productservice.security.SecurityUtils;
import com.farmconnect.productservice.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// CORS is handled centrally by SecurityConfig#corsConfigurationSource - no per-controller wildcard.
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        try {
            AuthenticatedUser user = SecurityUtils.currentUser();
            // A farmer may only ever create products under their own account.
            if (!SecurityUtils.isAdmin()) {
                productRequest.setFarmerId(user.userId());
            }
            ProductResponse response = productService.createProduct(productRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductResponse> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableProducts() {
        try {
            List<ProductResponse> products = productService.getAvailableProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        try {
            ProductResponse product = productService.getProductById(productId);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getProductsByFarmer(@PathVariable Long farmerId) {
        try {
            List<ProductResponse> products = productService.getProductsByFarmer(farmerId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String keyword) {
        try {
            List<ProductResponse> products = productService.searchProducts(keyword);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        try {
            List<ProductResponse> products = productService.getProductsByCategory(category);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest productRequest) {
        try {
            if (!canModify(productId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You do not have permission to modify this product");
            }
            ProductResponse response = productService.updateProduct(productId, productRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            if (!canModify(productId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You do not have permission to delete this product");
            }
            productService.deleteProduct(productId);
            return ResponseEntity.ok("Product deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{productId}/quantity")
    public ResponseEntity<?> updateProductQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        try {
            if (!canModify(productId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You do not have permission to modify this product");
            }
            productService.updateProductQuantity(productId, quantity);
            return ResponseEntity.ok("Product quantity updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin-only: aggregate counts for admin-service's dashboard - avoids shipping every row. */
    @GetMapping("/stats/counts")
    public ResponseEntity<?> getProductCounts() {
        return ResponseEntity.ok(productService.getProductCounts());
    }

    /** Admins can modify any product; farmers only the ones they own. */
    private boolean canModify(Long productId) {
        if (SecurityUtils.isAdmin()) {
            return true;
        }
        try {
            ProductResponse existing = productService.getProductById(productId);
            return SecurityUtils.isOwner(existing.getFarmerId());
        } catch (Exception e) {
            return false;
        }
    }
}