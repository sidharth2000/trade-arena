package com.tradearena.productservice.repository;

import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** All listings by a specific seller */
    List<Product> findBySellerIdOrderByCreatedAtDesc(Integer sellerId);

    /** All active listings for marketplace browsing */
    Page<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);

    /** All listings in a specific category */
    Page<Product> findByCategoryIdAndStatusOrderByCreatedAtDesc(
            Integer categoryId, ProductStatus status, Pageable pageable);

    /** Search by keyword in title or description */
    @Query("""
            SELECT p FROM Product p
            WHERE p.status = :status
              AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY p.createdAt DESC
            """)
    Page<Product> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("status") ProductStatus status,
            Pageable pageable);

    /** Search by keyword within a specific category */
    @Query("""
            SELECT p FROM Product p
            WHERE p.status = :status
              AND p.categoryId = :categoryId
              AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY p.createdAt DESC
            """)
    Page<Product> searchByKeywordAndCategory(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("status") ProductStatus status,
            Pageable pageable);

    /** Price range filter */
    @Query("""
            SELECT p FROM Product p
            WHERE p.status = :status
              AND p.price BETWEEN :minPrice AND :maxPrice
            ORDER BY p.createdAt DESC
            """)
    Page<Product> findByPriceRange(
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("status") ProductStatus status,
            Pageable pageable);

    /** All active auction listings */
    Page<Product> findByStatusAndAuctionEnabledTrueOrderByAuctionEndTimeAsc(
            ProductStatus status, Pageable pageable);
}
