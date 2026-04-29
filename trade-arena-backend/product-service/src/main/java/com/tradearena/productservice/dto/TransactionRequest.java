package com.tradearena.productservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class TransactionRequest {

    private UUID productId;
    private Long userId;
    private BigDecimal price;
    private String paymentMethod;

    public UUID getProductId()              { return productId; }
    public void setProductId(UUID p)        { this.productId = p; }
    public Long getUserId()                 { return userId; }
    public void setUserId(Long u)           { this.userId = u; }
    public BigDecimal getPrice()            { return price; }
    public void setPrice(BigDecimal p)      { this.price = p; }
    public String getPaymentMethod()        { return paymentMethod; }
    public void setPaymentMethod(String m)  { this.paymentMethod = m; }
}