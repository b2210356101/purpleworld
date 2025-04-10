package com.purpleworld.hufds.service;

import com.purpleworld.hufds.dto.response.MenuItemResponse;

import java.util.List;

public interface MenuManagementService {
    List<MenuItemResponse> getMenuWithItemsByCategory(Long menuId);
}
