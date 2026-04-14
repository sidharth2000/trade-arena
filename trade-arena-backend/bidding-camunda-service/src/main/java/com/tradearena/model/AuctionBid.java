// AuctionBid.java
package com.tradearena.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "auction_bids",
    indexes = {
        @Index(name = "idx_bid_auction_id",  columnList = "auction_id"),
        @Index(name = "idx_bid_bidder_id",   columnList = "bidder_id"),
        @Index(name = "idx_bid_status",      columnList = "status"),
        @Index(name = "idx_bid_amount",      columnList = "amount")
    }
)
public class AuctionBid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "auction_id", nullable = false)
    private AuctionMaster auction;

    @Column(name = "bidder_id", nullable = false)
    private Long bidderId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BidStatus status = BidStatus.ACTIVE;

    // Rank assigned when auction ends (1 = highest, 2 = second, ...)
    // Used to walk down the list on payment failure
    @Column
    private Integer rank;

    // Timestamp when seller approved this specific bid
    @Column
    private LocalDateTime approvedAt;

    // Timestamp when payment was confirmed for this bid
    @Column
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AuctionBid() {}

    // ── Getters & Setters ─────────────────────────────────────────
    public UUID getId()                                     { return id; }
    public AuctionMaster getAuction()                       { return auction; }
    public void setAuction(AuctionMaster auction)           { this.auction = auction; }
    public Long getBidderId()                               { return bidderId; }
    public void setBidderId(Long bidderId)                  { this.bidderId = bidderId; }
    public BigDecimal getAmount()                           { return amount; }
    public void setAmount(BigDecimal amount)                { this.amount = amount; }
    public BidStatus getStatus()                            { return status; }
    public void setStatus(BidStatus status)                 { this.status = status; }
    public Integer getRank()                                { return rank; }
    public void setRank(Integer rank)                       { this.rank = rank; }
    public LocalDateTime getApprovedAt()                    { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt)     { this.approvedAt = approvedAt; }
    public LocalDateTime getPaidAt()                        { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt)             { this.paidAt = paidAt; }
    public LocalDateTime getCreatedAt()                     { return createdAt; }
}