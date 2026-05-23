package com.sportbooking.module.auth.service.email;

import com.sportbooking.config.AuthProperties;
import com.sportbooking.config.MailProperties;
import com.sportbooking.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class EmailVerificationMailService {

    private final EmailSender emailSender;
    private final MailProperties mailProperties;
    private final AuthProperties authProperties;

    public void sendVerificationEmail(User user, String token) {
        String verifyLink = buildVerifyLink(token);
        String subject = "Verify your " + mailProperties.getFromName() + " account";
        String body = """
                <!doctype html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#141414;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;padding:32px 16px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:620px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d6d6d6;box-shadow:0 8px 32px rgba(0,0,0,0.10);">
                                    <tr>
                                        <td style="padding:30px 32px 24px;text-align:left;border-bottom:1px solid #d6d6d6;background-color:#ffffff;">
                                            <div style="font-size:22px;font-weight:800;line-height:1.2;color:#141414;letter-spacing:0;">Sport<span style="color:#ff5a1f;">Zone</span></div>
                                            <div style="display:inline-block;margin-top:16px;border:1px solid rgba(255,90,31,0.30);background-color:rgba(255,90,31,0.10);color:#ff5a1f;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;line-height:1;">Account verification</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:32px;">
                                            <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;color:#141414;font-weight:800;letter-spacing:0;">Verify your email address</h1>
                                            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#616161;">Hi %s,</p>
                                            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#616161;">
                                                Welcome to <strong style="color:#141414;">%s</strong>. Confirm your email address to activate your account and start booking sports courts without the phone calls.
                                            </p>
                                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 26px;">
                                                <tr>
                                                    <td style="border-radius:16px;background-color:#ff5a1f;box-shadow:0 0 24px rgba(255,90,31,0.25);">
                                                        <a href="%s" style="display:inline-block;padding:14px 22px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:16px;">
                                                            Verify my account
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <div style="margin:0 0 20px;padding:16px;border-radius:16px;background-color:#f0f0f0;border:1px solid #d6d6d6;">
                                                <p style="margin:0;font-size:14px;line-height:1.7;color:#616161;">
                                                    This verification link expires in <strong style="color:#141414;">%s minutes</strong>.
                                                </p>
                                            </div>
                                            <p style="margin:0 0 8px;font-size:13px;line-height:1.7;color:#616161;">
                                                If the button does not work, copy and paste this link into your browser:
                                            </p>
                                            <p style="margin:0 0 24px;font-size:13px;line-height:1.7;word-break:break-all;color:#ff5a1f;">
                                                <a href="%s" style="color:#ff5a1f;text-decoration:underline;">%s</a>
                                            </p>
                                            <p style="margin:0;font-size:13px;line-height:1.7;color:#616161;">
                                                If you did not create a %s account, you can safely ignore this email.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:22px 32px;background-color:#f0f0f0;border-top:1px solid #d6d6d6;">
                                            <p style="margin:0;font-size:13px;line-height:1.6;color:#616161;">
                                                Best regards,<br>
                                                <strong style="color:#141414;">The %s Team</strong>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                <p style="max-width:620px;margin:16px 0 0;font-size:12px;line-height:1.6;color:#616161;text-align:center;">
                                    You are receiving this email because someone registered for %s using this email address.
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                subject,
                user.getFullName(),
                mailProperties.getFromName(),
                verifyLink,
                authProperties.getEmailVerificationTokenTtl().toMinutes(),
                verifyLink,
                verifyLink,
                mailProperties.getFromName(),
                mailProperties.getFromName(),
                mailProperties.getFromName()
        );

        emailSender.send(user.getEmail(), subject, body, true);
    }

    private String buildVerifyLink(String token) {
        return UriComponentsBuilder
                .fromUriString(mailProperties.getFrontendBaseUrl())
                .path(mailProperties.getEmailVerifyPath())
                .queryParam("token", token)
                .build()
                .toUriString();
    }
}
