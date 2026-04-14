package com.tradearena.productservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradearena.productservice.controller.ProductController;
import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.exception.GlobalExceptionHandler;
import com.tradearena.productservice.exception.ProductNotFoundException;
import com.tradearena.productservice.exception.UnauthorisedActionException;
import com.tradearena.productservice.model.ProductCondition;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @MockBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    private static final UUID PRODUCT_ID   = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final Integer CATEGORY_ID = 1;
    private static final Integer SUB_CAT_ID = 2;
    // ── Helpers ───────────────────────────────────────────────────────────────

    private ProductDetailResponse sampleDetail() {
        ProductDetailResponse r = new ProductDetailResponse();
        // set fields via fromEntity equivalent
        return r;
    }

    private ProductListingSummary sampleSummary() {
        ProductListingSummary s = new ProductListingSummary();
        return s;
    }

    // ── POST /api/products ────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/products returns 201 with created product")
    void createProduct_returns201() throws Exception {
        ProductDetailResponse detail = sampleDetail();
        when(productService.createProduct(any(CreateProductRequest.class), eq(1L)))
                .thenReturn(detail);

        String body = """
                {
                  "title": "iPhone 14 Pro",
                  "description": "256GB, Space Black",
                  "price": 650.00,
                  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
                  "subCategoryId": "550e8400-e29b-41d4-a716-446655440002",
                  "condition": "USED",
                  "quickBidEnabled": false,
                  "productInformation": []
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "1")
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/products returns 400 when title is missing")
    void createProduct_returns400WhenTitleMissing() throws Exception {
        String body = """
                {
                  "description": "256GB",
                  "price": 650.00,
                  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
                  "subCategoryId": "550e8400-e29b-41d4-a716-446655440002",
                  "condition": "USED"
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Id", "1")
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/products/{id} ────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/products/{id} returns 200")
    void getProduct_returns200() throws Exception {
        when(productService.getProductById(PRODUCT_ID)).thenReturn(sampleDetail());

        mockMvc.perform(get("/api/products/" + PRODUCT_ID))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/products/{id} returns 404 when not found")
    void getProduct_returns404() throws Exception {
        UUID unknown = UUID.randomUUID();
        when(productService.getProductById(unknown))
                .thenThrow(new ProductNotFoundException("Product not found: " + unknown));

        mockMvc.perform(get("/api/products/" + unknown))
                .andExpect(status().isNotFound());
    }

    // ── GET /api/products ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/products returns paginated listings")
    void getProducts_returnsPaged() throws Exception {
        PagedResponse<ProductListingSummary> paged = new PagedResponse<>();
        paged.setContent(List.of(sampleSummary()));
        paged.setPage(0);
        paged.setSize(20);
        paged.setTotalElements(1);
        paged.setTotalPages(1);

        when(productService.getProducts(null, null, null, null, 0, 20)).thenReturn(paged);

        mockMvc.perform(get("/api/products?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // ── PATCH /api/products/{id}/remove ──────────────────────────────────────

    @Test
    @DisplayName("PATCH /api/products/{id}/remove returns 200")
    void removeProduct_returns200() throws Exception {
        RemoveProductResponse response = new RemoveProductResponse(
                PRODUCT_ID, ProductStatus.REMOVED, LocalDateTime.now());

        when(productService.removeProduct(eq(PRODUCT_ID), eq(1L))).thenReturn(response);

        mockMvc.perform(patch("/api/products/" + PRODUCT_ID + "/remove")
                        .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REMOVED"));
    }

    @Test
    @DisplayName("PATCH /api/products/{id}/remove returns 403 for wrong seller")
    void removeProduct_returns403ForWrongSeller() throws Exception {
        when(productService.removeProduct(eq(PRODUCT_ID), eq(99L)))
                .thenThrow(new UnauthorisedActionException("You are not the owner of this listing"));

        mockMvc.perform(patch("/api/products/" + PRODUCT_ID + "/remove")
                        .header("X-User-Id", "99"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/products/{id}/remove returns 404 when not found")
    void removeProduct_returns404() throws Exception {
        UUID unknown = UUID.randomUUID();
        when(productService.removeProduct(eq(unknown), eq(1L)))
                .thenThrow(new ProductNotFoundException("Product not found: " + unknown));

        mockMvc.perform(patch("/api/products/" + unknown + "/remove")
                        .header("X-User-Id", "1"))
                .andExpect(status().isNotFound());
    }

    // ── PUT /api/products/{id}/mark-sold ──────────────────────────────────────

    @Test
    @DisplayName("PUT /api/products/{id}/mark-sold returns 204")
    void markSold_returns204() throws Exception {
        mockMvc.perform(put("/api/products/" + PRODUCT_ID + "/mark-sold"))
                .andExpect(status().isNoContent());
    }

    // ── PUT /api/products/{id}/mark-auction-sold ──────────────────────────────

    @Test
    @DisplayName("PUT /api/products/{id}/mark-auction-sold returns 204")
    void markAuctionSold_returns204() throws Exception {
        mockMvc.perform(put("/api/products/" + PRODUCT_ID + "/mark-auction-sold"))
                .andExpect(status().isNoContent());
    }
}