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

import java.time.LocalDate;
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
    private final CouponRepository couponRepository;

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
                        cart.getCartGroups().add(newGroup);
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
                cartGroup.getCartItems().add(ci);
                return ci;
        });

        // 5) Update quantity
        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());

        // 6) Handle removable elements
        List<RemovableElement> removableElements = new ArrayList<>();
        cartItem.getRemovableElements().clear();

        if (request.getRemovableElements() != null && !request.getRemovableElements().isEmpty()) {
            for (RemovableElementDTO dto : request.getRemovableElements()) {
                Optional<RemovableElement> elementOpt = removableElementRepository.findById(dto.getId());
                if (elementOpt.isPresent()) {
                    RemovableElement element = elementOpt.get();
                    removableElements.add(element);
                    cartItem.getRemovableElements().add(element);
                }
            }
        }

        // 7) Persist the CartItem
        cartItemRepository.save(cartItem);
        checkCouponValidity(cart);

                System.out.println("Cart Groups: " + cart.getCartGroups().size());
                for (CartGroup group : cart.getCartGroups()) {
                        System.out.println("Group ID: " + group.getId() + " | Items count: " + (group.getCartItems() != null ? group.getCartItems().size() : 0));
                }
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
                removableDTOs);
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
                .compareToIgnoreCase(b.getRestaurant().getRestaurantName()));

        List<Integer> groupTotals = new ArrayList<>();
        for (CartGroup group : sortedGroups) {
            int groupTotal = 0;
            for (CartItem item : group.getCartItems()) {
                int quantity = item.getQuantity();
                int price = item.getMenuItem().getPrice();
                groupTotal += quantity * price;
            }
            groupTotals.add(groupTotal);
            cartTotal += groupTotal;
        }

        double discount = 0;
        Coupon coupon = cart.getCoupon();

        if (coupon != null && coupon.isActive() && !coupon.getExpiryDate().isBefore(LocalDate.now())) {
            if (coupon.isPercent()) {
                discount = (double) (cartTotal * coupon.getDiscountAmount()) / 100;
            } else {
                discount = Math.min(coupon.getDiscountAmount(), cartTotal);
            }
        }

        for (int i = 0; i < sortedGroups.size(); i++) {
            CartGroup group = sortedGroups.get(i);
            Restaurant restaurant = group.getRestaurant();

            List<CartItem> sortedItems = new ArrayList<>(group.getCartItems());
            sortedItems.sort((a, b) -> a.getMenuItem().getName()
                    .compareToIgnoreCase(b.getMenuItem().getName()));

            List<CartItemResponse> itemResponses = new ArrayList<>();
            for (CartItem item : sortedItems) {
                MenuItem menuItem = item.getMenuItem();
                int quantity = item.getQuantity();
                int price = menuItem.getPrice();
                totalQuantity += quantity;

                // Convert removable elements to DTOs
                List<RemovableElementDTO> removableDTOs = item.getRemovableElements().stream()
                        .map(re -> new RemovableElementDTO(re.getId(), re.getName()))
                        .collect(Collectors.toList());

                itemResponses.add(new CartItemResponse(
                        item.getId(),
                        menuItem.getName(),
                        price,
                        quantity,
                        menuItem.getImg(),
                        removableDTOs));
            }

            int groupTotal = groupTotals.get(i);

            int groupDiscount = 0;
            if (cartTotal > 0 && discount > 0) {
                double share = (double) groupTotal / cartTotal;
                groupDiscount = (int) Math.round(discount * share);
            }

            int afterDiscount = groupTotal - groupDiscount;

            groupResponses.add(new CartGroupResponse(
                    restaurant.getId(),
                    restaurant.getRestaurantName(),
                    group.getNote(),
                    group.getId(),
                    itemResponses,
                    restaurant.getMinOrderAmount(),
                    groupDiscount,
                    afterDiscount
            ));
        }

        double finalTotal = cartTotal - discount;

        return new ViewCartResponse(
                cart.getId(),
                totalQuantity,
                cartTotal,
                groupResponses.size(),
                groupResponses,
                coupon != null ? coupon.getCode() : null,
                discount != 0 ? discount : null,
                coupon != null ? coupon.isPercent() : null,
                finalTotal
        );
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
                checkCouponValidity(cart);

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
                        checkCouponValidity(cart);
                } else if ("-".equals(operation)) {
                        if (quantity > 1) {
                                item.setQuantity(quantity - 1);
                                cartItemRepository.save(item);
                                checkCouponValidity(cart);
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

        @Override
        @Transactional
        public List<CartAmountResponse> checkCartAmount(String email) {

                Customer customer = customerRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Customer not found"));

                Optional<Cart> cart = cartRepository.findByCustomerId(customer.getId());

                List<CartAmountResponse> responses = new ArrayList<>();
                if (!cart.isPresent()) {
                        throw new RuntimeException("Cart not found");
                }
                for (CartGroup cartGroup : cart.get().getCartGroups()) {
                        int total = 0;
                        for (CartItem cartItem : cartGroup.getCartItems()) {
                                total += cartItem.getMenuItem().getPrice() * cartItem.getQuantity();
                                System.out.println(total);
                        }

                        if (total < cartGroup.getRestaurant().getMinOrderAmount()){
                                CartAmountResponse cartAmountResponse = new CartAmountResponse();
                                cartAmountResponse.setRestaurantId(cartGroup.getRestaurant().getId());
                                cartAmountResponse.setRestAmount(cartGroup.getRestaurant().getMinOrderAmount()-total);
                                responses.add(cartAmountResponse);
                        }
                }
                return responses;
        }


    private Coupon validateCoupon(String code) {
        return couponRepository.findByCode(code)
                .filter(Coupon::isActive)
                .filter(c -> !c.getExpiryDate().isBefore(LocalDate.now()))
                .orElseThrow(() -> new RuntimeException("Coupon is invalid or expired."));
    }


    @Override
    @Transactional
    public CouponResponse applyCouponToCart(String email, String code) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Coupon coupon = validateCoupon(code);

        int total = cart.getCartGroups().stream()
                .flatMap(g -> g.getCartItems().stream())
                .mapToInt(ci -> ci.getQuantity() * ci.getMenuItem().getPrice())
                .sum();

        if (total < coupon.getMinOrderPrice()) {
            throw new RuntimeException("Minimum order price not satisfied for coupon.");
        }

        cart.setCoupon(coupon);
        cartRepository.save(cart);

        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.isPercent(),
                coupon.getDiscountAmount(),
                coupon.getMinOrderPrice(),
                coupon.getExpiryDate(),
                coupon.isActive()
        );
    }

    private void checkCouponValidity(Cart cart) {
        if (cart.getCoupon() == null) return;

        Coupon coupon = cart.getCoupon();

        int total = cart.getCartGroups().stream()
                .flatMap(g -> g.getCartItems().stream())
                .mapToInt(ci -> ci.getQuantity() * ci.getMenuItem().getPrice())
                .sum();

        if (!coupon.isActive() || coupon.getExpiryDate().isBefore(LocalDate.now()) || total < coupon.getMinOrderPrice()) {
            cart.setCoupon(null);
            cartRepository.save(cart);
        }
    }

    @Override
    @Transactional
    public CartSummaryResponse getCartSummary(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        int cartTotal = cart.getCartGroups().stream()
                .flatMap(g -> g.getCartItems().stream())
                .mapToInt(ci -> ci.getQuantity() * ci.getMenuItem().getPrice())
                .sum();

        double discount = 0;
        Coupon coupon = cart.getCoupon();

        if (coupon != null && coupon.isActive() && !coupon.getExpiryDate().isBefore(LocalDate.now())) {
            if (coupon.isPercent()) {
                discount = (double) (cartTotal * coupon.getDiscountAmount()) / 100;
            } else {
                discount = Math.min(coupon.getDiscountAmount(), cartTotal);
            }
        }

        double finalTotal = cartTotal - discount;

        return new CartSummaryResponse(
                cartTotal,
                discount,
                finalTotal,
                coupon != null ? coupon.getCode() : null,
                coupon != null ? coupon.isPercent() : null
        );
    }
}