package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.OrderItemDTO;
import com.purpleworld.hufds.dto.OrderGroupDTO;
import com.purpleworld.hufds.dto.RestaurantStatsDTO;
import com.purpleworld.hufds.dto.ReviewDTO;
import com.purpleworld.hufds.entity.Address;
import com.purpleworld.hufds.entity.OrderGroup;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.entity.Review;
import com.purpleworld.hufds.repository.AddressRepository;
import com.purpleworld.hufds.repository.OrderGroupRepository;
import com.purpleworld.hufds.repository.RestaurantRepository;
import com.purpleworld.hufds.repository.ReviewRepository;
import com.purpleworld.hufds.service.RestaurantOrderService;
import com.purpleworld.hufds.service.TrackingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantOrderServiceImpl implements RestaurantOrderService {

    private final RestaurantRepository restaurantRepository;
    private final OrderGroupRepository orderGroupRepository;
    private final AddressRepository addressRepository;
    private final TrackingService trackingService;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public List<OrderGroupDTO> getOrdersForRestaurant(String email) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        List<OrderGroup> orderGroups = orderGroupRepository.findByRestaurantId(restaurant.getId());

        return orderGroups.stream()
                .sorted(Comparator.comparing(
                        (OrderGroup group) -> group.getOrder().getOrderedDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed()) // DESCENDING
                .map(group -> {
                    OrderGroupDTO dto = new OrderGroupDTO();
                    dto.setOrderGroupId(group.getId());
                    dto.setRestaurantName(group.getRestaurant().getRestaurantName());
                    dto.setRestaurantTotal(group.getRestaurantTotal());
                    dto.setNote(group.getNote());
                    dto.setStatus(group.getStatus());

                    // OrderedDate now pulled from related Order entity
                    dto.setOrderedDate(group.getOrder().getOrderedDate());

                    dto.setPreperationDate(group.getPreperationDate());
                    dto.setTakenOverDate(group.getTakenOverDate());
                    dto.setDeliveredDate(group.getDeliveredDate());
                    dto.setRejectionDate(group.getRejectionDate());

                    dto.setCustomerId(group.getOrder().getCustomer().getId());
                    dto.setCustomerName(group.getOrder().getCustomer().getFirstName() + " " +
                            group.getOrder().getCustomer().getLastName());

                    dto.setOrderItems(
                            group.getOrderItems().stream().map(item -> new OrderItemDTO(
                                            item.getMenuItem().getName(),
                                            item.getMenuItemId(),
                                            item.getQuantity(),
                                            item.getPrice(),
                                            item.getRemovables()))
                                    .collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<OrderGroupDTO> getActiveOrdersForRestaurant(String email) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        List<OrderGroup> orderGroups = orderGroupRepository.findByRestaurantId(restaurant.getId());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24Hours = now.minusHours(72);

        return orderGroups.stream()
                .filter(group -> {
                    LocalDateTime orderedDate = group.getOrder().getOrderedDate();
                    String status = group.getStatus();
                    return orderedDate != null &&
                            orderedDate.isAfter(last24Hours) &&
                            !status.equals("REJECTED") &&
                            !status.equals("DELIVERED");
                })
                .sorted(Comparator.comparing(
                        (OrderGroup group) -> group.getOrder().getOrderedDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(group -> {
                    OrderGroupDTO dto = new OrderGroupDTO();
                    dto.setOrderGroupId(group.getId());
                    dto.setRestaurantName(group.getRestaurant().getRestaurantName());
                    dto.setRestaurantTotal(group.getRestaurantTotal());
                    dto.setNote(group.getNote());
                    dto.setStatus(group.getStatus());
                    dto.setOrderedDate(group.getOrder().getOrderedDate());
                    dto.setPreperationDate(group.getPreperationDate());
                    dto.setTakenOverDate(group.getTakenOverDate());
                    dto.setDeliveredDate(group.getDeliveredDate());
                    dto.setRejectionDate(group.getRejectionDate());
                    dto.setCustomerId(group.getOrder().getCustomer().getId());
                    dto.setCustomerName(group.getOrder().getCustomer().getFirstName() + " " +
                            group.getOrder().getCustomer().getLastName());
                    dto.setOrderItems(
                            group.getOrderItems().stream().map(item -> new OrderItemDTO(
                                            item.getMenuItem().getName(),
                                            item.getMenuItemId(),
                                            item.getQuantity(),
                                            item.getPrice(),
                                            item.getRemovables()))
                                    .collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void acceptOrder(String email, Long orderGroupId) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        OrderGroup orderGroup = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Order group not found"));

        if (!orderGroup.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("Unauthorized to manage this order");
        }

        orderGroup.setPreperationDate(LocalDateTime.now());
        orderGroupRepository.save(orderGroup);
    }

    @Transactional
    @Override
    public void rejectOrder(String email, Long orderGroupId) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        OrderGroup orderGroup = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Order group not found"));

        if (!orderGroup.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("Unauthorized to manage this order");
        }

        // Set rejection date instead of deleting the order
        orderGroup.setRejectionDate(LocalDateTime.now());

        // Save the updated orderGroup
        orderGroupRepository.save(orderGroup);
    }

    @Transactional
    @Override
    public void markOrderAsPrepared(String email, Long orderGroupId) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        OrderGroup orderGroup = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Order group not found"));

        if (!orderGroup.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("Unauthorized to manage this order");
        }

        orderGroup.setPreparedDate(LocalDateTime.now());
        orderGroupRepository.save(orderGroup);
    }

    @Override
    public List<RestaurantStatsDTO> getStatsForRestaurant(String email) {

        Restaurant restaurant = restaurantRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        Long restaurantId = restaurant.getId();

        List<OrderGroup> groups = orderGroupRepository.findByRestaurantId(restaurantId);

        long total       = groups.size();
        long delivered   = groups.stream()
                .filter(g -> g.getDeliveredDate() != null)
                .count();
        long cancelled   = groups.stream()
                .filter(g -> g.getCancelledDate() != null
                        || g.getRejectionDate() != null)
                .count();
        long revenue     = groups.stream()
                .filter(g -> g.getDeliveredDate() != null)
                .mapToLong(OrderGroup::getRestaurantTotal)
                .sum();

        return List.of(
                new RestaurantStatsDTO("Total Orders", total),
                new RestaurantStatsDTO("Total Delivered", delivered),
                new RestaurantStatsDTO("Total Cancelled", cancelled),
                new RestaurantStatsDTO("Total Revenue", revenue)
        );
    }

    @Override
    @Transactional
    public void replyToReview(String email, Long orderGroupId, String reply) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        OrderGroup orderGroup = orderGroupRepository.findById(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Order group not found"));

        if (!orderGroup.getRestaurant().getId().equals(restaurant.getId())) {
            throw new RuntimeException("Unauthorized to reply to this review");
        }

        Review review = reviewRepository.findByOrderGroupId(orderGroupId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRestaurantReply(reply);
        reviewRepository.save(review);
    }


@Override
@Transactional
public List<ReviewDTO> getReviewsForRestaurant(String email) {
    Restaurant restaurant = restaurantRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Restaurant not found"));

    List<OrderGroup> orderGroups = orderGroupRepository.findByRestaurantId(restaurant.getId());

    List<Long> orderGroupIds = orderGroups.stream()
        .map(OrderGroup::getId)
        .collect(Collectors.toList());

    List<Review> reviews = orderGroupIds.stream()
        .map(reviewRepository::findByOrderGroupId)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(Collectors.toList());

    return reviews.stream()
        .map(review -> {
            // Get order items for this review's order group
            OrderGroup orderGroup = review.getOrderGroup();
            
            // Map order items to DTOs
            List<OrderItemDTO> orderItemDTOs = orderGroup.getOrderItems().stream()
                    .map(item -> new OrderItemDTO(
                            item.getMenuItem().getName(),
                            item.getMenuItemId(),
                            item.getQuantity(),
                            item.getPrice(),
                            item.getRemovables()))
                    .collect(Collectors.toList());
            
            // Create ReviewDTO with order items
            ReviewDTO dto = new ReviewDTO(
                    review.getTasteRating(),
                    review.getDeliveryRating(),
                    review.getServiceRating(),
                    review.getReview(),
                    review.getRestaurantReply(),
                    review.getUserName(),
                    review.getUserAvatar(),
                    review.getReviewDate(),
                    review.getOrderGroup().getId()
            );
            
            // Set order items
            dto.setOrderItems(orderItemDTOs);
            
            return dto;
        })
        .collect(Collectors.toList());
}

}