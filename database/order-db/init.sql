-- order-service's database. customer_id/farmer_id/rider_id are plain columns pointing at
-- user-service's data, and product_id in order_items points at product-service's data -
-- none of these are FKs across the database boundary. order-service validates them via
-- API calls (see ProductServiceClient) instead. FKs are only kept *within* this database
-- (order_items/deliveries -> orders), since those tables are genuinely owned together.

CREATE TABLE `orders` (
  `order_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `customer_id` bigint(20) NOT NULL,
  `farmer_id` bigint(20) NOT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','PREPARING','READY_FOR_DELIVERY','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_address` text NOT NULL,
  `customer_notes` text DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_date` (`order_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `order_items` (
  `order_item_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `deliveries` (
  `delivery_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL,
  `rider_id` bigint(20) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `delivery_time` timestamp NULL DEFAULT NULL,
  `status` enum('PENDING','ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','FAILED') DEFAULT 'PENDING',
  `delivery_notes` text DEFAULT NULL,
  PRIMARY KEY (`delivery_id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_rider` (`rider_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed data (synthetic)
INSERT INTO `orders` (`order_id`, `customer_id`, `farmer_id`, `total_amount`, `status`, `order_date`, `delivery_address`, `customer_notes`) VALUES
(1, 5, 2, 680.00, 'CONFIRMED', '2025-10-02 06:37:23', 'No 45, Galle Road, Colombo 07', 'Please deliver before 6 PM'),
(2, 5, 2, 680.00, 'PENDING', '2025-10-03 01:00:07', 'No 123, Main Street, Colombo 07', 'Please call before delivery'),
(3, 12, 2, 180.00, 'PENDING', '2025-10-03 05:10:09', 'abc road, colombo', ''),
(4, 12, 2, 200.00, 'DELIVERED', '2025-10-03 05:13:28', 'gvytcytcyvy', ''),
(5, 12, 2, 340.00, 'PENDING', '2025-10-05 16:58:40', 'sfdvsdvsfs', '');

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`, `subtotal`) VALUES
(1, 1, 1, 2, 250.00, 500.00),
(2, 1, 2, 1, 180.00, 180.00),
(3, 2, 1, 2, 250.00, 500.00),
(4, 2, 2, 1, 180.00, 180.00),
(5, 3, 2, 1, 180.00, 180.00),
(6, 4, 3, 1, 200.00, 200.00),
(7, 5, 12, 1, 340.00, 340.00);

INSERT INTO `deliveries` (`delivery_id`, `order_id`, `rider_id`, `assigned_at`, `pickup_time`, `delivery_time`, `status`, `delivery_notes`) VALUES
(1, 1, NULL, NULL, NULL, NULL, 'PENDING', NULL),
(2, 2, NULL, NULL, NULL, NULL, 'PENDING', NULL),
(3, 3, NULL, NULL, NULL, NULL, 'PENDING', NULL),
(4, 4, NULL, NULL, NULL, NULL, 'PENDING', NULL),
(5, 5, NULL, NULL, NULL, NULL, 'PENDING', NULL);

ALTER TABLE `orders` AUTO_INCREMENT = 6;
ALTER TABLE `order_items` AUTO_INCREMENT = 8;
ALTER TABLE `deliveries` AUTO_INCREMENT = 6;
