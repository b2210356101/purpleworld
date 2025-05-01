package com.purpleworld.hufds.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CouponRequest {
    private String name;            // Kupon adı (örneğin: "YAZ2025")
    private String description;     // Açıklama (örneğin: "Yaz kampanyası için %10 indirim")
    private Integer discountAmount; // Sabit indirim miktarı veya yüzdelik değer
    private Boolean isPercentage;   // true: yüzdelik, false: sabit
    private Integer minOrderAmount; // Kuponun geçerli olabilmesi için gereken minimum sipariş tutarı
    private LocalDate expiryDate;
}
