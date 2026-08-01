package com.farmconnect.orderservice.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.order-events:order-events}")
    private String topic;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderCreated(OrderCreatedEvent event) {
        // Fire-and-forget from the request thread; if Kafka is briefly unavailable the
        // order itself has already been committed, so we log rather than fail the request.
        kafkaTemplate.send(topic, String.valueOf(event.getOrderId()), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish OrderCreatedEvent for order {}: {}",
                                event.getOrderId(), ex.getMessage());
                    } else {
                        log.info("Published OrderCreatedEvent for order {}", event.getOrderId());
                    }
                });
    }
}
