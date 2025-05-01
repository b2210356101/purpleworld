import React, {useRef, useState} from "react";

const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));
const [verificationCode, setVerificationCode] = useState("");

// Here's how you should define the inputRefs in your RegisterRestaurant component
const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

// And here's the correct implementation for your OTP input handlers
const handleDigitChange = (index: number, value: string) => {
  if (!/^\d?$/.test(value)) return;

  const newDigits = [...codeDigits];
  newDigits[index] = value;
  setCodeDigits(newDigits);
  setVerificationCode(newDigits.join(""));

  // Move to next input if a digit was entered
  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};

const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
  if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};
