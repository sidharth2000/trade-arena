package com.tradearena.authservice.service;

import com.tradearena.authservice.dto.ApiResponse;
import com.tradearena.authservice.dto.LoginRequest;
import com.tradearena.authservice.dto.RegisterRequest;
import com.tradearena.authservice.dto.VerifyOtpRequest;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<ApiResponse> register(RegisterRequest request);
    ResponseEntity<ApiResponse> verifyOtp(VerifyOtpRequest request);
	ResponseEntity<ApiResponse> login(LoginRequest request);
}