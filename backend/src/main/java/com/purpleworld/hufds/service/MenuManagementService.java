package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.request.CategoryRequest;
import com.purpleworld.hufds.dto.request.MenuItemRequest;
import org.springframework.http.ResponseEntity;

public interface MenuManagementService {
    ResponseEntity<?> getRestaurantMenu(String email);
    ResponseEntity<?> createCategory(CategoryRequest request, String email);
    ResponseEntity<?> deleteCategory(Long categoryId, String email);
    ResponseEntity<?> addMenuItemToCategory(Long categoryId, MenuItemRequest request, String email);
    ResponseEntity<?> updateMenuItem(Long itemId, MenuItemRequest request, String email);
    ResponseEntity<?> deleteMenuItem(Long itemId, String email);
    ResponseEntity<?> deleteRemovableElement(Long itemId, String email);

}