package com.purpleworld.hufds.controller;

import com.purpleworld.hufds.dto.request.CategoryRequest;
import com.purpleworld.hufds.dto.request.MenuItemAvailabilityRequest;
import com.purpleworld.hufds.dto.request.MenuItemRequest;
import com.purpleworld.hufds.dto.request.RemovableElementRequest;
import com.purpleworld.hufds.service.impl.MenuManagementServiceImpl;
import jakarta.transaction.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/restaurant/menu")
public class MenuManagementController {

    private final MenuManagementServiceImpl menuManagementService;

    public MenuManagementController(MenuManagementServiceImpl menuManagementService) {
        this.menuManagementService = menuManagementService;
    }

    @GetMapping
    public ResponseEntity<?> getRestaurantMenu(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? 
                                      Sort.Direction.DESC : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        return menuManagementService.getRestaurantMenu(email, search, pageable);
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request,
                                            @AuthenticationPrincipal String email) {
        return menuManagementService.createCategory(request, email);
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId,
                                            @AuthenticationPrincipal String email) {
        return menuManagementService.deleteCategory(categoryId, email);
    }

    @PostMapping("/categories/{categoryId}/items")
    public ResponseEntity<?> addMenuItemToCategory(@PathVariable Long categoryId,
                                                   @RequestBody MenuItemRequest request,
                                                   @AuthenticationPrincipal String email) {
        return menuManagementService.addMenuItemToCategory(categoryId, request, email);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long itemId,
                                            @RequestBody MenuItemRequest request,
                                            @AuthenticationPrincipal String email) {
        return menuManagementService.updateMenuItem(itemId, request, email);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long itemId,
                                            @AuthenticationPrincipal String email) {
        return menuManagementService.deleteMenuItem(itemId, email);
    }

    @Transactional
    @DeleteMapping("/removable-elements/{removableElementId}")
    public ResponseEntity<?> deleteRemovableElement(@PathVariable Long removableElementId,
                                                    @AuthenticationPrincipal String email) {
        return menuManagementService.deleteRemovableElement(removableElementId, email);
    }

    @Transactional
    @PostMapping("/menu-items/{menuItemId}/removable-elements")
    public ResponseEntity<?> addRemovableElement(@PathVariable Long menuItemId,
                                                 @RequestBody RemovableElementRequest request,
                                                 @AuthenticationPrincipal String email) {
        return menuManagementService.addRemovableElement(menuItemId, request, email);
    }

    @PutMapping("/items/{itemId}/availability")
    public ResponseEntity<?> updateMenuItemAvailability(
            @PathVariable Long itemId,
            @RequestBody MenuItemAvailabilityRequest request,
            @AuthenticationPrincipal String email) {
        return menuManagementService.updateMenuItemAvailability(itemId, request, email);
    }
}