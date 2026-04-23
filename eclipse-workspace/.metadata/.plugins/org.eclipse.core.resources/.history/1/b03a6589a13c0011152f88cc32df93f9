package com.tradearena.notificationservice.service;

import com.tradearena.notificationservice.dto.NotificationRequest;
import com.tradearena.notificationservice.model.NotificationType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateBuilder templateBuilder;

    @Value("${trade-arena.mail.from}")
    private String fromAddress;

    private static final Set<NotificationType> EMAIL_TYPES = Set.of(
            NotificationType.AUCTION_WIN,
            NotificationType.PAYMENT_REMINDER,
            NotificationType.OUTBID,
            NotificationType.PAYMENT_SUCCESS,
            NotificationType.ACCOUNT_RESTRICTED,
            NotificationType.FALLBACK_OFFER,
            NotificationType.BID_PLACED
    );

    public EmailService(JavaMailSender mailSender, EmailTemplateBuilder templateBuilder) {
        this.mailSender = mailSender;
        this.templateBuilder = templateBuilder;
    }

    public boolean isEmailType(NotificationType type) {
        return EMAIL_TYPES.contains(type);
    }

    // ── Option A: Notification Service builds the email ──────────────────
    @Async("emailTaskExecutor")
    public void sendEmail(NotificationRequest req) {
        if (req.getUserEmail() == null || req.getUserEmail().isBlank()) return;
        if (!isEmailType(req.getType())) return;

        String subject = templateBuilder.buildSubject(req.getType(), req.getProductTitle());
        String body    = templateBuilder.buildBody(req);

        send(List.of(req.getUserEmail()), null, subject, body);
    }

    // ── Option B: Caller provides full HTML ──────────────────────────────
    @Async("emailTaskExecutor")
    public void sendHtmlEmail(List<String> to, List<String> cc,
                              String subject, String htmlBody) {
        if (to == null || to.isEmpty()) {
            System.err.println("sendHtmlEmail: empty 'to' list — skipping.");
            return;
        }
        send(to, cc, subject, htmlBody);
    }

    // ── Shared send logic ─────────────────────────────────────────────────
    private void send(List<String> to, List<String> cc,
                      String subject, String htmlBody) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to.toArray(new String[0]));
            if (cc != null && !cc.isEmpty()) {
                helper.setCc(cc.toArray(new String[0]));
            }
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mime);
        } catch (MessagingException e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
    }
}