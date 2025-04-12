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
    neighborhood?: string ;
    street?: string | null;
    deliveryNote?: string;
    latitude?: number;
    longitude?: number;
}


export interface CurrentAddress {
    addressId: number;
}

export interface NearestRestaurant {
    restaurantId: number;
    restaurantName: string;
    distanceInKm: number;
    img: string;
    rating:number;
    reviews:number;
}

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    img: string;
    restaurantName: string;
    restaurantId: number;
    removableElements: { id: number; name: string }[];

}

export interface Ingredient {
    id: string;
    name: string;
}

export interface AddToCartRequest {
    menuItemId: number;
    quantity: number;
    removableElements: string;   // CSV: "ing1,ing2"
}

export interface AddToCartResponse {
    message: string;
    cartId: number;
    cartGroupId: number;
    cartItemId: number;
    totalQuantity: number;
    itemName: string;
    itemPrice: number;
    cartTotal: number;
    restaurantName: string;
    groupCount: number;
    removedElements: string[];   // ["ing1","ing2"]
}