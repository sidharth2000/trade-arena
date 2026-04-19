package com.tradearena.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tradearena.dto.ApiResponse;
import com.tradearena.dto.AuctionDetailResponse;
import com.tradearena.dto.BidResponseDTO;
import com.tradearena.dto.PlaceBidRequest;
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
	
	
	@PostMapping("/placebid")
    public ResponseEntity<ApiResponse> placeBid(@RequestBody PlaceBidRequest request) {
        return ResponseEntity.ok(auctionService.placeBid(request));
    }
	
	@GetMapping("/product/{productId}/bids")
    public ResponseEntity<List<BidResponseDTO>> getBids(@PathVariable UUID productId) {
        return ResponseEntity.ok(
                auctionService.getBidsByProductId(productId)
        );
    }
	
	@GetMapping("/product/{productId}")
    public AuctionDetailResponse getAuctionByProductId(@PathVariable UUID productId) {
        return auctionService.getAuctionByProductId(productId);
    }
}