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

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse("Runtime Error", ex.getMessage()));
    }

    public static class ErrorResponse {
        public String error;
        public String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }
    }


}