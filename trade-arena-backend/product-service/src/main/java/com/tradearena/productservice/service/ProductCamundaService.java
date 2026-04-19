package com.tradearena.productservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tradearena.productservice.dto.UpdateProductStatusRequest;
import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.repository.ProductRepository;

@Service
public class ProductCamundaService {
	
	@Autowired
    private ProductRepository productRepository;
	
	public void updateProductStatus(UpdateProductStatusRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // ✅ Update status
        product.setStatus(ProductStatus.valueOf(request.getStatus()));

        // ✅ Auction specific fields
        product.setQuickBidEnabled(true);
        product.setQuickBidStartTime(request.getAuctionStartTime());
        product.setQuickBidEndTime(request.getAuctionEndTime());
        product.setQuickBidStartingPrice(request.getStartingPrice());


        productRepository.save(product);
    }

}
