package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.OrderGroupDTO;
import com.purpleworld.hufds.dto.OrderItemDTO;
import com.purpleworld.hufds.dto.RemovableElementDTO;
import com.purpleworld.hufds.dto.ReviewDTO;
import com.purpleworld.hufds.dto.request.PlaceOrderRequest;
import com.purpleworld.hufds.dto.response.CartAmountResponse;
import com.purpleworld.hufds.dto.response.OrderDTO;

import com.purpleworld.hufds.dto.response.PlaceOrderResponse;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.OrderServiceForCustomer;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImplCustomer implements OrderServiceForCustomer {
    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartRepository cartRepository;
    private final CartGroupRepository cartGroupRepository;
    private final CartItemRepository cartItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final RemovableElementRepository removableElementRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    
    @Transactional
    @Override
    public PlaceOrderResponse placeOrder(String email, PlaceOrderRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        boolean cartIsEmpty = cart.getCartGroups() == null ||
                cart.getCartGroups().isEmpty() ||
                cart.getCartGroups().stream()
                        .allMatch(group -> group.getCartItems() == null || group.getCartItems().isEmpty());

        if (cartIsEmpty) {
            throw new RuntimeException("Sepetinizde ürün bulunmamaktadır.");
        }

        for (CartGroup cartGroup : cart.getCartGroups()) {
            int total = 0;
            for (CartItem cartItem : cartGroup.getCartItems()) {
                total += cartItem.getMenuItem().getPrice() * cartItem.getQuantity();
                System.out.println(total);
            }

            if (total < cartGroup.getRestaurant().getMinOrderAmount()){
                throw new RuntimeException("Minimum sepet tutarını geçmelisin.");
            }
        }
        Order order = new Order();
        order.setCustomer(customer);
        order.setAddressId(customer.getCurrentAddressId());
        order.setOrderedDate(LocalDateTime.now());
        order.setPaymentType(request.getPaymentType());

        int totalPrice = 0;
        List<OrderGroup> orderGroups = new ArrayList<>();

        for (CartGroup cartGroup : cart.getCartGroups()) {
            OrderGroup orderGroup = new OrderGroup();
            orderGroup.setOrder(order);
            orderGroup.setRestaurant(cartGroup.getRestaurant());

            int groupTotal = 0;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : cartGroup.getCartItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderGroup(orderGroup);
                orderItem.setMenuItemId(cartItem.getMenuItem().getId());
                orderItem.setMenuItem(cartItem.getMenuItem());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getMenuItem().getPrice());
                
                // Copy removable elements from cart item to order item
                for (RemovableElement element : cartItem.getRemovableElements()) {
                    orderItem.getRemovableElements().add(element);
                }

                groupTotal += orderItem.getPrice() * orderItem.getQuantity();
                orderItems.add(orderItem);
            }

            orderGroup.setRestaurantTotal(groupTotal);
            orderGroup.setOrderItems(orderItems);
            orderGroup.setNote(cartGroup.getNote());

            orderGroups.add(orderGroup);
            totalPrice += groupTotal;
        }

        order.setPrice(totalPrice);
        order.setOrderGroups(orderGroups);
        orderRepository.save(order);

        // Clean cart not delete
        cartGroupRepository.deleteAll(cart.getCartGroups());
        cart.getCartGroups().clear();
        cartRepository.save(cart);

        return new PlaceOrderResponse(
                order.getId(),
                order.getPrice(),
                order.getPaymentType()
        );
    }

    @Transactional
    @Override
    public List<OrderDTO> getCustomerOrderHistory(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Order> orders = orderRepository.findByCustomerOrderByOrderedDateDesc(customer);

        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String determineOrderStatus(Order order) {
        boolean allDelivered = order.getOrderGroups().stream().allMatch(g -> g.getDeliveredDate() != null);
        if (allDelivered) return "DELIVERED";

        boolean allTaken = order.getOrderGroups().stream().allMatch(g -> g.getTakenOverDate() != null);
        if (allTaken) return "ON_THE_WAY";

        boolean allPrepared = order.getOrderGroups().stream().allMatch(g -> g.getPreperationDate() != null);
        if (allPrepared) return "PREPARING";

        return "ORDERED";
    }

    // Optional: You can add a method to convert Order to OrderDTO if needed elsewhere
    private OrderDTO convertToDTO(Order order) {
        List<OrderGroupDTO> groupDTOs = order.getOrderGroups().stream().map(group -> {
            List<OrderItemDTO> itemDTOs = group.getOrderItems().stream().map(item -> {
                // Convert removable elements to DTOs
                List<RemovableElementDTO> removableDTOs = item.getRemovableElements().stream()
                    .map(re -> new RemovableElementDTO(re.getId(), re.getName()))
                    .collect(Collectors.toList());
                
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setName(item.getMenuItem().getName());
                itemDTO.setMenuItemId(item.getMenuItemId());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                itemDTO.setRemovableElements(removableDTOs);
                return itemDTO;
            }).collect(Collectors.toList());

            OrderGroupDTO groupDTO = new OrderGroupDTO();
            groupDTO.setOrderGroupId(group.getId());
            groupDTO.setRestaurantName(group.getRestaurant().getRestaurantName());
            groupDTO.setRestaurantTotal(group.getRestaurantTotal());
            groupDTO.setNote(group.getNote());
            groupDTO.setStatus(group.getStatus());
            groupDTO.setPreperationDate(group.getPreperationDate());
            groupDTO.setTakenOverDate(group.getTakenOverDate());
            groupDTO.setDeliveredDate(group.getDeliveredDate());
            groupDTO.setOrderItems(itemDTOs);
            groupDTO.setImg(group.getRestaurant().getProfileImg());
            groupDTO.setRating(group.getRating() != null ? group.getRating() : 0.0);

            // Review varsa ekle
            reviewRepository.findByOrderGroupId(group.getId()).ifPresent(review -> {
                ReviewDTO reviewDTO = new ReviewDTO();
                reviewDTO.setTasteRating(review.getTasteRating());
                reviewDTO.setDeliveryRating(review.getDeliveryRating());
                reviewDTO.setServiceRating(review.getServiceRating());
                reviewDTO.setReview(review.getReview());
                reviewDTO.setRestaurantAnswer(review.getRestaurantReply());
                groupDTO.setReview(reviewDTO);
            });

            return groupDTO;
        }).collect(Collectors.toList());

        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getId());
        dto.setTotalPrice(order.getPrice());
        dto.setPaymentType(order.getPaymentType());
        dto.setOrderedDate(order.getOrderedDate());
        dto.setOrderGroups(groupDTOs);
        dto.setStatus(determineOrderStatus(order));
        return dto;
    }
}