package com.farmconnect.productservice.service;

import com.farmconnect.productservice.dto.ProductRequest;
import com.farmconnect.productservice.dto.ProductResponse;
import com.farmconnect.productservice.model.Product;
import com.farmconnect.productservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ProductService productService;

    private ProductRequest request;

    @BeforeEach
    void setUp() {
        request = new ProductRequest();
        request.setFarmerId(10L);
        request.setProductName("Organic Carrots");
        request.setDescription("Fresh from the farm");
        request.setPrice(new BigDecimal("250.00"));
        request.setQuantityAvailable(50);
        request.setCategory("Vegetables");
        request.setIsAvailable(true);
    }

    @Test
    void createProduct_savesWithGivenFields() {
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setProductId(1L);
            return p;
        });

        ProductResponse response = productService.createProduct(request);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertEquals("Organic Carrots", captor.getValue().getProductName());
        assertEquals(10L, captor.getValue().getFarmerId());
        assertEquals(new BigDecimal("250.00"), response.getPrice());
    }

    @Test
    void deleteProduct_throwsWhenNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> productService.deleteProduct(99L));
    }

    @Test
    void decrementQuantity_neverGoesNegative() {
        Product product = new Product();
        product.setProductId(1L);
        product.setQuantityAvailable(3);
        product.setIsAvailable(true);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        // Order for more than is in stock (e.g. a race between two concurrent orders)
        productService.decrementQuantity(1L, 10);

        assertEquals(0, product.getQuantityAvailable());
        assertFalse(product.getIsAvailable());
    }

    @Test
    void decrementQuantity_stopsAtZeroButStaysAvailableWhenStockRemains() {
        Product product = new Product();
        product.setProductId(1L);
        product.setQuantityAvailable(10);
        product.setIsAvailable(true);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        productService.decrementQuantity(1L, 4);

        assertEquals(6, product.getQuantityAvailable());
        assertTrue(product.getIsAvailable());
    }
}
