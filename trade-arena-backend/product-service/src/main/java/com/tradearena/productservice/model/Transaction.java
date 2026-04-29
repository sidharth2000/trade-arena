package com.tradearena.productservice.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Transaction() {}

    public UUID getId()                            { return id; }
    public UUID getProductId()                     { return productId; }
    public void setProductId(UUID productId)       { this.productId = productId; }
    public Long getUserId()                        { return userId; }
    public void setUserId(Long userId)             { this.userId = userId; }
    public BigDecimal getPrice()                   { return price; }
    public void setPrice(BigDecimal price)         { this.price = price; }
    public String getPaymentMethod()               { return paymentMethod; }
    public void setPaymentMethod(String m)         { this.paymentMethod = m; }
    public LocalDateTime getCreatedAt()            { return createdAt; }
}