package com.tradearena.productservice.repository;

import com.tradearena.productservice.dto.ProductListingSummary;
import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
			  AND (:currentUserId IS NULL OR p.sellerId <> :currentUserId)
			ORDER BY p.createdAt DESC
			""")
	Page<Product> findWithFilters(@Param("categoryId") Integer categoryId,
			@Param("subCategoryId") Integer subCategoryId, @Param("sellerId") Long sellerId,
			@Param("status") ProductStatus status, @Param("currentUserId") Long currentUserId, Pageable pageable);

	@Query("""
			SELECT p FROM Product p
			WHERE p.status <> com.tradearena.productservice.model.ProductStatus.REMOVED
			  AND p.sellerId = :currentUserId
			  AND (:categoryId    IS NULL OR p.categoryId    = :categoryId)
			  AND (:subCategoryId IS NULL OR p.subCategoryId = :subCategoryId)
			  AND (:status        IS NULL OR p.status        = :status)
			ORDER BY p.createdAt DESC
			""")
	Page<Product> findMyProducts(@Param("categoryId") Integer categoryId, @Param("subCategoryId") Integer subCategoryId,
			@Param("currentUserId") Long currentUserId, @Param("status") ProductStatus status, Pageable pageable);
}