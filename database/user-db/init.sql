-- user-service's database. Owns identity/profile data only - no other service's
-- database may reference this table with a real foreign key; cross-service references
-- (farmer_id, customer_id, rider_id elsewhere) are plain columns, validated at the
-- application layer (JWT claims / API calls), not by the database.

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('CUSTOMER','FARMER','RIDER','ADMIN') NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed data - synthetic test accounts, not real users. Every password below is "password123".
INSERT INTO `users` (`user_id`, `email`, `password`, `full_name`, `role`, `phone_number`, `address`, `created_at`) VALUES
(1, 'admin@farmconnect.com', '$2a$12$Dqmy/0.xaRbkavZm79SUd.5im5ox661qQrU194.LM97hzQKBdAvoe', 'System Administrator', 'ADMIN', '0771234567', 'FarmConnect HQ, Colombo', '2025-10-02 06:34:38'),
(2, 'farmer1@gmail.com', '$2a$12$8HYw.1e6VaNcjN5WppRlDeD45C4rcQT9833uJxDAvCTy90imRXV3O', 'Kamal Perera', 'FARMER', '0712345678', 'Kegalle, Sri Lanka', '2025-10-02 06:35:47'),
(3, 'farmer2@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nimal Silva', 'FARMER', '0723456789', 'Kandy, Sri Lanka', '2025-10-02 06:35:47'),
(4, 'farmer3@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sunil Fernando', 'FARMER', '0734567890', 'Anuradhapura, Sri Lanka', '2025-10-02 06:35:47'),
(5, 'customer1@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Saman Kumara', 'CUSTOMER', '0745678901', 'Colombo 07, Sri Lanka', '2025-10-02 06:36:04'),
(6, 'customer2@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Chamari De Silva', 'CUSTOMER', '0756789012', 'Nugegoda, Sri Lanka', '2025-10-02 06:36:04'),
(7, 'rider1@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kasun Rajapaksa', 'RIDER', '0767890123', 'Maharagama, Sri Lanka', '2025-10-02 06:36:16'),
(8, 'rider2@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ruwan Bandara', 'RIDER', '0778901234', 'Dehiwala, Sri Lanka', '2025-10-02 06:36:16'),
(11, 'newfarmer@gmail.com', '$2a$10$exEv5JQ5jrBbS0uF4LodnuzPejlFS/qv4fDbSZ8A3D35WesXEKRAS', 'New Test Farmer', 'FARMER', '0771111111', 'Kandy, Sri Lanka', '2025-10-03 03:06:54'),
(12, 'janith@gmail.com', '$2a$10$tIdlaxt.CKIar6iHrI0F0OLHBT1qT9nCdLFOYzJylZ6.4QT6hE1TC', 'Janith Thiwanka', 'CUSTOMER', '0770123456', '123/4, ABC Road, Gampaha', '2025-10-03 05:08:48'),
(13, 'farmer11@test.com', '$2a$10$k7azsTIlYXZ6r4zXtx2JGu1CvYBes5guuUG4d1Xnz8emFhmZPcrDK', 'farmer@test.com', 'FARMER', '0741597532', 'test, colombo', '2025-10-03 05:18:04'),
(14, 'testfarmer123@gmail.com', '$2a$10$UT30SY8q8yf1i2MP4IpBTelRHVUBKe3Kd5ywleH0atThRXEOhqaUW', 'Test Farmer', 'FARMER', '0771234567', 'Colombo, Sri Lanka', '2025-10-05 11:21:06');

ALTER TABLE `users` AUTO_INCREMENT = 15;
