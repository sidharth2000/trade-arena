package com.tradearena.productservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradearena.productservice.controller.ProductController;
import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.exception.GlobalExceptionHandler;
import com.tradearena.productservice.exception.ProductNotFoundException;
import com.tradearena.productservice.exception.UnauthorisedActionException;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private ProductResponse sampleResponse() {
        ProductResponse r = new ProductResponse();
        r.setProductId(1L);
        r.setSellerId(101);
        r.setTitle("iPhone 14 Pro");
        r.setDescription("256GB, Space Black");
        r.setPrice(650.00);
        r.setCategoryId(3);
        r.setStatus(ProductStatus.ACTIVE);
        r.setAuctionEnabled(false);
        r.setCreatedAt(LocalDateTime.now());
        return r;
    }

    // -----------------------------------------------------------------------
    // POST /api/products
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("POST /api/products returns 201 with created product")
    void createProduct_returns201() throws Exception {
        when(productService.createProduct(any(CreateProductRequest.class), eq(101)))
                .thenReturn(sampleResponse());

        String body = """
                {
                  "title": "iPhone 14 Pro",
                  "description": "256GB, Space Black",
                  "price": 650.00,
                  "categoryId": 3,
                  "auctionEnabled": false
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "101")
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.title").value("iPhone 14 Pro"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("POST /api/products returns 400 when title is missing")
    void createProduct_returns400WhenTitleMissing() throws Exception {
        String body = """
                {
                  "description": "256GB",
                  "price": 650.00,
                  "categoryId": 3
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "101")
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // -----------------------------------------------------------------------
    // GET /api/products/{productId}
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/products/1 returns product")
    void getProduct_returnsProduct() throws Exception {
        when(productService.getProductById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.title").value("iPhone 14 Pro"));
    }

    @Test
    @DisplayName("GET /api/products/999 returns 404")
    void getProduct_returns404() throws Exception {
        when(productService.getProductById(999L))
                .thenThrow(new ProductNotFoundException("Product not found: 999"));

        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());
    }

    // -----------------------------------------------------------------------
    // GET /api/products
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/products returns paginated active listings")
    void getActiveListings_returnsPaged() throws Exception {
        PagedResponse<ProductResponse> paged = new PagedResponse<>();
        paged.setContent(List.of(sampleResponse()));
        paged.setPage(0);
        paged.setSize(20);
        paged.setTotalElements(1);
        paged.setTotalPages(1);
        paged.setLast(true);

        when(productService.getActiveListings(0, 20)).thenReturn(paged);

        mockMvc.perform(get("/api/products?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // -----------------------------------------------------------------------
    // GET /api/products/search
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/products/search returns matching listings")
    void searchProducts_returnsResults() throws Exception {
        PagedResponse<ProductResponse> paged = new PagedResponse<>();
        paged.setContent(List.of(sampleResponse()));
        paged.setTotalElements(1);

        when(productService.searchProducts("iphone", null, 0, 20)).thenReturn(paged);

        mockMvc.perform(get("/api/products/search?keyword=iphone"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("iPhone 14 Pro"));
    }

    // -----------------------------------------------------------------------
    // GET /api/products/my-listings
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/products/my-listings returns seller's listings")
    void getMyListings_returnsSellerListings() throws Exception {
        when(productService.getProductsBySeller(101)).thenReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/products/my-listings")
                        .header("X-User-Id", "101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].sellerId").value(101));
    }

    // -----------------------------------------------------------------------
    // PUT /api/products/{productId}
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("PUT /api/products/1 updates listing and returns 200")
    void updateProduct_returns200() throws Exception {
        ProductResponse updated = sampleResponse();
        updated.setPrice(550.00);
        when(productService.updateProduct(eq(1L), any(UpdateProductRequest.class), eq(101)))
                .thenReturn(updated);

        String body = """
                { "price": 550.00 }
                """;

        mockMvc.perform(put("/api/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "101")
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(550.00));
    }

    @Test
    @DisplayName("PUT /api/products/1 by wrong seller returns 403")
    void updateProduct_returns403ForWrongSeller() throws Exception {
        when(productService.updateProduct(eq(1L), any(UpdateProductRequest.class), eq(999)))
                .thenThrow(new UnauthorisedActionException("You are not the owner of this listing"));

        mockMvc.perform(put("/api/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "999")
                        .content("{ \"price\": 500.00 }"))
                .andExpect(status().isForbidden());
    }

    // -----------------------------------------------------------------------
    // PUT /api/products/{productId}/auction
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("PUT /api/products/1/auction enables auction mode")
    void enableAuction_returns200() throws Exception {
        ProductResponse auctionProduct = sampleResponse();
        auctionProduct.setStatus(ProductStatus.AUCTION);
        auctionProduct.setAuctionEnabled(true);

        when(productService.enableAuction(eq(1L), any(EnableAuctionRequest.class), eq(101)))
                .thenReturn(auctionProduct);

        String body = """
                {
                  "auctionEndTime": "2026-04-10T14:00:00",
                  "minimumBidPrice": 100.00
                }
                """;

        mockMvc.perform(put("/api/products/1/auction")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "101")
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AUCTION"))
                .andExpect(jsonPath("$.auctionEnabled").value(true));
    }

    // -----------------------------------------------------------------------
    // DELETE /api/products/{productId}
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("DELETE /api/products/1 returns 204")
    void deactivateProduct_returns204() throws Exception {
        mockMvc.perform(delete("/api/products/1")
                        .header("X-User-Id", "101"))
                .andExpect(status().isNoContent());
    }
}
