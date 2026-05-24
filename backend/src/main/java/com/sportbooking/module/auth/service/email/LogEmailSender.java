package com.sportbooking.module.auth.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "log", matchIfMissing = true)
@Slf4j
public class LogEmailSender implements EmailSender {

    @Override
    public void send(String to, String subject, String body, boolean html) {
        log.info("Local email to={} subject={} html={} body={}", to, subject, html, body);
    }
}
