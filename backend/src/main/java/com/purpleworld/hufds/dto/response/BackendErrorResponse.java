package com.purpleworld.hufds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BackendErrorResponse {
    private String error;
    private String message;
    private int status;
}