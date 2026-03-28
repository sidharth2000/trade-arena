package com.tradearena.notificationservice.service;

import com.tradearena.notificationservice.dto.NotificationRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Set;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${trade-arena.mail.from}")
    private String fromAddress;

    // Only these types trigger emails (as per your requirements)
    private static final Set<String> EMAIL_TYPES = Set.of(
            "AUCTION_WIN",
            "PAYMENT_REMINDER",
            "OUTBID",
            "PAYMENT_SUCCESS",
            "ACCOUNT_RESTRICTED",
            "FALLBACK_OFFER",
            "BID_PLACED" // you said bid placed is in-app + email to seller
    );

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isEmailType(String type) {
        return EMAIL_TYPES.contains(type);
    }

    public void sendEmail(NotificationRequest req) {
        if (req.getUserEmail() == null || req.getUserEmail().isBlank()) {
            return; // nothing to send to
        }
        if (!isEmailType(req.getType())) {
            return; // do not email for non-critical types
        }

        String subject = subjectFor(req);
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
            // In production you'd log to a proper logger + consider retry queue.
            // For now we fail gracefully so API still returns success for in-app.
            System.err.println("Email sending failed: " + e.getMessage());
        }
    }

    private String subjectFor(NotificationRequest req) {
        return switch (req.getType()) {
            case "AUCTION_WIN" -> "You won the auction on Trade Arena!";
            case "OUTBID" -> "⚠You have been outbid!";
            case "PAYMENT_REMINDER" -> "Payment reminder - action required";
            case "PAYMENT_SUCCESS" -> "Payment successful";
            case "ACCOUNT_RESTRICTED" -> "Account action required";
            case "FALLBACK_OFFER" -> "You have a second-chance offer!";
            case "BID_PLACED" -> "New bid received";
            default -> "Trade Arena Notification";
        };
    }

    private String bodyFor(NotificationRequest req) {
        // Keep simple, readable HTML (no external CSS).
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family:Arial, sans-serif; line-height:1.5;'>")
                .append("<h2>Trade Arena</h2>")
                .append("<p>").append(escape(req.getMessage())).append("</p>");

        if (req.getProductTitle() != null && !req.getProductTitle().isBlank()) {
            sb.append("<p><b>Product:</b> ").append(escape(req.getProductTitle())).append("</p>");
        }
        if (req.getBidAmount() != null) {
            sb.append("<p><b>Bid Amount:</b> €").append(req.getBidAmount()).append("</p>");
        }
        if (req.getAuctionId() != null) {
            sb.append("<p><b>Auction ID:</b> ").append(req.getAuctionId()).append("</p>");
        }
        if (req.getPaymentDeadline() != null) {
            sb.append("<p><b>Payment Deadline:</b> ").append(req.getPaymentDeadline().format(dtf)).append("</p>");
        }

        sb.append("<hr/>")
                .append("<p style='font-size:12px;color:#666;'>This is an automated message. Please do not reply.</p>")
                .append("</div>");

        return sb.toString();
    }

    private String escape(String text) {
        // Minimal HTML escaping to avoid breaking email HTML.
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}