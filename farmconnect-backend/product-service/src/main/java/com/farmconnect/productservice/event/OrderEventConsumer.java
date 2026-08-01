package com.farmconnect.productservice.event;

import com.farmconnect.productservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    private final ProductService productService;

    public OrderEventConsumer(ProductService productService) {
        this.productService = productService;
    }

    @KafkaListener(topics = "${kafka.topics.order-events:order-events}")
    public void onOrderCreated(OrderCreatedEvent event) {
        if (event.getItems() == null) {
            return;
        }
        for (OrderItemEvent item : event.getItems()) {
            try {
                productService.decrementQuantity(item.getProductId(), item.getQuantity());
                log.info("Order {}: decremented product {} by {}",
                        event.getOrderId(), item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                // Don't let one bad line item crash the consumer thread / block the rest of the batch.
                log.error("Order {}: failed to decrement product {}: {}",
                        event.getOrderId(), item.getProductId(), e.getMessage());
            }
        }
    }
}
