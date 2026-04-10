package com.tradearena.productservice.repository;

import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("""
            SELECT p FROM Product p
            WHERE p.status <> com.tradearena.productservice.model.ProductStatus.REMOVED
              AND (:categoryId    IS NULL OR p.categoryId    = :categoryId)
              AND (:subCategoryId IS NULL OR p.subCategoryId = :subCategoryId)
              AND (:sellerId      IS NULL OR p.sellerId      = :sellerId)
              AND (:status        IS NULL OR p.status        = :status)
            ORDER BY p.createdAt DESC
            """)
    Page<Product> findWithFilters(
            @Param("categoryId")    UUID categoryId,
            @Param("subCategoryId") UUID subCategoryId,
            @Param("sellerId")      Long sellerId,
            @Param("status")        ProductStatus status,
            Pageable pageable);
}