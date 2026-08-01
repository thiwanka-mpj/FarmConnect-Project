-- product-service's database. `farmer_id` is a plain column (the owning farmer's user_id
-- in user-service's database) - no FK across databases; ownership is enforced by
-- product-service checking the JWT's userId claim, not by a database constraint.

CREATE TABLE `products` (
  `product_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `farmer_id` bigint(20) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `quantity_available` int(11) NOT NULL DEFAULT 0,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`product_id`),
  KEY `idx_farmer` (`farmer_id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed data (synthetic)
INSERT INTO `products` (`product_id`, `farmer_id`, `product_name`, `description`, `price`, `quantity_available`, `category`, `image_url`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 2, 'Fresh Tomatoes', 'Organically grown fresh tomatoes', 250.00, 50, 'Vegetables', 'https://example.com/tomatoes.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(2, 2, 'Green Beans', 'Fresh green beans from the farm', 180.00, 30, 'Vegetables', 'https://example.com/beans.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(3, 2, 'Carrots', 'Sweet and crunchy carrots', 200.00, 40, 'Vegetables', 'https://example.com/carrots.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(4, 3, 'Bananas', 'Naturally ripened Ambul bananas', 150.00, 100, 'Fruits', 'https://example.com/bananas.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(5, 3, 'Papaya', 'Sweet and juicy papayas', 220.00, 25, 'Fruits', 'https://example.com/papaya.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(6, 3, 'Mangoes', 'Delicious ripe mangoes', 400.00, 20, 'Fruits', 'https://example.com/mangoes.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(7, 4, 'Fresh Milk', 'Pure cow milk, delivered fresh daily', 180.00, 50, 'Dairy', 'https://example.com/milk.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(8, 4, 'Farm Eggs', 'Free-range chicken eggs (12 pack)', 450.00, 30, 'Eggs', 'https://example.com/eggs.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(9, 4, 'Organic Honey', 'Pure natural honey from our farm', 850.00, 15, 'Other', 'https://example.com/honey.jpg', 1, '2025-10-02 06:37:00', '2025-10-02 06:37:00'),
(10, 2, 'Organic Tomatoes', 'Fresh organic tomatoes', 250.00, 100, 'Vegetables', 'http://example.com/tomato.jpg', 1, '2025-10-03 00:31:50', '2025-10-03 00:31:50'),
(11, 13, 'Potatoes', 'Fresh potatoes', 560.00, 50, 'Vegetables', '', 1, '2025-10-03 05:20:01', '2025-10-03 05:20:01'),
(12, 2, 'Fresh Tomatoes 2', 'tomatoes with fresh ', 340.00, 24, 'Vegetables', 'http://localhost:8082/uploads/products/bb1a6883-6f6c-406f-a754-8bb11c84674c.jpeg', 1, '2025-10-05 16:57:02', '2025-10-05 16:57:02');

ALTER TABLE `products` AUTO_INCREMENT = 13;
