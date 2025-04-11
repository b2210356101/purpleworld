package com.purpleworld.hufds.dto.request;

import lombok.Data;

@Data
public class RemovableElementRequest {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
