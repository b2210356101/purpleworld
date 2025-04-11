package com.purpleworld.hufds.service.impl;

import com.purpleworld.hufds.dto.response.MenuItemResponse;
import com.purpleworld.hufds.repository.*;
import com.purpleworld.hufds.service.MenuManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuManagementServiceImpl implements MenuManagementService {
    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RemovableElementRepository removableElementRepository;

    @Override
    public List<MenuItemResponse> getMenuWithItemsByCategory(Long menuId) {
        return null;
    }
}
