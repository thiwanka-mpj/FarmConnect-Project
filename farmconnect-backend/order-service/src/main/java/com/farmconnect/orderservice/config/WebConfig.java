package com.farmconnect.orderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is now configured once, centrally, in SecurityConfig#corsConfigurationSource.
@Configuration
public class WebConfig implements WebMvcConfigurer {
}