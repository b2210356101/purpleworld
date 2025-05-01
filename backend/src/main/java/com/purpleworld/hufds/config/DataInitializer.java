package com.purpleworld.hufds.config;

import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * DataInitializer class to populate the database with initial data
 * Used for development and testing purposes
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final CourierRepository courierRepository;
    private final AddressRepository addressRepository;
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RemovableElementRepository removableElementRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();
    private final CartRepository cartRepository;

    @Override
    public void run(String... args) {
        // Only run initialization if database is empty
        if (adminRepository.count() == 0) {
            initializeAdmin();
            initializeCustomers();
            initializeRestaurants();
            initializeCouriers();
            initializeAddresses();
            initializeMenus();
        }
    }

    /**
     * Initialize admin user
     */
    private void initializeAdmin() {
        Admin admin = new Admin();
        admin.setFirstName("Admin");
        admin.setLastName("Admin");
        admin.setEmail("admin@hufds.com");
        admin.setPhoneNumber("5553453211");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        adminRepository.save(admin);

        System.out.println("Admin user initialized");
    }

    /**
     * Initialize sample customers
     */

    private void initializeCustomers() {
        Customer customer = new Customer();
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("user@example.com");
        customer.setPhoneNumber("5551234567");
        customer.setPassword(passwordEncoder.encode("password123"));
        customer.setBanned(false);
        customer.setRole(Role.CUSTOMER);
        Cart cart = new Cart();
        cart.setCustomer(customer);
        cartRepository.save(cart);
        customer.setProfileImg("https://picsum.photos/200/200?random=" + random.nextInt(1000));

        customerRepository.save(customer);
        System.out.println("Customer data initialized.");
    }

    /**
     * Initialize sample restaurants
     */
    @Transactional
    protected void initializeRestaurants() {
        List<Restaurant> restaurants = new ArrayList<>();

        // Sample restaurant data - name, email, phone, manager first name, manager last
        // name, tax ID, min order amount, max delivery distance
        String[][] restaurantData = {
                { "Pizza Palace", "restaurant@example.com", "5551112222", "Mark", "Johnson", "1234567890", "20",
                        "10", "https://i.hizliresim.com/muzn8ec.jpeg" },
                { "Burger Baron", "restaurant2@example.com", "5552223333", "Sarah", "Williams", "2345678901", "15",
                        "8", "https://i.hizliresim.com/2nqkwu4.jpeg" },
                { "Sushi Supreme", "restaurant3@example.com", "5553334444", "Ken", "Tanaka", "3456789012", "25",
                        "7", "https://i.hizliresim.com/9miem65.jpeg" }
        };

        for (String[] data : restaurantData) {
            Restaurant restaurant = new Restaurant();
            restaurant.setRestaurantName(data[0]);
            restaurant.setEmail(data[1]);
            restaurant.setPhoneNumber(data[2]);
            restaurant.setManagerFirstName(data[3]);
            restaurant.setManagerLastName(data[4]);
            restaurant.setTaxId(data[5]);
            restaurant.setMinOrderAmount(Integer.parseInt(data[6]));
            restaurant.setMaxDeliveryDistance(Integer.parseInt(data[7]));
            restaurant.setPassword(passwordEncoder.encode("restaurant123"));
            restaurant.setStatus(AccountStatus.APPROVED); // All initialized restaurants are approved
            restaurant.setRole(Role.RESTAURANT);

            Menu menu = new Menu();
            menu.setRestaurant(restaurant);

            restaurant.setProfileImg(data[8]);
            restaurantRepository.save(restaurant);

            menuRepository.save(menu);
        }

        // Add one pending restaurant
        Restaurant pendingRestaurant = new Restaurant();
        pendingRestaurant.setRestaurantName("Thai Delight");
        pendingRestaurant.setEmail("restaurant4@example.com");
        pendingRestaurant.setPhoneNumber("5557778888");
        pendingRestaurant.setManagerFirstName("Somchai");
        pendingRestaurant.setManagerLastName("Suk");
        pendingRestaurant.setTaxId("6789012345");
        pendingRestaurant.setMinOrderAmount(22);
        pendingRestaurant.setMaxDeliveryDistance(8);
        pendingRestaurant.setPassword(passwordEncoder.encode("restaurant123"));
        pendingRestaurant.setStatus(AccountStatus.PENDING);
        pendingRestaurant.setRole(Role.RESTAURANT);
        pendingRestaurant.setProfileImg("https://i.hizliresim.com/amyprkk.jpeg");
        Menu menu = new Menu();
        menu.setRestaurant(pendingRestaurant);
        restaurantRepository.save(pendingRestaurant);

        menuRepository.save(menu);

        System.out.println("Restaurant data initialized: " + restaurants.size() + " restaurants");
    }

    /**
     * Initialize sample couriers
     */
    private void initializeCouriers() {
        List<Courier> couriers = new ArrayList<>();

        // Sample courier data - first name, last name, SSN, email, phone
        String[][] courierData = {
                { "David", "Rodriguez", "12345678901", "courier@example.com", "5551234567" },
                { "Sophie", "Lee", "23456789012", "courier2@example.com", "5552345678" },
                { "Priya", "Patel", "45678901234", "courier3@example.com", "5554567890" }
        };

        for (String[] data : courierData) {
            Courier courier = new Courier();
            courier.setFirstName(data[0]);
            courier.setLastName(data[1]);
            courier.setSsn(data[2]);
            courier.setEmail(data[3]);
            courier.setPhoneNumber(data[4]);
            courier.setPassword(passwordEncoder.encode("courier123"));
            courier.setAvailable(false);
            courier.setStatus(AccountStatus.APPROVED);
            courier.setRole(Role.COURIER);
            couriers.add(courier);
        }

        courierRepository.saveAll(couriers);
        System.out.println("Courier data initialized: " + couriers.size() + " couriers");
    }

    /**
     * Initialize sample addresses near Hacettepe Beytepe Campus
     * FIX: Updated to ensure customer addresses are properly linked
     */
    @Transactional
    private void initializeAddresses() {
        // First clear all existing addresses to avoid conflicts
        addressRepository.deleteAll();

        // Get all customers and restaurants for reference
        List<Customer> customers = customerRepository.findAll();
        List<Restaurant> restaurants = restaurantRepository.findAll();

        // Hacettepe Beytepe Campus coordinates (center of campus)
        double campusLat = 39.867;
        double campusLng = 32.734;

        // Create customer addresses (2 addresses per customer)
        for (Customer customer : customers) {
            List<Address> customerAddresses = new ArrayList<>();

            for (int i = 0; i < 2; i++) {
                Address address = new Address();
                address.setCustomer(customer);
                address.setName(i == 0 ? "Home" : "Work");
                address.setCity("Ankara");
                address.setDistrict(getRandomDistrict());
                address.setNeighborhood(getRandomNeighborhood());
                address.setStreet(getRandomStreet());
                address.setBuildingNumber(String.valueOf(random.nextInt(100) + 1));
                address.setApartmentNumber(String.valueOf(random.nextInt(20) + 1));
                address.setFloor(String.valueOf(random.nextInt(10) + 1));
                address.setPostalCode(String.valueOf(random.nextInt(90000) + 10000));
                address.setPhoneNumber(customer.getPhoneNumber());
                address.setDeliveryNote(i == 0 ? "Ring the bell twice" : "Call when at building entrance");

                // Generate coordinates around Hacettepe Beytepe Campus (within ~6km)
                address.setLatitude(campusLat + ((random.nextDouble() - 0.5) * 0.06));
                address.setLongitude(campusLng + ((random.nextDouble() - 0.5) * 0.06));

                address.setFullAddress(String.format("%s, %s Mah. %s Sok. No: %s D: %s Kat: %s, %s/%s",
                        address.getName(), address.getNeighborhood(), address.getStreet(),
                        address.getBuildingNumber(), address.getApartmentNumber(),
                        address.getFloor(), address.getDistrict(), address.getCity()));

                address = addressRepository.save(address);
                customerAddresses.add(address);

                if (!customerAddresses.isEmpty()) {
                    try {
                        customer.setCurrentAddressId(customerAddresses.get(0).getId());
                        customerRepository.save(customer);
                        System.out.println("Set current address ID: " + customerAddresses.get(0).getId()
                                + " for customer: " + customer.getId());
                    } catch (Exception e) {
                        System.err.println("Error setting current address for customer ID " + customer.getId() + ": "
                                + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }

            if (!customerAddresses.isEmpty()) {
                customer.setCurrentAddressId(customerAddresses.get(0).getId());
                customerRepository.save(customer);
            }
        }

        // Create restaurant addresses
        for (Restaurant restaurant : restaurants) {
            Address address = new Address();
            address.setRestaurant(restaurant);
            address.setName(restaurant.getRestaurantName());
            address.setCity("Ankara");
            address.setDistrict(getRandomDistrict());
            address.setNeighborhood(getRandomNeighborhood());
            address.setStreet(getRandomStreet());
            address.setBuildingNumber(String.valueOf(random.nextInt(100) + 1));
            address.setApartmentNumber("1"); // Usually ground floor for restaurants
            address.setFloor("0");
            address.setPostalCode(String.valueOf(random.nextInt(90000) + 10000));
            address.setPhoneNumber(restaurant.getPhoneNumber());

            // Place restaurants closer to campus (within ~5km)
            address.setLatitude(campusLat + ((random.nextDouble() - 0.5) * 0.05));
            address.setLongitude(campusLng + ((random.nextDouble() - 0.5) * 0.05));

            address.setFullAddress(String.format("%s, %s Mah. %s Sok. No: %s, %s/%s",
                    address.getName(), address.getNeighborhood(), address.getStreet(),
                    address.getBuildingNumber(), address.getDistrict(), address.getCity()));

            addressRepository.save(address);
        }
    }

    /**
     * Initialize sample menus with categories, menu items, and removable elements
     */
    private void initializeMenus() {
        List<Restaurant> restaurants = restaurantRepository.findAll().stream()
                .filter(r -> r.getStatus() == AccountStatus.APPROVED)
                .toList();

        // Creating menus for each restaurant
        for (Restaurant restaurant : restaurants) {
            Optional<Menu> menu = menuRepository.findByRestaurant(restaurant);

            menu.get().setRestaurant(restaurant);

            menuRepository.save(menu.get());

            // Create categories based on restaurant type
            List<Category> categories = createCategoriesForRestaurant(restaurant, menu.get());
            categoryRepository.saveAll(categories);

            // Create menu items for each category
            for (Category category : categories) {
                List<MenuItem> menuItems = createMenuItemsForCategory(category);
                menuItemRepository.saveAll(menuItems);

                // Create removable elements for applicable menu items
                for (MenuItem menuItem : menuItems) {
                    if (shouldHaveRemovableElements(menuItem)) {
                        List<RemovableElement> removableElements = createRemovableElementsForMenuItem(menuItem);
                        removableElementRepository.saveAll(removableElements);
                    }
                }
            }
        }

        System.out.println("Menu data initialized for " + restaurants.size() + " restaurants");
    }

    /**
     * Create categories based on restaurant type
     */
    private List<Category> createCategoriesForRestaurant(Restaurant restaurant, Menu menu) {
        List<Category> categories = new ArrayList<>();
        String restaurantName = restaurant.getRestaurantName().toLowerCase();

        if (restaurantName.contains("pizza")) {
            categories.add(createCategory("Pizzas", menu));
            categories.add(createCategory("Drinks", menu));
        } else if (restaurantName.contains("burger")) {
            categories.add(createCategory("Burgers", menu));
            categories.add(createCategory("Beverages", menu));
        } else if (restaurantName.contains("sushi")) {
            categories.add(createCategory("Sushi Rolls", menu));
            categories.add(createCategory("Drinks", menu));
        } else {
            // Default categories for other restaurants
            categories.add(createCategory("Main Courses", menu));
            categories.add(createCategory("Drinks", menu));
        }

        return categories;
    }

    /**
     * Create a category with the given name
     */
    private Category createCategory(String name, Menu menu) {
        Category category = new Category();
        category.setName(name);
        category.setMenu(menu);
        return category;
    }

    /**
     * Create menu items for the given category
     */
    private List<MenuItem> createMenuItemsForCategory(Category category) {
        List<MenuItem> menuItems = new ArrayList<>();
        String categoryName = category.getName().toLowerCase();

        // Create menu items based on category with meaningful images from Pexels
        if (categoryName.contains("pizza")) {
            menuItems.add(createMenuItem(
                    "Margherita Pizza",
                    567,
                    "Classic tomato sauce, fresh mozzarella, basil",
                    category,
                    "https://i.hizliresim.com/1g58unq.jpeg"));
            menuItems.add(createMenuItem(
                    "Pepperoni Pizza",
                    548,
                    "Tomato sauce, mozzarella, pepperoni",
                    category,
                    "https://i.hizliresim.com/963i45i.jpeg"));
        } else if (categoryName.contains("burger")) {
            menuItems.add(createMenuItem(
                    "Classic Burger",
                    420,
                    "Beef patty, lettuce, tomato, onion, pickles, special sauce",
                    category,
                    "https://i.hizliresim.com/78ctx0r.jpeg"));
            menuItems.add(createMenuItem(
                    "Cheeseburger",
                    480,
                    "Beef patty, cheddar cheese, lettuce, tomato, onion, pickles",
                    category,
                    "https://i.hizliresim.com/r35aavp.jpeg"));
        } else if (categoryName.contains("sushi")) {
            menuItems.add(createMenuItem(
                    "California Roll",
                    694,
                    "Crab, avocado, cucumber",
                    category,
                    "https://i.hizliresim.com/rr77xgm.jpeg"));
            menuItems.add(createMenuItem(
                    "Spicy Tuna Roll",
                    810,
                    "Spicy tuna, cucumber, spicy mayo",
                    category,
                    "https://i.hizliresim.com/krljia8.jpeg"));
        } else if (categoryName.contains("main")) {
            menuItems.add(createMenuItem(
                    "Grilled Chicken",
                    632,
                    "Grilled chicken breast with vegetables",
                    category,
                    "https://i.hizliresim.com/e0xeu58.jpeg"));
            menuItems.add(createMenuItem(
                    "Beef Steak",
                    986,
                    "Grilled beef steak with potato",
                    category,
                    "https://i.hizliresim.com/ivr4bmj.jpeg"));
        } else if (categoryName.contains("drink") || categoryName.contains("beverage")) {
            menuItems.add(createMenuItem(
                    "Cola",
                    120,
                    "Carbonated cola beverage",
                    category,
                    "https://i.hizliresim.com/sl6x5k6.jpeg"));
            menuItems.add(createMenuItem(
                    "Lemonade",
                    180,
                    "Fresh-squeezed lemonade",
                    category,
                    "https://i.hizliresim.com/f93jk4a.jpeg"));
        }

        // Set random availability
        for (MenuItem item : menuItems) {
            item.setIsAvailable(random.nextInt(10) > 1); // 80% chance of being available
        }

        return menuItems;
    }

    /**
     * Create a menu item with the given details
     */
    private MenuItem createMenuItem(String name, Integer price, String description, Category category,
            String imageUrl) {
        MenuItem menuItem = new MenuItem();
        menuItem.setName(name);
        menuItem.setPrice(price);
        menuItem.setDescription(description);
        menuItem.setCategory(category);
        menuItem.setIsAvailable(true);
        menuItem.setImg(imageUrl);
        return menuItem;
    }

    /**
     * Determine if a menu item should have removable elements
     */
    private boolean shouldHaveRemovableElements(MenuItem menuItem) {
        String itemName = menuItem.getName().toLowerCase();

        // Items that typically have removable ingredients
        return (itemName.contains("pizza") ||
                itemName.contains("burger") ||
                itemName.contains("sandwich") ||
                itemName.contains("taco") ||
                itemName.contains("salad") ||
                itemName.contains("burrito"));
    }

    /**
     * Create removable elements for a menu item
     */
    private List<RemovableElement> createRemovableElementsForMenuItem(MenuItem menuItem) {
        List<RemovableElement> elements = new ArrayList<>();
        String itemName = menuItem.getName().toLowerCase();

        if (itemName.contains("pizza")) {
            addRemovableElement(elements, "Cheese", menuItem);
            addRemovableElement(elements, "Tomato Sauce", menuItem);

            if (itemName.contains("pepperoni")) {
                addRemovableElement(elements, "Pepperoni", menuItem);
            }
            if (itemName.contains("vegetarian") || itemName.contains("supreme")) {
                addRemovableElement(elements, "Bell Peppers", menuItem);
                addRemovableElement(elements, "Mushrooms", menuItem);
                addRemovableElement(elements, "Olives", menuItem);
            }
            if (itemName.contains("hawaiian")) {
                addRemovableElement(elements, "Ham", menuItem);
                addRemovableElement(elements, "Pineapple", menuItem);
            }
        } else if (itemName.contains("burger")) {
            addRemovableElement(elements, "Lettuce", menuItem);
            addRemovableElement(elements, "Tomato", menuItem);
            addRemovableElement(elements, "Onion", menuItem);
            addRemovableElement(elements, "Pickles", menuItem);

            if (itemName.contains("cheese")) {
                addRemovableElement(elements, "Cheese", menuItem);
            }
            if (itemName.contains("bacon")) {
                addRemovableElement(elements, "Bacon", menuItem);
            }
        } else if (itemName.contains("taco") || itemName.contains("burrito")) {
            addRemovableElement(elements, "Cheese", menuItem);
            addRemovableElement(elements, "Lettuce", menuItem);
            addRemovableElement(elements, "Tomato", menuItem);
            addRemovableElement(elements, "Sour Cream", menuItem);

            if (itemName.contains("beef")) {
                addRemovableElement(elements, "Beef", menuItem);
            }
            if (itemName.contains("chicken")) {
                addRemovableElement(elements, "Chicken", menuItem);
            }
            if (itemName.contains("fish")) {
                addRemovableElement(elements, "Fish", menuItem);
            }
        } else if (itemName.contains("salad")) {
            addRemovableElement(elements, "Croutons", menuItem);
            addRemovableElement(elements, "Dressing", menuItem);

            if (itemName.contains("caesar")) {
                addRemovableElement(elements, "Parmesan", menuItem);
            }
            if (itemName.contains("greek")) {
                addRemovableElement(elements, "Feta Cheese", menuItem);
                addRemovableElement(elements, "Olives", menuItem);
            }
            if (itemName.contains("chicken")) {
                addRemovableElement(elements, "Chicken", menuItem);
            }
        }

        return elements;
    }

    /**
     * Add a removable element to the list
     */
    private void addRemovableElement(List<RemovableElement> elements, String name, MenuItem menuItem) {
        RemovableElement element = new RemovableElement();
        element.setName(name);
        element.setMenuItem(menuItem);
        elements.add(element);
    }

    /**
     * Get a district name near Hacettepe Beytepe Campus
     */
    private String getRandomDistrict() {
        // Hacettepe Beytepe Campus is in Çankaya
        return "Çankaya";
    }

    /**
     * Get a neighborhood name near Hacettepe Beytepe Campus
     */
    private String getRandomNeighborhood() {
        String[] neighborhoods = {
                "Beytepe", "100. Yıl", "Ümitköy", "Bilkent", "Çayyolu",
                "İncek", "Alacaatlı", "Yaşamkent"
        };
        return neighborhoods[random.nextInt(neighborhoods.length)];
    }

    /**
     * Get a street name near Hacettepe Beytepe Campus
     */
    private String getRandomStreet() {
        String[] streets = {
                "Üniversiteler", "Beytepe", "İhsan Doğramacı", "100. Yıl", "Teknokent",
                "Bilkent", "Prof. Dr.", "Hacettepe", "Kampüs", "ODTÜ",
                "Akademi", "Bilim", "Araştırma", "Taşpınar", "Öğrenci"
        };
        return streets[random.nextInt(streets.length)] + " " +
                (random.nextBoolean() ? "Caddesi" : "Sokağı");
    }
}