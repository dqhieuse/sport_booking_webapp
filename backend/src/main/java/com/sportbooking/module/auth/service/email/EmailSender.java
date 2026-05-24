package com.sportbooking.module.auth.service.email;

public interface EmailSender {

    void send(String to, String subject, String body, boolean html);
}
