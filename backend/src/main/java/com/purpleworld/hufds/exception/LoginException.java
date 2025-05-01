package com.purpleworld.hufds.exception;

public class LoginException extends RuntimeException {
    private final String error;
    private final int statusCode;

    public LoginException(String error, String message, int statusCode) {
        super(message);
        this.error = error;
        this.statusCode = statusCode;
    }

    public String getError() {
        return error;
    }

    public int getStatusCode() {
        return statusCode;
    }
}