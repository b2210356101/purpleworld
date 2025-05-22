export type UserType = 'CUSTOMER' | 'RESTAURANT' | 'COURIER' | 'ADMIN' | undefined;

export interface UserInfo {
    username: string;
    profileImage?: string;
}

export interface Restaurant {
    id: number;
    restaurantName: string;
    distanceInKm: number;
    profileImg?: string;
    rating: number;
    reviews: number;
    items?: {
        id: number;
        name: string;
        price: number;
        quantity: number;
        image: string;
    }[];
    minAmount?: number;
}

export interface Food {
    id: number;
    name: string;
    image: string;
    restaurant: Restaurant;
    price: string;
    description: string;
}

export interface PageInfo {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PageResponse<T> {
    content: T[];
    pageInfo: PageInfo;
}

export interface Address {
    addressId: number;
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
    address: string;
    addressName: string;
}

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    img: string;
    restaurant: Restaurant;
    removableElements: RemovableElementDTO[]; 
    isAvailable: boolean;
}

export interface MenuItemAvailabilityRequest {
    isAvailable: boolean;
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
    removedElements: RemovableElementDTO[]; // Changed from removedElements: string[]
}

export interface CartItemResponse {
    itemId: number;
    itemName: string;
    itemPrice: number;
    quantity: number;
    itemImg: string;
    removableElements: RemovableElementDTO[]; // Changed from removable?: string[]
}


export interface CartGroupResponse {
    restaurantId: number;
    restaurantName: string;
    groupId: number;
    note?: string;
    items: CartItemResponse[];
    minAmount?: number;
    calculatedDiscount?: number;
    afterDiscount?: number;
}

export interface ViewCartResponse {
    cartId: number;
    totalQuantity: number;
    cartTotal: number;
    groupCount: number;
    groups: CartGroupResponse[];
    couponCode?: string;
    discountAmount?: number;
    isPercent?: boolean;
    finalTotal: number;
}

export interface RemovableElementDTO {
    id: number;
    name: string;
}


export interface AddToCartRequest {
    menuItemId: number;
    quantity: number;
    removableElements: RemovableElementDTO[];
}

export interface Category {
    id: number;
    name: string;
    menuItems: MenuItem[];
}

export interface MenuResponse {
    menuId: number;
    restaurantName: string;
    categories: Category[];
    pageInfo: PageInfo;
    stats?: MenuStats;
}

export interface PageInfo {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface MenuStats {
    totalItems: number;
    inStockItems: number;
    outOfStockItems: number;
}

export interface PlaceOrderRequest {
    paymentType: "credit" | "cash";
    couponCode?: string;
}

export interface PlaceOrderResponse {
    orderId: number;
    status: string;
    totalPrice: number;
    estimatedDuration: string;
    paymentType: string;
    note?: string;
}
export interface TrackingInfoResponseDTO {
    lat: number;
    lng: number;
    remainingDurationMinutes: number;
    remainingDistanceKm: number;
    completed: boolean;
}

export interface OrderItemDTO {
    name: string;
    menuItemId: number;
    quantity: number;
    price: number;
    removableElements: RemovableElementDTO[]; // Changed from removables: string | null
}

export interface OrderGroupDTO {
    orderGroupId: number;
    restaurantName: string;
    restaurantTotal: number;
    img: string;
    note: string | null;
    status: string;
    customerId: number;
    customerName: string;
    orderedDate: string
    preperationDate: string | null;
    takenOverDate: string | null;
    deliveredDate: string | null;
    rejectionDate: string | null;
    orderItems: OrderItemDTO[] | null;
    review?: ReviewDTO;

}

export interface OrderDTO {
    orderId: number;
    totalPrice: number;
    paymentType: string;
    note: string | null;
    orderedDate: string;
    status: string;
    orderGroups: OrderGroupDTO[];
}

export interface RestaurantResponseForAdmin {
    id: number;
    restaurantName: string;
    joinDate: string;
    status: 'APPROVED' | 'REJECTED' | 'BANNED' | 'PENDING';
    email: string;
    phoneNumber: string;
    address: string;
    taxId: string;
    profileImage?: string;
    latitude: number;
    longitude: number;
    manager_Name: string;
    manager_Last_Name: string;
    tax_Id: string;
}
export interface CourierResponseForAdmin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: 'APPROVED' | 'REJECTED' | 'BANNED' | 'PENDING';
    ssn: string;
}

