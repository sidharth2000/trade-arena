package com.tradearena.productservice.service;

import com.tradearena.productservice.dto.TransactionRequest;
import com.tradearena.productservice.dto.TransactionResponse;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.model.Transaction;
import com.tradearena.productservice.repository.ProductRepository;
import com.tradearena.productservice.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              ProductRepository productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository     = productRepository;
    }

    @Transactional
    public TransactionResponse recordTransaction(TransactionRequest req) {
        // 1. Save transaction record
        Transaction tx = new Transaction();
        tx.setProductId(req.getProductId());
        tx.setUserId(req.getUserId());
        tx.setPrice(req.getPrice());
        tx.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "UNKNOWN");
        Transaction saved = transactionRepository.save(tx);

        // 2. Mark product as SOLD
        productRepository.findById(req.getProductId()).ifPresent(product -> {
            product.setStatus(ProductStatus.SOLD);
            productRepository.save(product);
        });

        return TransactionResponse.fromEntity(saved);
    }

    public List<TransactionResponse> getByProductId(UUID productId) {
        return transactionRepository.findByProductId(productId)
                .stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getByUserId(Long userId) {
        return transactionRepository.findByUserId(userId)
                .stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}