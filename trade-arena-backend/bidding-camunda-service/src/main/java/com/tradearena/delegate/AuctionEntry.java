package com.tradearena.delegate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tradearena.model.AuctionMaster;
import com.tradearena.repository.AuctionRepository;

@Component
public class AuctionEntry implements JavaDelegate {

    @Autowired
    private AuctionRepository auctionRepository;

    @Override
    public void execute(DelegateExecution execution) {

        // ✅ Get variables from Camunda
        UUID productId = UUID.fromString(execution.getVariable("productId").toString());
        Long sellerId = Long.valueOf(execution.getVariable("sellerId").toString());

        BigDecimal startingPrice = new BigDecimal(
                execution.getVariable("startingPrice").toString()
        );

        LocalDateTime startTime = LocalDateTime.now();

        Object endObj = execution.getVariable("auctionEndTime");
        LocalDateTime endTime = (endObj instanceof LocalDateTime)
                ? (LocalDateTime) endObj
                : LocalDateTime.parse(endObj.toString());

        // (optional future use)
        execution.setVariable("auctionStartTime", startTime);

        // ✅ Build entity
        AuctionMaster auction = new AuctionMaster();
        auction.setProductId(productId);
        auction.setSellerId(sellerId);
        auction.setStartingPrice(startingPrice);
        auction.setStartTime(startTime);
        auction.setEndTime(endTime);

        // status already ACTIVE by default

        // ✅ Save to DB
        AuctionMaster saved = auctionRepository.save(auction);

        // optional: store auctionId in process
        execution.setVariable("auctionId", saved.getId().toString());

        System.out.println("Auction created with ID: " + saved.getId());
    }
}