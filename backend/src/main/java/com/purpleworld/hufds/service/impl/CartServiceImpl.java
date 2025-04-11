package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.dto.response.AddToCartResponse;
import com.purpleworld.hufds.entity.Cart;
import com.purpleworld.hufds.entity.CartGroup;
import com.purpleworld.hufds.entity.CartItem;
import com.purpleworld.hufds.entity.Customer;
import com.purpleworld.hufds.entity.MenuItem;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.repository.CartGroupRepository;
import com.purpleworld.hufds.repository.CartItemRepository;
import com.purpleworld.hufds.repository.CartRepository;
import com.purpleworld.hufds.repository.CustomerRepository;
import com.purpleworld.hufds.repository.MenuItemRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.service.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartRepository cartRepository;
    private final CartGroupRepository cartGroupRepository;
    private final CartItemRepository cartItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    @Transactional
    public AddToCartResponse addToCart(AddToCartRequest request, String email) {

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Cart cart = cartRepository.findByCustomerId(customer.getId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setCustomer(customer);
            newCart.setCartGroups(new ArrayList<>());
            return cartRepository.save(newCart);
        });

        CartGroup cartGroup = cart.getCartGroups().stream()
                .filter(cg -> cg.getRestaurant() != null && cg.getRestaurant().getId().equals(restaurant.getId()))
                .findFirst()
                .orElseGet(() -> {
                    CartGroup newGroup = new CartGroup();
                    newGroup.setCart(cart);
                    newGroup.setRestaurant(restaurant);
                    newGroup.setCartItems(new ArrayList<>());
                    cart.getCartGroups().add(newGroup);
                    return cartGroupRepository.save(newGroup);
                });

        Optional<CartItem> existingItemOpt = cartGroup.getCartItems().stream()
                .filter(ci -> ci.getMenuItem() != null && ci.getMenuItem().getId().equals(menuItem.getId()))
                .findFirst();

        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = new CartItem();
            cartItem.setCartGroup(cartGroup);
            cartItem.setMenuItem(menuItem);
            cartItem.setQuantity(request.getQuantity());
            cartGroup.getCartItems().add(cartItem);
        }
        cartItemRepository.save(cartItem);

        int totalQuantity = cart.getCartGroups().stream()
                .flatMap(group -> group.getCartItems().stream())
                .mapToInt(CartItem::getQuantity)
                .sum();

        int cartTotal = cart.getCartGroups().stream()
                .flatMap(group -> group.getCartItems().stream())
                .mapToInt(item -> item.getMenuItem().getPrice() * item.getQuantity())
                .sum();

        int groupCount = cart.getCartGroups().size();

        return new AddToCartResponse(
                "Item added to cart successfully",
                cart.getId(),
                cartGroup.getId(),
                cartItem.getId(),
                totalQuantity,
                menuItem.getName(),
                menuItem.getPrice(),
                cartTotal,
                restaurant.getRestaurantName(),
                groupCount
        );
    }
}