export type UserType = 'CUSTOMER' | 'RESTAURANT' | 'COURIER' | 'ADMIN' | undefined;

export interface UserInfo {
    username: string;
    profileImage?: string;
}

export interface Address {
    addressId?: number;
    name: string;
    fullAddress: string;
    phoneNumber: string;
    buildingNumber: string;
    floor: string;
    apartmentNumber: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    street?: string | null;
    deliveryNote?: string;
    latitude?: number;
    longitude?: number;
}

export interface CurrentAddress {
    addressId: number;
}