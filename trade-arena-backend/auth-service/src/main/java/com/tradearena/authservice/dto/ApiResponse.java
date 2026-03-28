package com.tradearena.authservice.dto;

import java.util.Map;

public class ApiResponse {

    private String message;
    private Map<String, Object> payload;

    public ApiResponse(String message, Map<String, Object> payload) {
        this.message = message;
        this.payload = payload;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }
}