package com.tradearena.repository;


import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tradearena.model.AuctionBid;
import com.tradearena.model.AuctionMaster;
import com.tradearena.model.BidStatus;

public interface AuctionBidRepository extends JpaRepository<AuctionBid, UUID> {

    List<AuctionBid> findByAuctionOrderByAmountDesc(AuctionMaster auction);

    List<AuctionBid> findByAuction_Id(UUID auctionId);

	int countByAuction_IdAndStatusIn(UUID auctionId, List<BidStatus> of);
}