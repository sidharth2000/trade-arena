package com.tradearena.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tradearena.model.AuctionMaster;
import com.tradearena.model.AuctionStatus;

public interface AuctionRepository extends JpaRepository<AuctionMaster, UUID> {

	Optional<AuctionMaster> findByProductIdAndStatus(UUID productId, AuctionStatus status);
	Optional<AuctionMaster> findByProductId(UUID productId);
}