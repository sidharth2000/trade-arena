package com.tradearena.delegate;

import java.util.UUID;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tradearena.model.BidStatus;
import com.tradearena.repository.AuctionBidRepository;

@Component
public class CheckBid implements JavaDelegate {

    @Autowired
    private AuctionBidRepository bidRepository;

    @Override
    public void execute(DelegateExecution execution) {

        Object auctionObj = execution.getVariable("auctionId");

        if (auctionObj == null) {
            throw new RuntimeException("auctionId is missing");
        }

        UUID auctionId = UUID.fromString(auctionObj.toString());

        // ✅ fetch only ACTIVE + OUTBID bids
        int bidderCount = bidRepository
                .countByAuction_IdAndStatusIn(
                        auctionId,
                        java.util.List.of(BidStatus.ACTIVE, BidStatus.OUTBID)
                );

        execution.setVariable("bidderCount", bidderCount);

        System.out.println("Live bidder count (ACTIVE + OUTBID) = " + bidderCount);
    }
}