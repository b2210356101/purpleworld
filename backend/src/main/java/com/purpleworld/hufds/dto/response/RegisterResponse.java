package com.purpleworld.hufds.dto.response;

import lombok.Data;

@Data
public class RegisterResponse {
    private String message;
    private boolean success;

    public RegisterResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
}