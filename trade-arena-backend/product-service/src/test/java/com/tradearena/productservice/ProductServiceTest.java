package com.tradearena.productservice;

import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.exception.ProductNotFoundException;
import com.tradearena.productservice.exception.UnauthorisedActionException;
import com.tradearena.productservice.model.*;
import com.tradearena.productservice.repository.ProductRepository;
import com.tradearena.productservice.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    private static final UUID PRODUCT_ID  = UUID.randomUUID();
    private static final UUID CATEGORY_ID = UUID.randomUUID();
    private static final UUID SUB_CAT_ID  = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setSellerId(1L);
        sampleProduct.setTitle("iPhone 14 Pro");
        sampleProduct.setDescription("256GB, Space Black");
        sampleProduct.setPrice(BigDecimal.valueOf(650.00));
        sampleProduct.setCategoryId(CATEGORY_ID);
        sampleProduct.setSubCategoryId(SUB_CAT_ID);
        sampleProduct.setCondition(ProductCondition.USED);
        sampleProduct.setStatus(ProductStatus.ACTIVE);
        sampleProduct.setQuickBidEnabled(false);
    }

    // ── createProduct() ───────────────────────────────────────────────────────

    @Test
    @DisplayName("createProduct() saves product and returns detail response")
    void createProduct_savesAndReturns() {
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        CreateProductRequest req = new CreateProductRequest();
        req.setTitle("iPhone 14 Pro");
        req.setDescription("256GB, Space Black");
        req.setPrice(BigDecimal.valueOf(650.00));
        req.setCategoryId(CATEGORY_ID);
        req.setSubCategoryId(SUB_CAT_ID);
        req.setCondition(ProductCondition.USED);
        req.setQuickBidEnabled(false);

        ProductDetailResponse response = productService.createProduct(req, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("iPhone 14 Pro");
        assertThat(response.getSellerId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(ProductStatus.ACTIVE);
        verify(repository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("createProduct() with quickBid sets status to AUCTION")
    void createProduct_withQuickBid_setsAuctionStatus() {
        sampleProduct.setStatus(ProductStatus.AUCTION);
        sampleProduct.setQuickBidEnabled(true);
        sampleProduct.setQuickBidEndTime(LocalDateTime.now().plusHours(2));
        sampleProduct.setQuickBidStartingPrice(BigDecimal.valueOf(100.00));

        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        CreateProductRequest req = new CreateProductRequest();
        req.setTitle("iPhone 14 Pro");
        req.setPrice(BigDecimal.valueOf(650.00));
        req.setCategoryId(CATEGORY_ID);
        req.setSubCategoryId(SUB_CAT_ID);
        req.setCondition(ProductCondition.USED);
        req.setQuickBidEnabled(true);
        req.setQuickBidEndTime(LocalDateTime.now().plusHours(2));
        req.setQuickBidStartingPrice(BigDecimal.valueOf(100.00));

        ProductDetailResponse response = productService.createProduct(req, 1L);

        assertThat(response.getStatus()).isEqualTo(ProductStatus.AUCTION);
        assertThat(response.getQuickBidEnabled()).isTrue();
    }

    @Test
    @DisplayName("createProduct() with quickBid but no end time throws")
    void createProduct_quickBidWithoutEndTime_throws() {
        CreateProductRequest req = new CreateProductRequest();
        req.setTitle("iPhone 14 Pro");
        req.setPrice(BigDecimal.valueOf(650.00));
        req.setCategoryId(CATEGORY_ID);
        req.setSubCategoryId(SUB_CAT_ID);
        req.setCondition(ProductCondition.USED);
        req.setQuickBidEnabled(true);
        req.setQuickBidEndTime(null);
        req.setQuickBidStartingPrice(BigDecimal.valueOf(100.00));

        assertThatThrownBy(() -> productService.createProduct(req, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("quickBidEndTime is required");
    }

    // ── getProductById() ──────────────────────────────────────────────────────

    @Test
    @DisplayName("getProductById() returns product when found")
    void getProductById_returnsProduct() {
        when(repository.findById(PRODUCT_ID)).thenReturn(Optional.of(sampleProduct));

        ProductDetailResponse response = productService.getProductById(PRODUCT_ID);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("iPhone 14 Pro");
    }

    @Test
    @DisplayName("getProductById() throws ProductNotFoundException when not found")
    void getProductById_throwsWhenNotFound() {
        UUID unknown = UUID.randomUUID();
        when(repository.findById(unknown)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(unknown))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    // ── removeProduct() ───────────────────────────────────────────────────────

    @Test
    @DisplayName("removeProduct() sets status to REMOVED")
    void removeProduct_setsRemoved() {
        when(repository.findById(PRODUCT_ID)).thenReturn(Optional.of(sampleProduct));
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        RemoveProductResponse response = productService.removeProduct(PRODUCT_ID, 1L);

        assertThat(sampleProduct.getStatus()).isEqualTo(ProductStatus.REMOVED);
        verify(repository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("removeProduct() throws UnauthorisedActionException for wrong seller")
    void removeProduct_throwsForWrongSeller() {
        when(repository.findById(PRODUCT_ID)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> productService.removeProduct(PRODUCT_ID, 99L))
                .isInstanceOf(UnauthorisedActionException.class)
                .hasMessageContaining("not the owner");
    }

    @Test
    @DisplayName("removeProduct() throws when product already REMOVED")
    void removeProduct_throwsWhenAlreadyRemoved() {
        sampleProduct.setStatus(ProductStatus.REMOVED);
        when(repository.findById(PRODUCT_ID)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> productService.removeProduct(PRODUCT_ID, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already removed");
    }

    // ── markAsSold() / markAsAuctionSold() ────────────────────────────────────

    @Test
    @DisplayName("markAsSold() sets status to SOLD")
    void markAsSold_setsStatusSold() {
        when(repository.findById(PRODUCT_ID)).thenReturn(Optional.of(sampleProduct));
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        productService.markAsSold(PRODUCT_ID);

        assertThat(sampleProduct.getStatus()).isEqualTo(ProductStatus.SOLD);
        verify(repository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("markAsAuctionSold() sets status to AUCTION_SOLD")
    void markAsAuctionSold_setsStatusAuctionSold() {
        when(repository.findById(PRODUCT_ID)).thenReturn(Optional.of(sampleProduct));
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        productService.markAsAuctionSold(PRODUCT_ID);

        assertThat(sampleProduct.getStatus()).isEqualTo(ProductStatus.AUCTION_SOLD);
        verify(repository, times(1)).save(sampleProduct);
    }

    // ── getProductById() not found ────────────────────────────────────────────

    @Test
    @DisplayName("markAsSold() throws ProductNotFoundException when not found")
    void markAsSold_throwsWhenNotFound() {
        UUID unknown = UUID.randomUUID();
        when(repository.findById(unknown)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.markAsSold(unknown))
                .isInstanceOf(ProductNotFoundException.class);
    }
}