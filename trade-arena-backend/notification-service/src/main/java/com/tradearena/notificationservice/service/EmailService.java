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

import java.time.format.DateTimeFormatter;
import java.util.Set;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${trade-arena.mail.from}")
    private String fromAddress;

    /**
     * Only these types trigger emails (critical events as per requirements).
     * Uses the NotificationType enum for type safety.
     */
    private static final Set<NotificationType> EMAIL_TYPES = Set.of(
            NotificationType.AUCTION_WIN,
            NotificationType.PAYMENT_REMINDER,
            NotificationType.OUTBID,
            NotificationType.PAYMENT_SUCCESS,
            NotificationType.ACCOUNT_RESTRICTED,
            NotificationType.FALLBACK_OFFER,
            NotificationType.BID_PLACED
    );

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Check whether a given NotificationType should trigger an email.
     * Used by NotificationService before calling sendEmail().
     */
    public boolean isEmailType(NotificationType type) {
        return EMAIL_TYPES.contains(type);
    }

    /**
     * Sends an HTML email for the given notification request.
     * Runs asynchronously on the emailTaskExecutor thread pool (see AsyncConfig)
     * so it does not block the HTTP response or SSE push.
     */
    @Async("emailTaskExecutor")
    public void sendEmail(NotificationRequest req) {
        if (req.getUserEmail() == null || req.getUserEmail().isBlank()) {
            return;
        }
        if (!isEmailType(req.getType())) {
            return;
        }

        String subject = subjectFor(req.getType());
        String bodyHtml = bodyFor(req);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(req.getUserEmail());
            helper.setSubject(subject);
            helper.setText(bodyHtml, true); // HTML enabled

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // Fail gracefully — in-app notification already saved; email is best-effort.
            System.err.println("Email sending failed for type=" + req.getType() + ": " + e.getMessage());
        }
    }

    private String subjectFor(NotificationType type) {
        return switch (type) {
            case AUCTION_WIN        -> "You won the auction on Trade Arena!";
            case OUTBID             -> "You have been outbid!";
            case PAYMENT_REMINDER   -> "Payment reminder - action required";
            case PAYMENT_SUCCESS    -> "Payment successful";
            case ACCOUNT_RESTRICTED -> "Account action required";
            case FALLBACK_OFFER     -> "You have a second-chance offer!";
            case BID_PLACED         -> "New bid received on your listing";
            default                 -> "Trade Arena Notification";
        };
    }

    private String bodyFor(NotificationRequest req) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family:Arial, sans-serif; line-height:1.6; max-width:600px;'>")
                .append("<h2 style='color:#2c7a4b;'>Trade Arena</h2>")
                .append("<p>").append(escape(req.getMessage())).append("</p>");

        // Optional enrichment fields — only rendered when present (Bug #1 fix)
        if (req.getProductTitle() != null && !req.getProductTitle().isBlank()) {
            sb.append("<p><b>Product:</b> ").append(escape(req.getProductTitle())).append("</p>");
        }
        if (req.getBidAmount() != null) {
            sb.append("<p><b>Bid Amount:</b> &euro;").append(String.format("%.2f", req.getBidAmount())).append("</p>");
        }
        if (req.getAuctionId() != null) {
            sb.append("<p><b>Auction ID:</b> ").append(req.getAuctionId()).append("</p>");
        }
        if (req.getPaymentDeadline() != null) {
            sb.append("<p><b>Payment Deadline:</b> ").append(req.getPaymentDeadline().format(dtf)).append("</p>");
        }

        sb.append("<hr/>")
                .append("<p style='font-size:12px;color:#666;'>This is an automated message from Trade Arena. Please do not reply.</p>")
                .append("</div>");

        return sb.toString();
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }
}
