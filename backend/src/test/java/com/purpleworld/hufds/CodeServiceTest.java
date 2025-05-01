package com.purpleworld.hufds;

import com.purpleworld.hufds.service.CodeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CodeServiceTest {

    @Autowired
    private CodeService codeService;

    @Test
    public void testGenerateAndVerifyCodeSuccess() {
        String email = "test@example.com";
        String generatedCode = codeService.generateCodeForEmail(email);

        boolean isVerified = codeService.verifyCode(email, generatedCode);

        assertTrue(isVerified, "The verification code should match and be verified.");
    }

    @Test
    public void testVerifyCodeFailure() {
        String email = "wrong@example.com";
        String generatedCode = codeService.generateCodeForEmail(email);

        boolean isVerified = codeService.verifyCode(email, "wrong-code");

        assertFalse(isVerified, "The verification should fail for wrong code.");
    }
}