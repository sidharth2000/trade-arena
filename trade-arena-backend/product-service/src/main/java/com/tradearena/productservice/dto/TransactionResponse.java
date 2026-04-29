package com.tradearena.productservice.dto;

import com.tradearena.productservice.model.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class TransactionResponse {

    private UUID id;
    private UUID productId;
    private Long userId;
    private BigDecimal price;
    private String paymentMethod;
    private LocalDateTime createdAt;

    public static TransactionResponse fromEntity(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.id            = t.getId();
        r.productId     = t.getProductId();
        r.userId        = t.getUserId();
        r.price         = t.getPrice();
        r.paymentMethod = t.getPaymentMethod();
        r.createdAt     = t.getCreatedAt();
        return r;
    }

    public UUID getId()               { return id; }
    public UUID getProductId()        { return productId; }
    public Long getUserId()           { return userId; }
    public BigDecimal getPrice()      { return price; }
    public String getPaymentMethod()  { return paymentMethod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}