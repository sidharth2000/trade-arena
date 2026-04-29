package com.tradearena.productservice.controller;

import com.tradearena.productservice.dto.TransactionRequest;
import com.tradearena.productservice.dto.TransactionResponse;
import com.tradearena.productservice.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> recordTransaction(
            @RequestBody TransactionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.recordTransaction(req));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<TransactionResponse>> getByProduct(
            @PathVariable UUID productId) {
        return ResponseEntity.ok(transactionService.getByProductId(productId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponse>> getByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getByUserId(userId));
    }
}