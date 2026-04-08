package com.tradearena.productservice;

import com.tradearena.productservice.client.AdminServiceClient;
import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.exception.ProductNotFoundException;
import com.tradearena.productservice.exception.UnauthorisedActionException;
import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.repository.ProductRepository;
import com.tradearena.productservice.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repository;

    @Mock
    private AdminServiceClient adminClient;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = new Product();
        sampleProduct.setProductId(1L);
        sampleProduct.setSellerId(101);
        sampleProduct.setTitle("iPhone 14 Pro");
        sampleProduct.setDescription("256GB, Space Black");
        sampleProduct.setPrice(650.00);
        sampleProduct.setCategoryId(3);
        sampleProduct.setStatus(ProductStatus.ACTIVE);
        sampleProduct.setAuctionEnabled(false);
    }

    // -----------------------------------------------------------------------
    // createProduct()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("createProduct() saves product and returns response")
    void createProduct_savesAndReturns() {
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        CreateProductRequest req = new CreateProductRequest();
        req.setTitle("iPhone 14 Pro");
        req.setDescription("256GB, Space Black");
        req.setPrice(650.00);
        req.setCategoryId(3);
        req.setAuctionEnabled(false);

        ProductResponse response = productService.createProduct(req, 101);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("iPhone 14 Pro");
        assertThat(response.getSellerId()).isEqualTo(101);
        assertThat(response.getStatus()).isEqualTo(ProductStatus.ACTIVE);
        verify(repository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("createProduct() with auction mode sets status to AUCTION")
    void createProduct_withAuction_setsAuctionStatus() {
        sampleProduct.setStatus(ProductStatus.AUCTION);
        sampleProduct.setAuctionEnabled(true);
        sampleProduct.setAuctionEndTime(LocalDateTime.now().plusHours(2));
        sampleProduct.setMinimumBidPrice(100.00);

        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        CreateProductRequest req = new CreateProductRequest();
        req.setTitle("iPhone 14 Pro");
        req.setDescription("256GB");
        req.setPrice(650.00);
        req.setCategoryId(3);
        req.setAuctionEnabled(true);
        req.setAuctionEndTime(LocalDateTime.now().plusHours(2));
        req.setMinimumBidPrice(100.00);

        ProductResponse response = productService.createProduct(req, 101);

        assertThat(response.getStatus()).isEqualTo(ProductStatus.AUCTION);
        assertThat(response.getAuctionEnabled()).isTrue();
    }

    @Test
    @DisplayName("createProduct() with auction but no end time throws IllegalArgumentException")
    void createProduct_auctionWithoutEndTime_throws() {
        CreateProductRequest req = new CreateProductRequest();
        req.setTitle("iPhone 14 Pro");
        req.setDescription("256GB");
        req.setPrice(650.00);
        req.setCategoryId(3);
        req.setAuctionEnabled(true);
        req.setAuctionEndTime(null); // missing
        req.setMinimumBidPrice(100.00);

        assertThatThrownBy(() -> productService.createProduct(req, 101))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("auctionEndTime is required");
    }

    // -----------------------------------------------------------------------
    // getProductById()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getProductById() returns product when found")
    void getProductById_returnsProduct() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById(1L);

        assertThat(response.getProductId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("iPhone 14 Pro");
    }

    @Test
    @DisplayName("getProductById() throws ProductNotFoundException when not found")
    void getProductById_throwsWhenNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("Product not found: 999");
    }

    // -----------------------------------------------------------------------
    // getProductsBySeller()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getProductsBySeller() returns all listings for a seller")
    void getProductsBySeller_returnsListings() {
        when(repository.findBySellerIdOrderByCreatedAtDesc(101))
                .thenReturn(List.of(sampleProduct));

        List<ProductResponse> results = productService.getProductsBySeller(101);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getSellerId()).isEqualTo(101);
    }

    // -----------------------------------------------------------------------
    // updateProduct()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("updateProduct() updates only non-null fields")
    void updateProduct_updatesNonNullFields() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        UpdateProductRequest req = new UpdateProductRequest();
        req.setPrice(550.00);

        productService.updateProduct(1L, req, 101);

        assertThat(sampleProduct.getPrice()).isEqualTo(550.00);
        assertThat(sampleProduct.getTitle()).isEqualTo("iPhone 14 Pro"); // unchanged
        verify(repository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("updateProduct() throws UnauthorisedActionException when wrong seller")
    void updateProduct_throwsForWrongSeller() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        UpdateProductRequest req = new UpdateProductRequest();
        req.setPrice(500.00);

        assertThatThrownBy(() -> productService.updateProduct(1L, req, 999))
                .isInstanceOf(UnauthorisedActionException.class)
                .hasMessageContaining("not the owner");
    }

    // -----------------------------------------------------------------------
    // enableAuction()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("enableAuction() switches status to AUCTION")
    void enableAuction_switchesStatus() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        sampleProduct.setStatus(ProductStatus.AUCTION);
        sampleProduct.setAuctionEnabled(true);
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        EnableAuctionRequest req = new EnableAuctionRequest(
                LocalDateTime.now().plusHours(2), 100.00);

        ProductResponse response = productService.enableAuction(1L, req, 101);

        assertThat(response.getStatus()).isEqualTo(ProductStatus.AUCTION);
        assertThat(response.getAuctionEnabled()).isTrue();
    }

    @Test
    @DisplayName("enableAuction() throws when product is not ACTIVE")
    void enableAuction_throwsForNonActiveProduct() {
        sampleProduct.setStatus(ProductStatus.SOLD);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        EnableAuctionRequest req = new EnableAuctionRequest(
                LocalDateTime.now().plusHours(2), 100.00);

        assertThatThrownBy(() -> productService.enableAuction(1L, req, 101))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ACTIVE listings");
    }

    // -----------------------------------------------------------------------
    // markAsSold() / markAsAuctionSold()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("markAsSold() sets status to SOLD")
    void markAsSold_setsStatusSold() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        sampleProduct.setStatus(ProductStatus.SOLD);
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.markAsSold(1L);

        assertThat(response.getStatus()).isEqualTo(ProductStatus.SOLD);
    }

    @Test
    @DisplayName("markAsAuctionSold() sets status to AUCTION_SOLD")
    void markAsAuctionSold_setsStatusAuctionSold() {
        sampleProduct.setStatus(ProductStatus.AUCTION);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        sampleProduct.setStatus(ProductStatus.AUCTION_SOLD);
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.markAsAuctionSold(1L);

        assertThat(response.getStatus()).isEqualTo(ProductStatus.AUCTION_SOLD);
    }

    // -----------------------------------------------------------------------
    // deactivateProduct()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("deactivateProduct() sets status to INACTIVE")
    void deactivateProduct_setsInactive() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(repository.save(any(Product.class))).thenReturn(sampleProduct);

        productService.deactivateProduct(1L, 101);

        assertThat(sampleProduct.getStatus()).isEqualTo(ProductStatus.INACTIVE);
        verify(repository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("deactivateProduct() throws UnauthorisedActionException for wrong seller")
    void deactivateProduct_throwsForWrongSeller() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> productService.deactivateProduct(1L, 999))
                .isInstanceOf(UnauthorisedActionException.class);
    }
}
