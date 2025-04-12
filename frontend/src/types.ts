export type UserType = 'CUSTOMER' | 'RESTAURANT' | 'COURIER' | 'ADMIN' | undefined;

export interface UserInfo {
    username: string;
    profileImage?: string;
}

export interface Restaurant {
    id: number;
    restaurantName: string;
    distanceInKm?: number;
    profileImg?: string;
    rating?: number;
    reviews?: number;
    items?: {
        id: number;
        name: string;
        price: number;
        quantity: number;
        image: string;
    }[];
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

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    img: string;
    restaurant: Restaurant;
    removableElements: { id: number; name: string }[];

}

export interface Ingredient {
    id: number;
    name: string;
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
    removedElements: string[];
}

export interface CartItemResponse {
    itemId: number;
    itemName: string;
    itemPrice: number;
    quantity: number;
    itemImg: string;
    removable?: string[];
}


export interface CartGroupResponse {
    restaurantId: number;
    restaurantName: string;
    groupId: number;
    note?: string;
    items: CartItemResponse[];
}

export interface ViewCartResponse {
    cartId: number;
    totalQuantity: number;
    cartTotal: number;
    groupCount: number;
    groups: CartGroupResponse[];
}

export interface RemovableElementDTO {
    id: number;
    name: string;
}


export interface AddToCartRequest {
    menuItemId: number;
    quantity: number;
    removableElements: RemovableElementDTO[]; // Now expects an array of objects with id and name
}
