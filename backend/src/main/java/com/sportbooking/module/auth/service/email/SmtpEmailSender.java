package com.sportbooking.module.auth.service.email;

import com.sportbooking.config.MailProperties;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "app.mail", name = "provider", havingValue = "smtp")
@RequiredArgsConstructor
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender javaMailSender;
    private final MailProperties mailProperties;

    @Override
    public void send(String to, String subject, String body, boolean html) {
        try {
            var message = javaMailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(mailProperties.getFromEmail(), mailProperties.getFromName());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, html);

            javaMailSender.send(message);
        } catch (MessagingException exception) {
            throw new IllegalStateException("Could not prepare email message", exception);
        } catch (java.io.UnsupportedEncodingException exception) {
            throw new IllegalStateException("Could not encode sender name", exception);
        }
    }
}
