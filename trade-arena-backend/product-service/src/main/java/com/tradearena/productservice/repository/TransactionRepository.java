package com.tradearena.productservice.repository;

import com.tradearena.productservice.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByProductId(UUID productId);
    List<Transaction> findByUserId(Long userId);
}