export interface CustomerOrderSummaryDTO {
    orderId: number;
    status: string; // "IN_PROGRESS", "COMPLETED", "REJECTED"
    orderedDate: string;
    orderGroups: CustomerCurrentOrderDTO[];
}

export interface CustomerCurrentOrderDTO {
    orderGroupId: number;
    restaurantId: number;
    restaurantName: string;
    img: string;
    itemCount: number;
    totalPrice: number;
    status: string;
    orderedDate: string;
    estimatedDeliveryTime: string;
    distanceInKm: number;
    review?: ReviewDTO; // Add this property as optional
}

export interface OrderDetailsData {
    orderId: number;
    date: string;
    restaurants: {
        name: string;
        items: {
            name: string;
            price: string;
            quantity: number;
        }[];
    }[];
    address: {
        name: string;
        address: string;
        city: string;
    };
    billing: {
        itemTotal: string;
        discount: string;
        totalPayment: string;
    };
}

export interface OrderDetails {
    orderId: number;
    restaurantName: string;
    itemCount: number;
    totalPrice: number;
    addressName: string;
    addressFull: string;
    addressCity: string;
    date: string;
    discount: number;
    items: OrderItemDTO[];
}

// Stat type
export interface Stat {
    value: string | number;
    label: string;
    icon: string;
}

// Courier
export interface CourierOrder {
    orderGroupId: number;
    status: string;
    orderedDate: string;
    takenOverDate: string;
    customerId: number;
    customerName: string;
    customerPhone: string;
    customerLatitude: number;
    customerLongitude: number;
    customerFullAddress: string;
    restaurantName: string;
    restaurantPhone: string;
    restaurantLatitude: number;
    restaurantLongitude: number;
    mainOrder: boolean;
    orderItems: OrderItemDTO[];
}

export interface CourierStats {
    available: boolean;
    totalDeliveries: number;
    todayDeliveries: number;
    totalEarnings: number;
}

export interface AdminStats {
    totalRestaurants: number;
    totalCouriers: number;
    totalPendingApprovals: number;
    totalCoupons: number;
}

export interface SearchResult {
    restaurantId: number;
    restaurantName: string;
    profileImg: string;
    distanceInKm: number;
    ratings?: number;
    reviews?: number;
    matchedItems: {
        id: number;
        name: string;
        price: number;
        description: string;
        img: string;
        removableElements: RemovableElementDTO[]; 
    }[];
}

export interface ReviewRequest {
    tasteRating: number;
    deliveryRating: number;
    serviceRating: number;
    review?: string;
}
export interface ReviewDTO {
    tasteRating: number;
    deliveryRating: number;
    serviceRating: number;
    review: string;
    restaurantAnswer?: string | null;
    userName: string;
    userAvatar: string;
    reviewDate: string;
    orderGroupId: number;
}
export interface CouponRequest {
    code: string;
    description: string;
    isPercent: boolean;
    discountAmount: number;
    minOrderPrice: number;
    expiryDate: string;
}

export interface CouponResponse {
    id: number;
    code: string;
    description: string;
    isPercent: boolean;
    discountAmount: number;
    minOrderPrice: number;
    expiryDate: string;
    isActive: boolean;
}


export interface MinAmountError {
    restaurantId: number;
    restAmount: number;
}

export interface ReviewDTOforAdmin {
  tasteRating: number;
  deliveryRating: number;
  serviceRating: number;
  review: string;
  restaurantReply?: string | null;
  userName: string;
  userAvatar: string;
  reviewDate: string;
  orderGroupId: number;
  id?: number;
}