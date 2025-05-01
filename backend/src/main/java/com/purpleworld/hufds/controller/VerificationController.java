package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.CodeDTO;
import com.purpleworld.hufds.service.CodeService;
import com.purpleworld.hufds.service.MailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/verification")
public class VerificationController {

    private final CodeService codeService;
    private final MailService mailService;

    public VerificationController(CodeService codeService, MailService mailService) {
        this.codeService = codeService;
        this.mailService = mailService;
    }

    @PostMapping("/send-code")
    public ResponseEntity<String> sendCode(@RequestBody CodeDTO dto) {
        String code = codeService.generateCodeForEmail(dto.getEmail());

        mailService.sendVerificationEmail(dto.getEmail(), code);

        return ResponseEntity.ok("Code sent");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody CodeDTO dto) {
        boolean verified = codeService.verifyCode(dto.getEmail(), dto.getCode());
        if (!verified) {
            return ResponseEntity.badRequest().body("Invalid code");
        }
        return ResponseEntity.ok("verified");
    }
}
