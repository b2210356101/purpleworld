package com.purpleworld.hufds.dto.response;

import com.purpleworld.hufds.entity.Address;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddressResponse {
    private String name;
    private String city;
    private String district;
    private String neighborhood;
    private String street;
    private String buildingNumber;
    private String floor;
    private String apartmentNumber;
    private String fullAddress;
    private String phoneNumber;
    private String deliveryNote;
    private Long addressId;

    public AddressResponse(Address address) {
        this.name = address.getName();
        this.city = address.getCity();
        this.district = address.getDistrict();
        this.neighborhood = address.getNeighborhood();
        this.street = address.getStreet();
        this.buildingNumber = address.getBuildingNumber();
        this.floor = address.getFloor();
        this.apartmentNumber = address.getApartmentNumber();
        this.fullAddress = address.getFullAddress();
        this.phoneNumber = address.getPhoneNumber();
        this.deliveryNote = address.getDeliveryNote();
        this.addressId = address.getId();
    }
}