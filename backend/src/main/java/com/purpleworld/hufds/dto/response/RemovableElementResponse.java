package com.purpleworld.hufds.dto.response;

import lombok.Data;

@Data
public class RemovableElementResponse {
    private Long id;
    private String name;

    public RemovableElementResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
