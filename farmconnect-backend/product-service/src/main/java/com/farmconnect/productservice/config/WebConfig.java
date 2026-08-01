package com.farmconnect.productservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is now configured once, centrally, in SecurityConfig#corsConfigurationSource
// so it can't drift out of sync with the security filter chain.
@Configuration
public class WebConfig implements WebMvcConfigurer {
}