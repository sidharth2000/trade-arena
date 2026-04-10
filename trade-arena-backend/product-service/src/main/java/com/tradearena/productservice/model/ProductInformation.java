package com.tradearena.productservice.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_information")
@EntityListeners(AuditingEntityListener.class)
public class ProductInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer formId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    public ProductInformation() {}

    public UUID getId()                                 { return id; }

    public Product getProduct()                         { return product; }
    public void setProduct(Product product)             { this.product = product; }

    public Integer getFormId()                          { return formId; }
    public void setFormId(Integer formId)               { this.formId = formId; }

    public String getAnswer()                           { return answer; }
    public void setAnswer(String answer)                { this.answer = answer; }

    public LocalDateTime getCreatedAt()                 { return createdAt; }
}