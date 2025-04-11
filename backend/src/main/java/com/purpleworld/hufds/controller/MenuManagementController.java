package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.CategoryRequest;
import com.purpleworld.hufds.dto.request.MenuItemRequest;
import com.purpleworld.hufds.dto.response.CategoryResponse;
import com.purpleworld.hufds.dto.response.MenuItemResponse;
import com.purpleworld.hufds.dto.response.MenuResponse;
import com.purpleworld.hufds.dto.response.RemovableElementResponse;
import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.impl.MenuManagementServiceImpl;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/menu")
@PreAuthorize("hasRole('RESTAURANT')")

public class MenuManagementController {
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RemovableElementRepository removableElementRepository;
    private final RestaurantRepository restaurantRepository;
    private MenuManagementServiceImpl menuManagementService;

    @Autowired
    public MenuManagementController(MenuRepository menuRepository, CategoryRepository categoryRepository, MenuItemRepository menuItemRepository, RemovableElementRepository removableElementRepository, RestaurantRepository restaurantRepository, MenuManagementServiceImpl menuManagementService) {
        this.menuRepository = menuRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.removableElementRepository = removableElementRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuManagementService = menuManagementService;
    }

    // Get restaurant menu.
    @Transactional
    @GetMapping
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


    // Create new category.
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request,
                                            @AuthenticationPrincipal String email) {
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


    // Update an existing category.

    // Delete a category.
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId,
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

        categoryRepository.delete(category);

        return ResponseEntity.ok("Category deleted successfully.");
    }


    // Create new menu item.
    @Transactional
    @PostMapping("/categories/{categoryId}/items")
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

        List<RemovableElementResponse> removableElementResponses = null;

        if (request.getRemovableElements() != null) {
            removableElementResponses = new ArrayList<>();
            List<RemovableElement> savedElements = new ArrayList<>();

            for (RemovableElement element : request.getRemovableElements()) {
                element.setMenuItem(menuItem);
                RemovableElement savedElement = removableElementRepository.save(element);
                removableElementResponses.add(new RemovableElementResponse(savedElement.getId(), savedElement.getName()));
                savedElements.add(savedElement);
            }

            menuItem.setRemovableElements(savedElements);
        }


        menuItemRepository.save(menuItem);

        return ResponseEntity.status(HttpStatus.CREATED).body(new MenuItemResponse(menuItem, removableElementResponses));
    }

    // Update existing menu item.
    @Transactional
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long itemId,
                                            @RequestBody MenuItemRequest request,
                                            @AuthenticationPrincipal String email) {
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

        return ResponseEntity.ok(new MenuItemResponse(menuItem,null));
    }


    // Delete menu item.
    @Transactional
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long itemId,
                                            @AuthenticationPrincipal String email) {
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

    @Transactional
    @DeleteMapping("/removable-elements/{removableElementId}")
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
}
