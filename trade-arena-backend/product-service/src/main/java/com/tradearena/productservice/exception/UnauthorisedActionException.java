package com.tradearena.productservice.exception;

public class UnauthorisedActionException extends RuntimeException {
    public UnauthorisedActionException(String message) {
        super(message);
    }
}
