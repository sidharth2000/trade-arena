package com.tradearena.delegate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.tradearena.model.AuctionBid;
import com.tradearena.model.AuctionMaster;
import com.tradearena.model.BidStatus;
import com.tradearena.dto.NotificationRequest;
import com.tradearena.dto.NotificationType;
import com.tradearena.repository.AuctionBidRepository;
import com.tradearena.repository.AuctionRepository;

@Component
public class NotifySellerApproval implements JavaDelegate {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private AuctionBidRepository bidRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${notification-service-url}")
    private String notificationServiceUrl;

    @Override
    public void execute(DelegateExecution execution) {

        UUID auctionId = UUID.fromString(execution.getVariable("auctionId").toString());
        String sellerEmail = execution.getVariable("sellerEmail").toString();

        AuctionMaster auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        List<AuctionBid> validBids = bidRepository.findByAuction_Id(auctionId)
                .stream()
                .filter(b -> b.getStatus() == BidStatus.ACTIVE
                          || b.getStatus() == BidStatus.OUTBID)
                .toList();

        if (validBids.isEmpty()) {
            throw new RuntimeException("No valid bids found");
        }

        AuctionBid topBid = validBids.stream()
                .max((a, b) -> a.getAmount().compareTo(b.getAmount()))
                .orElseThrow();

        BigDecimal amount = topBid.getAmount();

        // ── HTML BODY (styled like your builder) ──
        String htmlBody =
                "<div style='font-family:Arial;background:#f4f4f4;padding:20px;'>"
                + "<div style='max-width:600px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;'>"

                // HEADER
                + "<div style='background:#7c3aed;padding:20px;text-align:center;color:#fff;'>"
                + "<h2>⏰ Auction Ended — Action Required</h2>"
                + "</div>"

                // BODY
                + "<div style='padding:20px;'>"
                + "<p>Hi Seller,</p>"
                + "<p>The auction for your product has ended. The highest bidder is shown below.</p>"

                + "<div style='background:#f5f3ff;padding:15px;border-radius:6px;margin:15px 0;'>"
                + "<p><b>Product ID:</b> " + auction.getProductId() + "</p>"
                + "<p><b>Highest Bid Amount:</b> ₹" + amount + "</p>"
                + "<p><b>Bidder ID:</b> " + topBid.getBidderId() + "</p>"
                + "</div>"

                + "<p style='margin-top:10px;'>"
                + "Please review the bid and decide whether to <b>Approve</b> or <b>Reject</b> the bidder."
                + "</p>"

                + "<p style='margin-top:10px;'>"
                + "Go to your dashboard → <b>My Listings</b> → select the product → take action."
                + "</p>"

                // CTA BUTTON
                + "<a href='http://localhost:5173/my-listings' "
                + "style='display:inline-block;padding:12px 20px;background:#7c3aed;"
                + "color:#fff;text-decoration:none;border-radius:6px;margin-top:15px;'>"
                + "Review Auction</a>"

                + "<p style='font-size:12px;color:#888;margin-top:20px;'>"
                + "You must approve the winner to complete the sale."
                + "</p>"

                + "</div>"
                + "</div>"
                + "</div>";

        NotificationRequest req = NotificationRequest.builder()
                .userId(auction.getSellerId())
                .userEmail(sellerEmail)
                .type(NotificationType.AUCTION_ENDED)
                .message("New highest bid received")
                .productTitle("Auction Product")
                .bidAmount(amount.doubleValue())
                .auctionId(auction.getSellerId())
                .htmlBody(htmlBody)
                .sendEmail(true)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.exchange(
                notificationServiceUrl + "/api/notifications/send",
                HttpMethod.POST,
                new HttpEntity<>(req, headers),
                Void.class
        );

        System.out.println("Seller notified with highest bid = " + amount);
    }
}