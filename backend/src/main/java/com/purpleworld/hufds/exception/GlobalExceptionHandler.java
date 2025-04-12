package com.purpleworld.hufds.exception;

import com.purpleworld.hufds.dto.response.RegisterResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegistrationException.class)
    public ResponseEntity<RegisterResponse> handleRegistrationException(RegistrationException ex) {
        return ResponseEntity.badRequest().body(new RegisterResponse(ex.getMessage(), false));
    }

}