package com.purpleworld.hufds.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodeService {

    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generateCodeForEmail(String email) {
        String code = String.valueOf(random.nextInt(899999) + 100000);
        verificationCodes.put(email, code);
        return code;
    }

    public boolean verifyCode(String email, String code) {
        String stored = verificationCodes.get(email);
        if (stored != null && stored.equals(code)) {
            verificationCodes.remove(email);
            return true;
        }
        return false;
    }
}
