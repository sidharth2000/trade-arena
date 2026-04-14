package com.tradearena.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tradearena.dto.ApiResponse;
import com.tradearena.dto.StartAuctionDTO;
import com.tradearena.service.AuctionService;

@RestController
@RequestMapping("/api/auction")
public class AuctionController {
	
	@Autowired
    AuctionService auctionService;

	@PostMapping("/start")
    public ResponseEntity<ApiResponse> startAuction(@RequestBody StartAuctionDTO dto) {

        String workflowId = auctionService.startAuction(dto);

        Map<String, Object> payload = new HashMap<>();
        payload.put("instanceId", workflowId);
        payload.put("productId", dto.getProductId());

        ApiResponse response = new ApiResponse(
                "Auction started successfully",
                payload
        );

        return ResponseEntity.ok(response);
    }
}