package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.CategoryRequest;
import com.purpleworld.hufds.dto.request.MenuItemRequest;
import com.purpleworld.hufds.dto.response.MenuItemResponse;
import com.purpleworld.hufds.entity.Category;
import com.purpleworld.hufds.entity.Menu;
import com.purpleworld.hufds.entity.MenuItem;
import com.purpleworld.hufds.entity.Restaurant;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.MenuManagementService;
import com.purpleworld.hufds.service.impl.MenuManagementServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping
    public ResponseEntity<?> getRestaurantMenu (@AuthenticationPrincipal Long restaurantId) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurant not found");
        }

        Restaurant restaurant = restaurantOpt.get();
        Optional<Menu> menu = menuRepository.findByRestaurant(restaurant);
        if (menu.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found");
        }

        return ResponseEntity.ok(menuManagementService.getMenuWithItemsByCategory(menu.get().getId()));
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

    // Create new menu item.
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

        menuItemRepository.save(menuItem);

        return ResponseEntity.status(HttpStatus.CREATED).body(new MenuItemResponse(menuItem));
    }

    // Update existing menu item.
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

        return ResponseEntity.ok(new MenuItemResponse(menuItem));
    }


    // Delete menu item.
}
