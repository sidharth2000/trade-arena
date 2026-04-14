package com.tradearena.productservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tradearena.productservice.dto.UpdateProductStatusRequest;
import com.tradearena.productservice.service.ProductCamundaService;

@RestController
@RequestMapping("/api/productcamunda")
public class ProductCamundaController {
	
	@Autowired
    private ProductCamundaService productService;
	
	@PostMapping("/update-status")
    public ResponseEntity<String> updateStatus(@RequestBody UpdateProductStatusRequest request) {

        productService.updateProductStatus(request);

        return ResponseEntity.ok("Product moved to AUCTION successfully");
    }

}
