package com.sportbooking.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    private String provider = "log";

    private String fromEmail = "dqhflearn@gmail.com";

    private String fromName = "SportZone";

    private String frontendBaseUrl = "http://localhost:5173";

    private String emailVerifyPath = "/verify-email";
}
