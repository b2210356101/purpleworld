package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.entity.Address;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String city;
    private String district;
    private String neighborhood;
    private String street;
    private String buildingNumber;
    private String apartmentNumber;

    public AddressResponse(Address address) {
        this.id = address.getId();
        this.city = address.getCity();
        this.district = address.getDistrict();
        this.neighborhood = address.getNeighborhood();
        this.street = address.getStreet();
        this.buildingNumber = address.getBuildingNumber();
        this.apartmentNumber = address.getApartmentNumber();
    }
}