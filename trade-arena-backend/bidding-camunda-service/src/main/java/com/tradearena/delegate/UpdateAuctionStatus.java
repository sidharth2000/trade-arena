package com.tradearena.delegate;

import java.util.UUID;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tradearena.model.AuctionMaster;
import com.tradearena.model.AuctionStatus;
import com.tradearena.repository.AuctionRepository;

@Component
public class UpdateAuctionStatus implements JavaDelegate {

    @Autowired
    private AuctionRepository auctionRepository;

    @Override
    public void execute(DelegateExecution execution) {

        // 1. Get variables from Camunda
        Object auctionObj = execution.getVariable("auctionId");
        Object statusObj = execution.getVariable("status");

        if (auctionObj == null || statusObj == null) {
            throw new RuntimeException("auctionId or status is missing");
        }

        UUID auctionId = UUID.fromString(auctionObj.toString());
        AuctionStatus status = AuctionStatus.valueOf(statusObj.toString());

        // 2. Load auction
        AuctionMaster auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // 3. Update status
        auction.setStatus(status);

        // 4. Save
        auctionRepository.save(auction);

        System.out.println("Auction " + auctionId + " updated to " + status);
    }
}