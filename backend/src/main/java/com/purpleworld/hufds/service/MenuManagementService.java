package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.CategoryRequest;
import com.purpleworld.hufds.dto.request.MenuItemAvailabilityRequest;
import com.purpleworld.hufds.dto.request.MenuItemRequest;
import com.purpleworld.hufds.dto.request.RemovableElementRequest;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface MenuManagementService {
    ResponseEntity<?> getRestaurantMenu(String email, String search, Pageable pageable);
    ResponseEntity<?> createCategory(CategoryRequest request, String email);
    ResponseEntity<?> deleteCategory(Long categoryId, String email);
    ResponseEntity<?> addMenuItemToCategory(Long categoryId, MenuItemRequest request, String email);
    ResponseEntity<?> updateMenuItem(Long itemId, MenuItemRequest request, String email);
    ResponseEntity<?> deleteMenuItem(Long itemId, String email);
    ResponseEntity<?> deleteRemovableElement(Long itemId, String email);
    ResponseEntity<?> addRemovableElement(Long itemId, RemovableElementRequest request, String email);
    ResponseEntity<?> updateMenuItemAvailability(Long itemId, MenuItemAvailabilityRequest request, String email);
}