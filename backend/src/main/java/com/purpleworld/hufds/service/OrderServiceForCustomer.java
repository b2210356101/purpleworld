package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.PlaceOrderRequest;
import com.purpleworld.hufds.dto.response.OrderDTO;
import com.purpleworld.hufds.dto.response.PlaceOrderResponse;

import java.util.List;

public interface OrderServiceForCustomer {
    PlaceOrderResponse placeOrder(String email, PlaceOrderRequest request);
    List<OrderDTO> getCustomerOrderHistory(String email);

}
