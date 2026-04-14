package com.tradearena.productservice.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_images")
@EntityListeners(AuditingEntityListener.class)
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Lob
    @Column(nullable = false)
    private byte[] data;

    @Column(nullable = false, length = 100)
    private String filename;

    @Column(nullable = false, length = 50)
    private String mimeType;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean isPrimary = false;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    public ProductImage() {}

    public UUID getId()                                 { return id; }

    public Product getProduct()                         { return product; }
    public void setProduct(Product product)             { this.product = product; }

    public byte[] getData()                             { return data; }
    public void setData(byte[] data)                    { this.data = data; }

    public String getFilename()                         { return filename; }
    public void setFilename(String filename)            { this.filename = filename; }

    public String getMimeType()                         { return mimeType; }
    public void setMimeType(String mimeType)            { this.mimeType = mimeType; }

    public Integer getDisplayOrder()                        { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder)       { this.displayOrder = displayOrder; }

    public Boolean getIsPrimary()                       { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary)         { this.isPrimary = isPrimary; }

    public LocalDateTime getCreatedAt()                 { return createdAt; }
}