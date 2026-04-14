package com.tradearena.controller.service;

import java.util.HashMap;
import java.util.Map;

import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tradearena.dto.StartAuctionDTO;

@Service
public class AuctionServiceImpl implements AuctionService {
	
	@Autowired
    private RuntimeService runtimeService;

    @Override
    public String startAuction(StartAuctionDTO dto) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("productId", dto.getProductId());
        variables.put("auctionEndTime", dto.getAuctionEndTime());
        variables.put("startingPrice", dto.getStartingPrice());
        ProcessInstance instance = runtimeService.startProcessInstanceById("auction_flow", variables);
        return instance.getId();
    }
}