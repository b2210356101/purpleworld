package com.purpleworld.hufds.exception;

import com.purpleworld.hufds.dto.response.BackendErrorResponse;
import com.purpleworld.hufds.dto.response.RegisterResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegistrationException.class)
    public ResponseEntity<RegisterResponse> handleRegistrationException(RegistrationException ex) {
        return ResponseEntity.badRequest().body(new RegisterResponse(ex.getMessage(), false));
    }

    @ExceptionHandler(LoginException.class)
    public ResponseEntity<BackendErrorResponse> handleCustomException(LoginException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(new BackendErrorResponse(ex.getError(), ex.getMessage(), ex.getStatusCode()));
    }


}