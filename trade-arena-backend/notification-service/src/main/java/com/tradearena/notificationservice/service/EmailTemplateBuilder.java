package com.tradearena.notificationservice.service;

import com.tradearena.notificationservice.dto.NotificationRequest;
import com.tradearena.notificationservice.model.NotificationType;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class EmailTemplateBuilder {

    private static final DateTimeFormatter DTF =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    // ── Entry point ───────────────────────────────────────────────────────
    public String buildSubject(NotificationType type, String productTitle) {
        String suffix = (productTitle != null && !productTitle.isBlank())
                ? " – " + productTitle : "";
        return switch (type) {
            case AUCTION_WIN        -> "🎉 You won the auction" + suffix;
            case OUTBID             -> "⚡ You've been outbid" + suffix;
            case PAYMENT_REMINDER   -> "⏰ Payment reminder" + suffix;
            case PAYMENT_SUCCESS    -> "✅ Payment confirmed" + suffix;
            case ACCOUNT_RESTRICTED -> "⚠️ Account restricted – Trade Arena";
            case FALLBACK_OFFER     -> "🔔 Second-chance offer available" + suffix;
            case BID_PLACED         -> "💰 New bid on your listing" + suffix;
            default                 -> "Trade Arena Notification";
        };
    }

    public String buildBody(NotificationRequest req) {
        return switch (req.getType()) {
            case OUTBID             -> outbidTemplate(req);
            case AUCTION_WIN        -> auctionWinTemplate(req);
            case PAYMENT_REMINDER   -> paymentReminderTemplate(req);
            case PAYMENT_SUCCESS    -> paymentSuccessTemplate(req);
            case ACCOUNT_RESTRICTED -> accountRestrictedTemplate(req);
            case FALLBACK_OFFER     -> fallbackOfferTemplate(req);
            case BID_PLACED         -> bidPlacedTemplate(req);
            case BID_CONFIRMATION -> bidConfirmationTemplate(req);
            default                 -> genericTemplate(req);
        };
    }

    // ── Templates ─────────────────────────────────────────────────────────

    private String outbidTemplate(NotificationRequest req) {
        String product = orDefault(req.getProductTitle(), "this item");
        String amount  = formatAmount(req.getBidAmount());
        String content =
                para("Hi there,") +
                        para("Someone just placed a higher bid on <strong>" + escape(product) + "</strong>. " +
                                "Don't miss out — place a new bid to stay in the lead!") +
                        infoBox("#fff8e1",
                                row("Product", escape(product)),
                                row("Current Highest Bid", amount)) +
                        button("http://localhost:5173/products/" + orDefault(req.getReferenceId(), ""),
                                "Bid Again Now", "#f59e0b");
        return wrap("#f59e0b", "⚡", "You've Been Outbid!", content);
    }

    private String auctionWinTemplate(NotificationRequest req) {
        String product  = orDefault(req.getProductTitle(), "the item");
        String amount   = formatAmount(req.getBidAmount());
        String deadline = req.getPaymentDeadline() != null
                ? req.getPaymentDeadline().format(DTF) : "within 24 hours";
        String content =
                para("Congratulations! 🎉") +
                        para("You have won the auction for <strong>" + escape(product) + "</strong>. " +
                                "Please complete your payment before the deadline to secure your item.") +
                        infoBox("#f0fdf4",
                                row("Product", escape(product)),
                                row("Winning Bid", amount),
                                row("Payment Deadline", deadline)) +
                        button("http://localhost:5173/orders", "Complete Payment Now", "#16a34a");
        return wrap("#16a34a", "🎉", "You Won the Auction!", content);
    }

    private String paymentReminderTemplate(NotificationRequest req) {
        String product  = orDefault(req.getProductTitle(), "your item");
        String deadline = req.getPaymentDeadline() != null
                ? req.getPaymentDeadline().format(DTF) : "very soon";
        String content =
                para("Hi there,") +
                        para("This is a reminder that your payment for <strong>" + escape(product) +
                                "</strong> is due soon. Failure to pay may result in account restrictions.") +
                        infoBox("#fff7ed",
                                row("Product", escape(product)),
                                row("Payment Due By", deadline)) +
                        button("http://localhost:5173/orders", "Pay Now", "#ea580c");
        return wrap("#ea580c", "⏰", "Payment Reminder", content);
    }

    private String paymentSuccessTemplate(NotificationRequest req) {
        String product = orDefault(req.getProductTitle(), "your item");
        String amount  = formatAmount(req.getBidAmount());
        String content =
                para("Great news!") +
                        para("Your payment for <strong>" + escape(product) + "</strong> " +
                                "has been successfully received. The seller will be in touch shortly.") +
                        infoBox("#f0fdf4",
                                row("Product", escape(product)),
                                row("Amount Paid", amount)) +
                        button("http://localhost:5173/orders", "View Order", "#16a34a");
        return wrap("#16a34a", "✅", "Payment Confirmed!", content);
    }

    private String accountRestrictedTemplate(NotificationRequest req) {
        String content =
                para("Hi there,") +
                        para("Your Trade Arena account has been temporarily restricted due to " +
                                "multiple missed payments. You will not be able to place bids " +
                                "until the restriction is lifted.") +
                        para("If you believe this is a mistake, please contact our support team.") +
                        button("http://localhost:5173/support", "Contact Support", "#dc2626");
        return wrap("#dc2626", "⚠️", "Account Restricted", content);
    }

    private String fallbackOfferTemplate(NotificationRequest req) {
        String product = orDefault(req.getProductTitle(), "an item");
        String amount  = formatAmount(req.getBidAmount());
        String content =
                para("Good news!") +
                        para("The original winner did not complete their payment for <strong>" +
                                escape(product) + "</strong>. As the next highest bidder, " +
                                "you now have the opportunity to purchase this item at your bid price!") +
                        infoBox("#eff6ff",
                                row("Product", escape(product)),
                                row("Your Bid", amount)) +
                        button("http://localhost:5173/products/" + orDefault(req.getReferenceId(), ""),
                                "Claim This Item", "#2563eb");
        return wrap("#2563eb", "🔔", "Second-Chance Offer!", content);
    }

    private String bidPlacedTemplate(NotificationRequest req) {
        String product = orDefault(req.getProductTitle(), "your listing");
        String amount  = formatAmount(req.getBidAmount());
        String content =
                para("Hi there,") +
                        para("A buyer just placed a new bid on your listing <strong>" +
                                escape(product) + "</strong>. Check your auction to see all current bids!") +
                        infoBox("#faf5ff",
                                row("Product", escape(product)),
                                row("New Bid Amount", amount)) +
                        button("http://localhost:5173/my-listings", "View My Listings", "#7c3aed");
        return wrap("#7c3aed", "💰", "New Bid on Your Listing!", content);
    }

    private String genericTemplate(NotificationRequest req) {
        return wrap("#2c7a4b", "🔔", "Trade Arena Notification",
                para(escape(req.getMessage())));
    }
    
    
    private String bidConfirmationTemplate(NotificationRequest req) {
        String product = orDefault(req.getProductTitle(), "the item");
        String amount  = formatAmount(req.getBidAmount());

        String content =
                para("Hi there,") +
                para("Your bid has been successfully placed on <strong>" + escape(product) + "</strong>.") +
                para("You're now in the running — keep an eye on the auction to stay ahead!") +
                infoBox("#f0fdf4",
                        row("Product", escape(product)),
                        row("Your Bid Amount", amount)) +
                button("http://localhost:5173/products/" + orDefault(req.getReferenceId(), ""),
                        "View Auction", "#16a34a");

        return wrap("#16a34a", "✅", "Bid Placed Successfully!", content);
    }

    // ── Layout wrapper ────────────────────────────────────────────────────

    private String wrap(String color, String emoji, String title, String content) {
        return "<div style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>"
                + "<table width='100%' cellpadding='0' cellspacing='0'><tr>"
                + "<td align='center' style='padding:30px 10px;'>"
                + "<table width='600' cellpadding='0' cellspacing='0' style='"
                + "background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;'>"
                // header
                + "<tr><td style='background:" + color + ";padding:30px;text-align:center;'>"
                + "<div style='font-size:36px;'>" + emoji + "</div>"
                + "<h1 style='color:#fff;margin:10px 0 0;font-size:22px;font-weight:700;'>"
                + title + "</h1></td></tr>"
                // brand bar
                + "<tr><td style='background:#1a1a2e;padding:8px;text-align:center;'>"
                + "<span style='color:#fff;font-size:13px;font-weight:600;letter-spacing:2px;'>"
                + "TRADE ARENA</span></td></tr>"
                // content
                + "<tr><td style='padding:30px 40px;'>" + content + "</td></tr>"
                // footer
                + "<tr><td style='background:#f9f9f9;padding:20px;text-align:center;"
                + "border-top:1px solid #eee;'>"
                + "<p style='margin:0;font-size:12px;color:#999;'>"
                + "This is an automated message from Trade Arena. Please do not reply.</p>"
                + "<p style='margin:6px 0 0;font-size:11px;color:#bbb;'>"
                + "&copy; 2026 Trade Arena. All rights reserved.</p>"
                + "</td></tr>"
                + "</table></td></tr></table></div>";
    }

    // ── Small helpers ─────────────────────────────────────────────────────

    private String para(String text) {
        return "<p style='font-size:15px;color:#555;margin:0 0 15px;'>" + text + "</p>";
    }

    private String infoBox(String bg, String... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table width='100%' cellpadding='0' cellspacing='0' style='")
                .append("background:").append(bg).append(";border-radius:6px;margin:20px 0;'>")
                .append("<tr><td style='padding:20px;'>");
        for (String r : rows) sb.append(r);
        sb.append("</td></tr></table>");
        return sb.toString();
    }

    private String row(String label, String value) {
        return "<p style='margin:6px 0;font-size:14px;color:#333;'>"
                + "<span style='color:#666;'>" + label + ":</span> "
                + "<strong>" + value + "</strong></p>";
    }

    private String button(String url, String label, String color) {
        return "<div style='text-align:center;margin:25px 0;'>"
                + "<a href='" + url + "' style='background:" + color + ";color:#fff;"
                + "padding:14px 32px;text-decoration:none;border-radius:6px;"
                + "font-size:15px;font-weight:600;display:inline-block;'>"
                + label + "</a></div>";
    }

    private String formatAmount(Double amount) {
        return amount != null ? String.format("&euro;%.2f", amount) : "—";
    }

    private String orDefault(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    private String orDefault(Long value, String fallback) {
        return value != null ? String.valueOf(value) : fallback;
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}