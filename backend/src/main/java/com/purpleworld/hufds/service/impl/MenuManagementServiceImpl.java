package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.request.CategoryRequest;
import com.purpleworld.hufds.dto.request.MenuItemRequest;
import com.purpleworld.hufds.dto.request.RemovableElementRequest;
import com.purpleworld.hufds.dto.response.CategoryResponse;
import com.purpleworld.hufds.dto.response.MenuItemResponse;
import com.purpleworld.hufds.dto.response.MenuResponse;
import com.purpleworld.hufds.dto.response.RemovableElementResponse;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.MenuManagementService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MenuManagementServiceImpl implements MenuManagementService {

    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RemovableElementRepository removableElementRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    @Transactional
    public ResponseEntity<?> getRestaurantMenu (@AuthenticationPrincipal String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Restaurant restaurant = restaurantOpt.get();
        Optional<Menu> menu = menuRepository.findByRestaurant(restaurant);
        if (menu.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found");
        }


        List<CategoryResponse> categoryResponses = new ArrayList<>();

        for (Category category : menu.get().getCategories()) {
            String categoryName = category.getName();
            Long categoryId = category.getId();

            List<MenuItemResponse> itemResponses = new ArrayList<>();

            for (MenuItem item : category.getMenuItems()) {

                List<RemovableElementResponse> removableElementsResponses = new ArrayList<>();
                for (RemovableElement removableElement : item.getRemovableElements()){
                    removableElementsResponses.add(new RemovableElementResponse(removableElement.getId(),
                            removableElement.getName()));
                }
                itemResponses.add(new MenuItemResponse(
                        item.getId(),
                        item.getName(),
                        item.getPrice(),
                        item.getDescription(),
                        item.getImg(),
                        removableElementsResponses
                ));
            }

            categoryResponses.add(new CategoryResponse(
                    categoryId,
                    categoryName,
                    itemResponses
            ));
        }

        MenuResponse response = new MenuResponse(
                menu.get().getId(),
                menu.get().getRestaurant().getRestaurantName(),
                categoryResponses
        );

        return ResponseEntity.ok(response);
    }

    @Override
    @Transactional
    public ResponseEntity<?> createCategory(CategoryRequest request, String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<Menu> menuOpt = menuRepository.findByRestaurant(restaurantOpt.get());
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found");
        }

        Menu menu = menuOpt.get();

        Category category = new Category();
        category.setName(request.getName());
        category.setMenu(menu);

        categoryRepository.save(category);

        return ResponseEntity.status(HttpStatus.CREATED).body("Category created successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteCategory(Long categoryId, String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
        }

        Category category = categoryOpt.get();
        categoryRepository.delete(category);

        return ResponseEntity.ok("Category deleted successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> addMenuItemToCategory(@PathVariable Long categoryId,
                                                   @RequestBody MenuItemRequest request,
                                                   @AuthenticationPrincipal String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
        }

        Category category = categoryOpt.get();

        MenuItem menuItem = new MenuItem();
        menuItem.setName(request.getName());
        menuItem.setPrice(request.getPrice());
        menuItem.setDescription(request.getDescription());
        menuItem.setImg(request.getImg());
        menuItem.setCategory(category);
        menuItem.setIsAvailable(true);

        if (request.getRemovableElements() != null && !request.getRemovableElements().equals("")) {
            for (String element : request.getRemovableElements().split(",")) {
                RemovableElement removableElement = new RemovableElement();
                removableElement.setName(element);
                removableElement.setMenuItem(menuItem);
                removableElementRepository.save(removableElement);
            }
        }

        menuItemRepository.save(menuItem);

        return ResponseEntity.status(HttpStatus.CREATED).body("Menu item created successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateMenuItem(Long itemId, MenuItemRequest request, String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<MenuItem> itemOpt = menuItemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        MenuItem menuItem = itemOpt.get();

        menuItem.setName(request.getName());
        menuItem.setPrice(request.getPrice());
        menuItem.setDescription(request.getDescription());
        menuItem.setImg(request.getImg());

        menuItemRepository.save(menuItem);

        return ResponseEntity.ok("Menu item updated successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteMenuItem(Long itemId, String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<MenuItem> itemOpt = menuItemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        MenuItem menuItem = itemOpt.get();

        menuItemRepository.delete(menuItem);

        return ResponseEntity.ok("Menu item deleted successfully.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteRemovableElement(@PathVariable Long removableElementId,
                                                    @AuthenticationPrincipal String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<RemovableElement> removableElementOpt = removableElementRepository.findById(removableElementId);
        if (removableElementOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Removable element not found");
        }

        RemovableElement removableElement = removableElementOpt.get();
        removableElementRepository.delete(removableElement);

        return ResponseEntity.ok("Removable element deleted successfully.");

    }

    @Override
    @Transactional
    public ResponseEntity<?> addRemovableElement(@PathVariable Long itemId,
                                                 @RequestBody RemovableElementRequest request,
                                                 @AuthenticationPrincipal String email) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByEmail(email);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(itemId);
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        MenuItem menuItem = menuItemOpt.get();

        RemovableElement removableElement = new RemovableElement();
        removableElement.setName(request.getName());
        removableElement.setMenuItem(menuItem);
        removableElementRepository.save(removableElement);

        return ResponseEntity.status(HttpStatus.CREATED).body("Removable element added successfully");
    }
}