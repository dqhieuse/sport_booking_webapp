package com.sportbooking.config;

import java.nio.file.Path;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties({CorsProperties.class, StorageProperties.class})
public class WebConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;
    private final StorageProperties storageProperties;

    public WebConfig(CorsProperties corsProperties, StorageProperties storageProperties) {
        this.corsProperties = corsProperties;
        this.storageProperties = storageProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(corsProperties.allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDirectory = storageProperties.getLocal().uploadDirPath().toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(directoryLocation(uploadDirectory));
    }

    private String directoryLocation(Path directory) {
        String location = directory.toUri().toString();
        return location.endsWith("/") ? location : location + "/";
    }
}
