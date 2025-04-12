package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.RemovableElementDTO;
import com.purpleworld.hufds.dto.request.AddToCartRequest;
import com.purpleworld.hufds.dto.request.CartGroupNoteRequest;
import com.purpleworld.hufds.dto.request.UpdateCartItemRequest;
import com.purpleworld.hufds.dto.response.*;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

        private final CustomerRepository customerRepository;
        private final MenuItemRepository menuItemRepository;
        private final CartRepository cartRepository;
        private final CartGroupRepository cartGroupRepository;
        private final CartItemRepository cartItemRepository;
        private final RestaurantRepository restaurantRepository;
        private final RemovableElementRepository removableElementRepository;

        @Override
        @Transactional
        public AddToCartResponse addToCart(AddToCartRequest request, String email) {
                // 1) Load customer, menuItem, restaurant
                Customer customer = customerRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Customer not found"));

                MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                        .orElseThrow(() -> new RuntimeException("MenuItem not found"));

                Restaurant restaurant = menuItem.getCategory().getMenu().getRestaurant();

                // 2) Get or create the Cart
                Cart cart = cartRepository.findByCustomerId(customer.getId())
                        .orElseGet(() -> {
                                Cart newCart = new Cart();
                                newCart.setCustomer(customer);
                                return cartRepository.save(newCart);
                        });

                // 3) Get or create the CartGroup for this restaurant
                CartGroup cartGroup = cart.getCartGroups().stream()
                        .filter(cg -> cg.getRestaurant().equals(restaurant))
                        .findFirst()
                        .orElseGet(() -> {
                                CartGroup newGroup = new CartGroup();
                                newGroup.setCart(cart);
                                newGroup.setRestaurant(restaurant);
                                return cartGroupRepository.save(newGroup);
                        });

                // 4) Find existing CartItem for this menuItem, or make a new one
                Optional<CartItem> existing = cartGroup.getCartItems().stream()
                        .filter(ci -> ci.getMenuItem().equals(menuItem))
                        .findFirst();

                CartItem cartItem = existing.orElseGet(() -> {
                        CartItem ci = new CartItem();
                        ci.setCartGroup(cartGroup);
                        ci.setMenuItem(menuItem);
                        return ci;
                });

                // 5) Update quantity
                cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());

                // 6) Handle removable elements
                List<RemovableElement> removableElements = new ArrayList<>();


                // 7) Persist the CartItem
                cartItemRepository.save(cartItem);

                // 8) Calculate totals for response
                int totalQuantity = cart.getCartGroups().stream()
                        .flatMap(g -> g.getCartItems().stream())
                        .mapToInt(CartItem::getQuantity)
                        .sum();

                int cartTotal = cart.getCartGroups().stream()
                        .flatMap(g -> g.getCartItems().stream())
                        .mapToInt(ci -> ci.getMenuItem().getPrice() * ci.getQuantity())
                        .sum();

                int groupCount = cart.getCartGroups().size();

                // 9) Convert RemovableElement entities to RemovableElementDTO for response
                List<RemovableElementDTO> removableDTOs = removableElements.stream()
                        .map(entity -> new RemovableElementDTO(entity.getId(), entity.getName()))
                        .collect(Collectors.toList());

                if (request.getRemovableElements() != null && !request.getRemovableElements().isEmpty()) {
                        for (RemovableElementDTO dto : request.getRemovableElements()) {
                                Optional<RemovableElement> elementOpt = removableElementRepository.findById(dto.getId());
                                if (elementOpt.isPresent()) {
                                        RemovableElement element = elementOpt.get();

                                        removableElements.add(element);
                                }
                        }
                }



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
                        groupCount,
                        removableDTOs);  // Return the DTOs instead of just names
        }

        @Override
        @Transactional
        public ViewCartResponse viewCart(String email) {
                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                Cart cart = cartRepository.findByCustomerId(customer.getId())
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                List<CartGroupResponse> groupResponses = new ArrayList<>();
                int totalQuantity = 0;
                int cartTotal = 0;

                List<CartGroup> sortedGroups = new ArrayList<>(cart.getCartGroups());
                sortedGroups.sort((a, b) -> a.getRestaurant().getRestaurantName()
                        .compareToIgnoreCase(b.getRestaurant().getRestaurantName())); // sort by name

                for (CartGroup group : sortedGroups) {
                        Restaurant restaurant = group.getRestaurant();

                        List<CartItem> sortedItems = new ArrayList<>(group.getCartItems());
                        sortedItems.sort((a, b) -> a.getMenuItem().getName()
                                        .compareToIgnoreCase(b.getMenuItem().getName())); // sort by name

                        List<CartItemResponse> itemResponses = new ArrayList<>();

                        for (CartItem item : sortedItems) {
                                MenuItem menuItem = item.getMenuItem();
                                int quantity = item.getQuantity();
                                int price = menuItem.getPrice();

                                totalQuantity += quantity;
                                cartTotal += quantity * price;

                                itemResponses.add(new CartItemResponse(
                                                item.getId(),
                                                menuItem.getName(),
                                                price,
                                                quantity,
                                                menuItem.getImg(),
                                                null));
                        }

                        groupResponses.add(new CartGroupResponse(
                                        restaurant.getId(),
                                        restaurant.getRestaurantName(),
                                        group.getNote(),
                                        group.getId(),
                                        itemResponses));
                }

                return new ViewCartResponse(
                                cart.getId(),
                                totalQuantity,
                                cartTotal,
                                groupResponses.size(),
                                groupResponses);
        }

        @Override
        @Transactional
        public void removeItemFromCart(Long itemId, String email) {
                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                Cart cart = cartRepository.findByCustomerId(customer.getId())
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                CartItem item = cartItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("CartItem not found"));

                // double check for manuel testing
                boolean belongsToCustomer = cart.getCartGroups().stream()
                                .flatMap(group -> group.getCartItems().stream())
                                .anyMatch(ci -> ci.equals(item));

                if (!belongsToCustomer) {
                        throw new RuntimeException("Unauthorized: This item does not belong to your cart.");
                }
                System.out.println("CartItem with ID " + item.getId() + " deleted.");
                CartGroup group = item.getCartGroup();
                group.getCartItems().remove(item);
                cartItemRepository.delete(item);

                if (group.getCartItems().isEmpty()) {
                        cart.getCartGroups().remove(group);
                        cartGroupRepository.delete(group);
                        System.out.println("Cart group deleted.");
                }

        }

        @Override
        @Transactional
        public void updateCartItemQuantity(UpdateCartItemRequest request, String email) {
                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                Cart cart = cartRepository.findByCustomerId(customer.getId())
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                CartItem item = cartItemRepository.findById(request.getItemId())
                                .orElseThrow(() -> new RuntimeException("CartItem not found"));

                // double check
                boolean belongsToCustomer = cart.getCartGroups().stream()
                                .flatMap(group -> group.getCartItems().stream())
                                .anyMatch(ci -> ci.getId().equals(item.getId()));

                if (!belongsToCustomer) {
                        throw new RuntimeException("Unauthorized: This item does not belong to your cart.");
                }

                // Quantity güncelleme
                int quantity = item.getQuantity();
                String operation = request.getOperation();

                if ("+".equals(operation)) {
                        item.setQuantity(quantity + 1);
                        cartItemRepository.save(item);
                } else if ("-".equals(operation)) {
                        if (quantity > 1) {
                                item.setQuantity(quantity - 1);
                                cartItemRepository.save(item);
                        }
                } else {
                        throw new RuntimeException("Invalid operation: must be '+' or '-'.");
                }
        }

        @Override
        @Transactional
        public void updateCartGroupNote(CartGroupNoteRequest request,Long groupId, String email) {

                Customer customer = customerRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Customer not found"));

                CartGroup cartGroup = cartGroupRepository.findById(groupId)
                        .orElseThrow(() -> new RuntimeException("Cart Group not found"));

                if (!cartGroup.getCart().getCustomer().getId().equals(customer.getId())) {
                        throw new RuntimeException("Unauthorized: This cart does not belong to your cart.");
                }

                cartGroup.setNote(request.getNote());
                cartGroupRepository.save(cartGroup);


        }

}