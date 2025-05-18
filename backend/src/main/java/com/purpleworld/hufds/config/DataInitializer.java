package com.purpleworld.hufds.config;

import com.purpleworld.hufds.entity.*;
import com.purpleworld.hufds.enums.AccountStatus;
import com.purpleworld.hufds.enums.Role;
import com.purpleworld.hufds.repository.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

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

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    private final Random random = new Random();
    private final CartRepository cartRepository;

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            initializeAdmin();
            initializeCustomers();
            initializeRestaurants();
            initializeCouriers();
            initializeAddresses();
            initializeMenus();
            initializeOrdersAndReviews();
        }
    }

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

    private void initializeCustomers() {
        List<Customer> customers = new ArrayList<>();

        Customer customer1 = new Customer();
        customer1.setFirstName("John");
        customer1.setLastName("Doe");
        customer1.setEmail("user@example.com");
        customer1.setPhoneNumber("5551234567");
        customer1.setPassword(passwordEncoder.encode("password123"));
        customer1.setBanned(false);
        customer1.setRole(Role.CUSTOMER);
        customer1.setProfileImg("https://picsum.photos/200/200?random=" + random.nextInt(1000));
        customers.add(customer1);

        Customer customer2 = new Customer();
        customer2.setFirstName("Alice");
        customer2.setLastName("Smith");
        customer2.setEmail("user2@example.com");
        customer2.setPhoneNumber("5559876543");
        customer2.setPassword(passwordEncoder.encode("password123"));
        customer2.setBanned(false);
        customer2.setRole(Role.CUSTOMER);
        customer2.setProfileImg("https://picsum.photos/200/200?random=" + random.nextInt(1000));
        customers.add(customer2);

        Customer customer3 = new Customer();
        customer3.setFirstName("Bob");
        customer3.setLastName("Johnson");
        customer3.setEmail("user3@example.com");
        customer3.setPhoneNumber("5555671234");
        customer3.setPassword(passwordEncoder.encode("password123"));
        customer3.setBanned(false);
        customer3.setRole(Role.CUSTOMER);
        customer3.setProfileImg("https://picsum.photos/200/200?random=" + random.nextInt(1000));
        customers.add(customer3);

        for (Customer customer : customers) {
            Cart cart = new Cart();
            cart.setCustomer(customer);
            cartRepository.save(cart);
            customerRepository.save(customer);
        }

        System.out.println("Customer data initialized: " + customers.size() + " customers");
    }

    @Transactional
    protected void initializeRestaurants() {
        List<Restaurant> restaurants = new ArrayList<>();

        String[][] restaurantData = {
                // Ankara Restaurants
                { "Campus Feast", "restaurant@example.com", "5554445555", "Ayşe", "Yılmaz", "1122334455", "25", "8",
                        "https://i.hizliresim.com/muzn8ec.jpeg", "Ankara" },
                { "Beytepe Bistro", "restaurant2@example.com", "5555556666", "Mehmet", "Kaya", "2233445566", "20", "7",
                        "https://i.hizliresim.com/2nqkwu4.jpeg", "Ankara" },
                { "Hacettepe Haven", "restaurant3@example.com", "5556667777", "Elif", "Demir", "3344556677", "22", "9",
                        null, "Ankara" },
                { "Uni Bites", "unibites@example.com", "5557778888", "Can", "Öztürk", "4455667788", "18", "6",
                        "https://i.hizliresim.com/9miem65.jpeg", "Ankara" },
                { "Beste's Kitchen", "besteskitchen@example.com", "5558889999", "Bilge", "Çelik", "5566778899", "24",
                        "8", "https://i.hizliresim.com/ht6p5el.jpeg", "Ankara" },
                { "Ankara Eats", "ankaraeats@example.com", "5559990000", "Zeynep", "Arslan", "6677889900", "20", "7",
                        "https://i.hizliresim.com/8agwydr.jpeg", "Ankara" },
                // Antalya Restaurants
                { "Hold & Bite", "kas@example.com", "5551112233", "Deniz", "Aksoy", "7788990011", "30", "5",
                        "https://i.hizliresim.com/jt5wpml.jpeg", "Antalya" },
                { "Frida Kaş", "fridakas@example.com", "5552223344", "Ali", "Mert", "8899001122", "25", "6",
                        "https://i.hizliresim.com/3zwt2di.jpeg", "Antalya" },
                { "Ege Restaurant", "kasege@example.com", "5553334455", "Selin", "Güneş", "9900112233", "28", "5",
                        "https://i.hizliresim.com/2ersrl6.jpeg", "Antalya" },
                { "BunBun Kaş", "bunbunkas@example.com", "5554445566", "Ece", "Aydın", "0011223344", "20", "4",
                        "https://i.hizliresim.com/sa4qxv2.jpeg", "Antalya" }
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
            restaurant.setStatus(AccountStatus.APPROVED);
            restaurant.setRole(Role.RESTAURANT);
            restaurant.setProfileImg(data[8]);
            Menu menu = new Menu();
            menu.setRestaurant(restaurant);
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

    @Transactional
    protected void initializeAddresses() {
        addressRepository.deleteAll();
        List<Customer> customers = customerRepository.findAll();
        List<Restaurant> restaurants = restaurantRepository.findAll();

        // Hacettepe Beytepe coordinates
        double ankaraLat = 39.867;
        double ankaraLng = 32.734;
        // Kaş coordinates
        double antalyaLat = 36.199;
        double antalyaLng = 29.639;

        // Customer addresses
        for (Customer customer : customers) {
            List<Address> customerAddresses = new ArrayList<>();

            // Create an Ankara address
            Address ankaraAddress = new Address();
            ankaraAddress.setCustomer(customer);
            ankaraAddress.setName("Home");
            ankaraAddress.setCity("Ankara");
            ankaraAddress.setDistrict(getRandomDistrict());
            ankaraAddress.setNeighborhood(getRandomNeighborhood());
            ankaraAddress.setStreet(getRandomStreet());
            ankaraAddress.setBuildingNumber(String.valueOf(random.nextInt(100) + 1));
            ankaraAddress.setApartmentNumber(String.valueOf(random.nextInt(20) + 1));
            ankaraAddress.setFloor(String.valueOf(random.nextInt(10) + 1));
            ankaraAddress.setPostalCode(String.valueOf(random.nextInt(90000) + 10000));
            ankaraAddress.setPhoneNumber(customer.getPhoneNumber());
            ankaraAddress.setDeliveryNote("Please call when at the door");
            ankaraAddress.setLatitude(ankaraLat + ((random.nextDouble() - 0.5) * 0.06));
            ankaraAddress.setLongitude(ankaraLng + ((random.nextDouble() - 0.5) * 0.06));
            ankaraAddress.setFullAddress(String.format("%s, %s Mah. %s Sok. No: %s D: %s Kat: %s, %s/%s",
                    ankaraAddress.getName(), ankaraAddress.getNeighborhood(), ankaraAddress.getStreet(),
                    ankaraAddress.getBuildingNumber(), ankaraAddress.getApartmentNumber(),
                    ankaraAddress.getFloor(), ankaraAddress.getDistrict(), ankaraAddress.getCity()));
            ankaraAddress = addressRepository.save(ankaraAddress);
            customerAddresses.add(ankaraAddress);

            // Create an Antalya address
            Address kasAddress = new Address();
            kasAddress.setCustomer(customer);
            kasAddress.setName("Vacation Home");
            kasAddress.setCity("Antalya");
            kasAddress.setDistrict("Kaş");
            kasAddress.setNeighborhood("Andifli");
            kasAddress.setStreet(getRandomAntalyaStreet());
            kasAddress.setBuildingNumber(String.valueOf(random.nextInt(100) + 1));
            kasAddress.setApartmentNumber(String.valueOf(random.nextInt(20) + 1));
            kasAddress.setFloor(String.valueOf(random.nextInt(5) + 1));
            kasAddress.setPostalCode(String.valueOf(random.nextInt(90000) + 10000));
            kasAddress.setPhoneNumber(customer.getPhoneNumber());
            kasAddress.setDeliveryNote("Near the beach");
            kasAddress.setLatitude(antalyaLat + ((random.nextDouble() - 0.5) * 0.03));
            kasAddress.setLongitude(antalyaLng + ((random.nextDouble() - 0.5) * 0.03));
            kasAddress.setFullAddress(String.format("%s, %s Mah. %s Sok. No: %s D: %s Kat: %s, %s/%s",
                    kasAddress.getName(), kasAddress.getNeighborhood(), kasAddress.getStreet(),
                    kasAddress.getBuildingNumber(), kasAddress.getApartmentNumber(),
                    kasAddress.getFloor(), kasAddress.getDistrict(), kasAddress.getCity()));
            kasAddress = addressRepository.save(kasAddress);
            customerAddresses.add(kasAddress);

            // Randomly add one more address
            if (random.nextBoolean()) {
                Address extraAddress = new Address();
                extraAddress.setCustomer(customer);

                boolean isAnkara = random.nextBoolean();
                extraAddress.setName(isAnkara ? "Work Address" : "Summer House");
                extraAddress.setCity(isAnkara ? "Ankara" : "Antalya");
                extraAddress.setDistrict(isAnkara ? getRandomDistrict() : "Kaş");
                extraAddress.setNeighborhood(isAnkara ? getRandomNeighborhood() : "Çukurbağ");
                extraAddress.setStreet(isAnkara ? getRandomStreet() : getRandomAntalyaStreet());
                extraAddress.setBuildingNumber(String.valueOf(random.nextInt(100) + 1));
                extraAddress.setApartmentNumber(String.valueOf(random.nextInt(20) + 1));
                extraAddress.setFloor(String.valueOf(random.nextInt(10) + 1));
                extraAddress.setPostalCode(String.valueOf(random.nextInt(90000) + 10000));
                extraAddress.setPhoneNumber(customer.getPhoneNumber());
                extraAddress.setDeliveryNote(isAnkara ? "Corporate building" : "Door code: 1234");

                if (isAnkara) {
                    extraAddress.setLatitude(ankaraLat + ((random.nextDouble() - 0.5) * 0.06));
                    extraAddress.setLongitude(ankaraLng + ((random.nextDouble() - 0.5) * 0.06));
                } else {
                    extraAddress.setLatitude(antalyaLat + ((random.nextDouble() - 0.5) * 0.03));
                    extraAddress.setLongitude(antalyaLng + ((random.nextDouble() - 0.5) * 0.03));
                }

                extraAddress.setFullAddress(String.format("%s, %s Mah. %s Sok. No: %s D: %s Kat: %s, %s/%s",
                        extraAddress.getName(), extraAddress.getNeighborhood(), extraAddress.getStreet(),
                        extraAddress.getBuildingNumber(), extraAddress.getApartmentNumber(),
                        extraAddress.getFloor(), extraAddress.getDistrict(), extraAddress.getCity()));
                extraAddress = addressRepository.save(extraAddress);
                customerAddresses.add(extraAddress);
            }

            customer.setCurrentAddressId(customerAddresses.get(0).getId());
            customerRepository.save(customer);
        }

        // Restaurant addresses
        for (Restaurant restaurant : restaurants) {
            Address address = new Address();
            address.setRestaurant(restaurant);
            address.setName(restaurant.getRestaurantName());
            String city = restaurant.getEmail().contains("kas") ? "Antalya" : "Ankara";
            address.setCity(city);
            address.setDistrict(city.equals("Ankara") ? getRandomDistrict() : "Kaş");
            address.setNeighborhood(city.equals("Ankara") ? getRandomNeighborhood() : "Andifli");
            address.setStreet(city.equals("Ankara") ? getRandomStreet() : getRandomAntalyaStreet());
            address.setBuildingNumber(String.valueOf(random.nextInt(100) + 1));
            address.setApartmentNumber("1");
            address.setFloor("0");
            address.setPostalCode(String.valueOf(random.nextInt(90000) + 10000));
            address.setPhoneNumber(restaurant.getPhoneNumber());
            if (city.equals("Ankara")) {
                address.setLatitude(ankaraLat + ((random.nextDouble() - 0.5) * 0.05));
                address.setLongitude(ankaraLng + ((random.nextDouble() - 0.5) * 0.05));
            } else {
                address.setLatitude(antalyaLat + ((random.nextDouble() - 0.5) * 0.03));
                address.setLongitude(antalyaLng + ((random.nextDouble() - 0.5) * 0.03));
            }
            address.setFullAddress(String.format("%s, %s Mah. %s Sok. No: %s, %s/%s",
                    address.getName(), address.getNeighborhood(), address.getStreet(),
                    address.getBuildingNumber(), address.getDistrict(), address.getCity()));
            addressRepository.save(address);
        }
    }

    private void initializeCouriers() {
        List<Courier> couriers = new ArrayList<>();
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
            courier.setAvailable(true);
            courier.setPassword(passwordEncoder.encode("courier123"));
            courier.setStatus(AccountStatus.APPROVED);
            courier.setRole(Role.COURIER);
            couriers.add(courier);
        }
        courierRepository.saveAll(couriers);
        System.out.println("Courier data initialized: " + couriers.size() + " couriers");
    }

    private void initializeMenus() {
        List<Restaurant> restaurants = restaurantRepository.findAll().stream()
                .filter(r -> r.getStatus() == AccountStatus.APPROVED)
                .toList();
        for (Restaurant restaurant : restaurants) {
            Optional<Menu> menu = menuRepository.findByRestaurant(restaurant);
            menu.get().setRestaurant(restaurant);
            menuRepository.save(menu.get());
            List<Category> categories = createCategoriesForRestaurant(restaurant, menu.get());
            categoryRepository.saveAll(categories);
            for (Category category : categories) {
                List<MenuItem> menuItems = createMenuItemsForCategory(category);
                menuItemRepository.saveAll(menuItems);
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

    private List<Category> createCategoriesForRestaurant(Restaurant restaurant, Menu menu) {
        List<Category> categories = new ArrayList<>();
        String restaurantName = restaurant.getRestaurantName().toLowerCase();
        boolean isAnkaraRestaurant = restaurant.getEmail().contains("restaurant") ||
                restaurant.getEmail().contains("restaurant2") ||
                restaurant.getEmail().contains("restaurant3") ||
                restaurant.getEmail().contains("unibites") ||
                restaurant.getEmail().contains("besteskitchen") ||
                restaurant.getEmail().contains("ankaraeats");

        // Full list of possible categories
        List<String> allCategories = List.of("Pizza", "Burger", "Pasta", "Salad", "Dessert", "Sushi",
                "Kebab", "Soup", "Wraps", "Vegan", "Drinks");

        if (isAnkaraRestaurant) {
            int categoryCount = random.nextInt(7) + 4; // Generates 4 to 10
            List<String> shuffledCategories = new ArrayList<>(allCategories);
            Collections.shuffle(shuffledCategories, random);
            for (int i = 0; i < categoryCount; i++) {
                categories.add(createCategory(shuffledCategories.get(i), menu));
            }
        } else if (restaurantName.contains("frida")) {
            categories.add(createCategory("Sushi", menu));
            categories.add(createCategory("Salad", menu));
            categories.add(createCategory("Dessert", menu));
            categories.add(createCategory("Drinks", menu));
        } else if (restaurantName.contains("hold")) {
            categories.add(createCategory("Burger", menu));
            categories.add(createCategory("Wraps", menu));
            categories.add(createCategory("Vegan", menu));
            categories.add(createCategory("Drinks", menu));
        } else if (restaurantName.contains("bunbun")) {
            categories.add(createCategory("Pasta", menu));
            categories.add(createCategory("Salad", menu));
            categories.add(createCategory("Dessert", menu));
            categories.add(createCategory("Drinks", menu));
        } else if (restaurantName.contains("ege")) {
            categories.add(createCategory("Soup", menu));
            categories.add(createCategory("Wraps", menu));
            categories.add(createCategory("Dessert", menu));
            categories.add(createCategory("Drinks", menu));
        }
        return categories;
    }

    private Category createCategory(String name, Menu menu) {
        Category category = new Category();
        category.setName(name);
        category.setMenu(menu);
        return category;
    }

    private List<MenuItem> createMenuItemsForCategory(Category category) {
        List<MenuItem> menuItems = new ArrayList<>();
        String categoryName = category.getName().toLowerCase();

        Map<String, List<MenuItem>> menuOptions = new HashMap<>();

        List<MenuItem> pizzaOptions = new ArrayList<>();
        pizzaOptions.add(createMenuItem("Margherita Pizza", 67, "Classic tomato sauce, fresh mozzarella, basil",
                category, "https://i.hizliresim.com/1g58unq.jpeg"));
        pizzaOptions.add(createMenuItem("Pepperoni Pizza", 78, "Tomato sauce, mozzarella, pepperoni", category,
                "https://i.hizliresim.com/963i45i.jpeg"));
        pizzaOptions.add(createMenuItem("Veggie Supreme Pizza", 75,
                "Tomato sauce, mozzarella, bell peppers, mushrooms, olives, onions", category,
                "https://i.hizliresim.com/c02am2m.jpeg"));
        pizzaOptions.add(createMenuItem("Four Cheese Pizza", 85, "Mozzarella, gorgonzola, parmesan, gouda", category,
                "https://i.hizliresim.com/o3hbos5.jpeg"));
        pizzaOptions.add(createMenuItem("BBQ Chicken Pizza", 88, "BBQ sauce, mozzarella, grilled chicken, red onions",
                category, "https://i.hizliresim.com/3y4cnbj.jpeg"));
        menuOptions.put("pizza", pizzaOptions);

        List<MenuItem> burgerOptions = new ArrayList<>();
        burgerOptions
                .add(createMenuItem("Classic Burger", 60, "Beef patty, lettuce, tomato, onion, pickles, special sauce",
                        category, "https://i.hizliresim.com/5ie0x0y.jpeg"));
        burgerOptions
                .add(createMenuItem("Cheeseburger", 65, "Beef patty, cheddar cheese, lettuce, tomato, onion, pickles",
                        category, "https://i.hizliresim.com/r35aavp.jpeg"));
        burgerOptions.add(createMenuItem("Bacon Burger", 75, "Beef patty, bacon, cheddar, lettuce, tomato, onion",
                category, "https://i.hizliresim.com/3ejhvj4.jpeg"));
        burgerOptions
                .add(createMenuItem("Mushroom Swiss Burger", 72, "Beef patty, swiss cheese, sautéed mushrooms, onions",
                        category, "https://i.hizliresim.com/sd94sie.jpeg"));
        burgerOptions.add(createMenuItem("Veggie Burger", 58, "Plant-based patty, lettuce, tomato, onion, avocado",
                category, "https://i.hizliresim.com/ox3pe13.jpeg"));
        menuOptions.put("burger", burgerOptions);

        List<MenuItem> pastaOptions = new ArrayList<>();
        pastaOptions.add(createMenuItem("Spaghetti Bolognese", 55, "Pasta with rich meat sauce", category,
                "https://i.hizliresim.com/ocqn0sf.jpeg"));
        pastaOptions.add(createMenuItem("Penne Alfredo Pasta", 52, "Penne with creamy Alfredo sauce", category,
                "https://i.hizliresim.com/14q73hm.jpeg"));
        pastaOptions
                .add(createMenuItem("Fettuccine Carbonara", 58, "Fettuccine pasta with creamy egg sauce, pancetta, parmesan",
                        category, "https://i.hizliresim.com/p6vjwe5.jpeg"));
        pastaOptions.add(createMenuItem("Pesto Linguine Pasta", 54, "Linguine with basil pesto, pine nuts, parmesan",
                category, "https://i.hizliresim.com/mmw1nuv.jpeg"));
        pastaOptions.add(createMenuItem("Seafood Pasta", 75, "Linguine with mixed seafood in a light tomato sauce",
                category, "https://i.hizliresim.com/93emkli.jpeg"));
        menuOptions.put("pasta", pastaOptions);

        List<MenuItem> saladOptions = new ArrayList<>();
        saladOptions.add(createMenuItem("Caesar Salad", 45, "Romaine lettuce, croutons, Caesar dressing, parmesan",
                category, "https://i.hizliresim.com/jvyjl56.jpeg"));
        saladOptions.add(createMenuItem("Greek Salad", 48, "Tomatoes, cucumbers, onions, feta, olives, olive oil",
                category, "https://i.hizliresim.com/ccwf45v.jpeg"));
        saladOptions
                .add(createMenuItem("Cobb Salad", 52, "Mixed greens, grilled chicken, bacon, avocado, blue cheese, egg",
                        category, "https://i.hizliresim.com/kr8fqra.jpeg"));
        menuOptions.put("salad", saladOptions);

        List<MenuItem> dessertOptions = new ArrayList<>();
        dessertOptions.add(createMenuItem("Chocolate Lava Cake", 38, "Warm chocolate cake with molten center", category,
                "https://i.hizliresim.com/2rahzzr.jpeg"));
        dessertOptions.add(createMenuItem("Cheesecake Dessert", 42, "Creamy cheesecake with berry topping", category,
                "https://i.hizliresim.com/lpr8tfu.jpeg"));
        dessertOptions.add(createMenuItem("Baklava", 36, "Layered phyllo pastry with nuts and honey, Turkish dessert", category,
                "https://i.hizliresim.com/86yt70z.jpeg"));
        dessertOptions.add(createMenuItem("Apple Pie Dessert", 38, "Classic apple pie with cinnamon, served with ice cream",
                category, "https://i.hizliresim.com/mt61rhc.jpeg"));
        menuOptions.put("dessert", dessertOptions);

        List<MenuItem> sushiOptions = new ArrayList<>();
        sushiOptions.add(createMenuItem("California Roll", 65, "Crab, avocado, cucumber", category,
                "https://i.hizliresim.com/rr77xgm.jpeg"));
        sushiOptions.add(createMenuItem("Spicy Tuna Sushi Roll", 68, "Spicy tuna, cucumber, spicy mayo", category,
                "https://i.hizliresim.com/krljia8.jpeg"));
        sushiOptions.add(createMenuItem("Dragon Sushi Roll", 75, "Eel, crab, cucumber, avocado", category,
                "https://i.hizliresim.com/posga3a.jpeg"));
        sushiOptions.add(createMenuItem("Tempura Sushi Roll", 70, "Shrimp tempura, avocado, cucumber, eel sauce", category,
                "https://i.hizliresim.com/gg4sl59.jpeg"));
        menuOptions.put("sushi", sushiOptions);

        List<MenuItem> kebabOptions = new ArrayList<>();
        kebabOptions.add(createMenuItem("Adana Kebab", 65, "Spicy minced lamb kebab with pita", category,
                "https://i.hizliresim.com/3yemd93.jpeg"));
        kebabOptions.add(createMenuItem("Chicken Döner", 58, "Sliced chicken döner with vegetables", category,
                "https://i.hizliresim.com/oneefdn.jpeg"));
        kebabOptions.add(createMenuItem("Iskender Kebab", 72, "Döner kebab on bread with tomato sauce and yogurt",
                category, "https://i.hizliresim.com/cfmuws6.jpeg"));
        kebabOptions.add(createMenuItem("Shish Kebab", 68, "Grilled marinated meat on skewers", category,
                "https://i.hizliresim.com/kcpyc2r.jpeg"));
        kebabOptions.add(
                createMenuItem("Beyti Kebab", 70, "Ground lamb wrapped in lavash, topped with tomato sauce and yogurt",
                        category, "https://i.hizliresim.com/jc7qtcz.jpeg"));
        menuOptions.put("kebab", kebabOptions);

        List<MenuItem> soupOptions = new ArrayList<>();
        soupOptions.add(createMenuItem("Lentil Soup", 25, "Traditional Turkish red lentil soup", category,
                "https://i.hizliresim.com/swj40j9.jpeg"));
        soupOptions.add(createMenuItem("Tomato Soup", 28, "Creamy tomato soup with herbs", category,
                "https://i.hizliresim.com/6yhx57h.jpeg"));
        soupOptions.add(createMenuItem("Mushroom Soup", 32, "Creamy mushroom soup with herbs", category,
                "https://i.hizliresim.com/pe0j6i0.jpeg"));
        menuOptions.put("soup", soupOptions);

        List<MenuItem> wrapOptions = new ArrayList<>();
        wrapOptions.add(createMenuItem("Chicken Caesar Wrap", 52, "Grilled chicken, romaine, parmesan, Caesar dressing",
                category, "https://i.hizliresim.com/75h9zu4.jpeg"));
        wrapOptions.add(createMenuItem("Falafel Wrap", 48, "Falafel, hummus, veggies in a wrap", category,
                "https://i.hizliresim.com/8wni46s.jpeg"));
        wrapOptions.add(createMenuItem("Beef Wrap", 54, "Seasoned beef, lettuce, tomato, onion, sauce", category,
                "https://i.hizliresim.com/c44ammw.jpeg"));
        menuOptions.put("wraps", wrapOptions);

        List<MenuItem> veganOptions = new ArrayList<>();
        veganOptions.add(createMenuItem("Vegan Buddha Bowl", 55, "Quinoa, roasted veggies, avocado, tahini", category,
                "https://i.hizliresim.com/kvawjlp.jpeg"));
        veganOptions.add(createMenuItem("Vegan Falafel Plate", 52, "Falafel, hummus, cucumber salad", category,
                "https://i.hizliresim.com/hi4az2c.jpeg"));
        menuOptions.put("vegan", veganOptions);

        List<MenuItem> drinkOptions = new ArrayList<>();
        drinkOptions.add(createMenuItem("Cola", 12, "Carbonated cola beverage", category,
                "https://i.hizliresim.com/sl6x5k6.jpeg"));
        drinkOptions.add(createMenuItem("Lemonade", 15, "Fresh-squeezed lemonade", category,
                "https://i.hizliresim.com/f93jk4a.jpeg"));
        drinkOptions.add(createMenuItem("Iced Tea", 14, "Refreshing black tea with lemon", category,
                "https://i.hizliresim.com/3uooo90.jpeg"));
        drinkOptions.add(createMenuItem("Orange Juice", 16, "Freshly squeezed orange juice", category,
                "https://i.hizliresim.com/blfg775.jpeg"));
        menuOptions.put("drink", drinkOptions);
        menuOptions.put("beverage", drinkOptions);

        // Kategori adına göre uygun menü öğelerini seçelim
        List<MenuItem> candidateItems = new ArrayList<>();

        for (Map.Entry<String, List<MenuItem>> entry : menuOptions.entrySet()) {
            if (categoryName.contains(entry.getKey())) {
                candidateItems.addAll(entry.getValue());
            }
        }

        if (candidateItems.isEmpty()) {
            Random random = new Random();
            List<String> allCategories = new ArrayList<>(menuOptions.keySet());
            String randomCategory = allCategories.get(random.nextInt(allCategories.size()));
            candidateItems.addAll(menuOptions.get(randomCategory));
        }

        Random random = new Random();
        int itemCount = random.nextInt(4) + 2;
        itemCount = Math.min(itemCount, candidateItems.size());

        Collections.shuffle(candidateItems);

        for (int i = 0; i < itemCount; i++) {
            MenuItem item = candidateItems.get(i);
            item.setIsAvailable(random.nextInt(10) > 0);
            menuItems.add(item);
        }

        return menuItems;
    }

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

    private boolean shouldHaveRemovableElements(MenuItem menuItem) {
        String itemName = menuItem.getName().toLowerCase();
        return (itemName.contains("pizza") ||
                itemName.contains("burger") ||
                itemName.contains("pasta") ||
                itemName.contains("salad") ||
                itemName.contains("wrap") ||
                itemName.contains("kebab") ||
                itemName.contains("vegan"));
    }

    private List<RemovableElement> createRemovableElementsForMenuItem(MenuItem menuItem) {
        List<RemovableElement> elements = new ArrayList<>();
        String itemName = menuItem.getName().toLowerCase();

        if (itemName.contains("pizza")) {
            addRemovableElement(elements, "Cheese", menuItem);
            addRemovableElement(elements, "Tomato Sauce", menuItem);
            if (itemName.contains("pepperoni")) {
                addRemovableElement(elements, "Pepperoni", menuItem);
            }
        } else if (itemName.contains("burger")) {
            addRemovableElement(elements, "Lettuce", menuItem);
            addRemovableElement(elements, "Tomato", menuItem);
            addRemovableElement(elements, "Onion", menuItem);
            addRemovableElement(elements, "Pickles", menuItem);
            if (itemName.contains("cheese")) {
                addRemovableElement(elements, "Cheese", menuItem);
            }
        } else if (itemName.contains("pasta")) {
            addRemovableElement(elements, "Sauce", menuItem);
            if (itemName.contains("bolognese")) {
                addRemovableElement(elements, "Meat", menuItem);
            }
            if (itemName.contains("alfredo")) {
                addRemovableElement(elements, "Cream", menuItem);
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
        } else if (itemName.contains("kebab") || itemName.contains("döner")) {
            addRemovableElement(elements, "Onion", menuItem);
            addRemovableElement(elements, "Tomato", menuItem);
            addRemovableElement(elements, "Sauce", menuItem);
        } else if (itemName.contains("wrap")) {
            addRemovableElement(elements, "Lettuce", menuItem);
            addRemovableElement(elements, "Tomato", menuItem);
            addRemovableElement(elements, "Sauce", menuItem);
            if (itemName.contains("falafel")) {
                addRemovableElement(elements, "Hummus", menuItem);
            }
        } else if (itemName.contains("vegan")) {
            addRemovableElement(elements, "Avocado", menuItem);
            addRemovableElement(elements, "Tahini", menuItem);
            if (itemName.contains("falafel")) {
                addRemovableElement(elements, "Hummus", menuItem);
            }
        }
        return elements;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void initializeOrdersAndReviews() {
        List<Customer> customers = customerRepository.findAll();
        List<Restaurant> restaurants = restaurantRepository.findAll().stream()
                .filter(r -> r.getStatus() == AccountStatus.APPROVED)
                .toList();

        Random random = new Random();
        int reviewCount = 0;
        int ordersCreated = 0;

        for (Customer customer : customers) {
            List<Address> addresses = addressRepository.findAllByCustomer(customer);
            if (addresses.isEmpty())
                continue;

            int ordersPerCustomer = Math.min(random.nextInt(3) + 6, 15);

            for (int i = 0; i < ordersPerCustomer; i++) {
                try {
                    Restaurant restaurant = restaurants.get(random.nextInt(restaurants.size()));

                    List<Object[]> menuItemsData = new ArrayList<>();

                    try {
                        // Menü öğelerini direkt veritabanından al
                        String jpql = "SELECT mi.id, mi.name, mi.price FROM MenuItem mi " +
                                "JOIN mi.category c JOIN c.menu m " +
                                "WHERE m.restaurant.id = :restaurantId";

                        menuItemsData = entityManager.createQuery(jpql)
                                .setParameter("restaurantId", restaurant.getId())
                                .setMaxResults(10)
                                .getResultList();

                        System.out.println("Found " + menuItemsData.size() + " menu items for restaurant " +
                                restaurant.getId() + " - " + restaurant.getRestaurantName());
                    } catch (Exception e) {
                        System.err.println("Error fetching menu items: " + e.getMessage());
                    }

                    Address deliveryAddress = addresses.get(random.nextInt(addresses.size()));

                    Order order = new Order();
                    order.setCustomer(customer);
                    LocalDateTime orderedDate = LocalDateTime.now().minusDays(random.nextInt(30) + 1);
                    order.setOrderedDate(orderedDate);
                    order.setPaymentType(random.nextBoolean() ? "CREDIT_CARD" : "CASH");
                    order.setAddressId(deliveryAddress.getId());
                    order.setCouponId(null);

                    OrderGroup orderGroup = new OrderGroup();
                    orderGroup.setRestaurant(restaurant);
                    orderGroup.setNote("Test order " + (i + 1));
                    orderGroup.setOrderedDate(orderedDate);
                    orderGroup.setPreperationDate(orderedDate.plusMinutes(10));
                    orderGroup.setPreparedDate(orderedDate.plusMinutes(20));
                    orderGroup.setTakenOverDate(orderedDate.plusMinutes(30));
                    orderGroup.setDeliveredDate(orderedDate.plusMinutes(60));

                    List<OrderItem> orderItems = new ArrayList<>();
                    int itemCount = random.nextInt(5) + 1;
                    int orderTotal = 0;

                    for (int j = 0; j < itemCount; j++) {
                        int index = random.nextInt(menuItemsData.size());
                        Object[] menuItemData = menuItemsData.get(index);

                        Long menuItemId = ((Number) menuItemData[0]).longValue();
                        Integer menuItemPrice = ((Number) menuItemData[2]).intValue();
                        int quantity = random.nextInt(3) + 1;

                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrderGroup(orderGroup);
                        orderItem.setMenuItemId(menuItemId);
                        orderItem.setPrice(menuItemPrice);
                        orderItem.setQuantity(quantity);
                        orderItem.setRemovables(null);

                        orderItems.add(orderItem);
                        orderTotal += menuItemPrice * quantity;
                    }

                    orderGroup.setOrderItems(orderItems);
                    orderGroup.setRestaurantTotal(orderTotal);
                    order.setPrice(orderTotal);

                    orderGroup.setOrder(order);
                    order.setOrderGroups(List.of(orderGroup));

                    order = orderRepository.save(order);
                    ordersCreated++;

                    // add review %80
                    if (random.nextDouble() < 0.80) {
                        String[] reviewTexts = {
                                // Very positive reviews (0-3)
                                "Absolutely delicious food! Fast delivery and excellent packaging. Will definitely order again!",
                                "The taste was incredible!",
                                "5 stars! Food arrived hot and fresh. Generous portions and amazing flavors.",
                                "Best " + restaurant.getRestaurantName()
                                        + " in the area! Friendly delivery person and the food was perfect.",

                                // Positive with small issues (4-7)
                                "Really enjoyed the meal. Delivery was a bit late but food quality made up for it.",
                                "Great taste and good value.",
                                "Food was delicious! Would've given 5 stars but delivery took longer than expected.",
                                "Tasty food and reasonable prices. The app tracking was a bit off but overall good experience.",

                                // Neutral reviews (8-11)
                                "Decent food for the price. Nothing special but satisfies the craving.",
                                "Food was okay. Delivery was on time. Might order again sometime.",
                                "Average experience. Food was warm but not hot when it arrived.",
                                "Portions are smaller than expected.",

                                // Negative reviews (12-15)
                                "Disappointed with the quality. Food was cold when it arrived.",
                                "Too expensive for what you get. Wouldn't recommend.",
                                "Order was incorrect and customer service wasn't helpful.",
                                "Long delivery time and food arrived cold. Will try somewhere else next time."
                        };

                        Review review = new Review();
                        review.setOrderGroup(orderGroup);

                        int reviewIndex = random.nextInt(reviewTexts.length);
                        review.setReview(reviewTexts[reviewIndex]);

                        if (reviewIndex < 4) {
                            // Very positive reviews
                            review.setTasteRating(4.5 + (random.nextInt(2)) * 0.5); // 4.5-5.0
                            review.setServiceRating(4.0 + (random.nextInt(3)) * 0.5); // 4.0-5.0
                            review.setDeliveryRating(4.0 + (random.nextInt(3)) * 0.5); // 4.0-5.0
                        } else if (reviewIndex < 8) {
                            // Positive with small issues
                            review.setTasteRating(4.0 + (random.nextInt(3)) * 0.5); // 4.0-5.0
                            review.setServiceRating(3.5 + (random.nextInt(4)) * 0.5); // 3.5-5.0
                            review.setDeliveryRating(3.0 + (random.nextInt(5)) * 0.5); // 3.0-5.0
                        } else if (reviewIndex < 12) {
                            // Neutral reviews
                            review.setTasteRating(3.0 + (random.nextInt(3)) * 0.5); // 3.0-4.0
                            review.setServiceRating(2.5 + (random.nextInt(4)) * 0.5); // 2.5-4.0
                            review.setDeliveryRating(2.5 + (random.nextInt(4)) * 0.5); // 2.5-4.0
                        } else {
                            // Negative reviews
                            review.setTasteRating(1.0 + (random.nextInt(5)) * 0.5); // 1.0-3.5
                            review.setServiceRating(1.0 + (random.nextInt(4)) * 0.5); // 1.0-3.0
                            review.setDeliveryRating(1.0 + (random.nextInt(4)) * 0.5); // 1.0-3.0
                        }

                        review.setReviewDate(orderedDate.plusDays(random.nextInt(3) + 1));
                        review.setUserName(customer.getFirstName() + " " + customer.getLastName());
                        review.setUserAvatar(customer.getProfileImg());
                        reviewRepository.save(review);
                        reviewCount++;
                    }
                } catch (Exception e) {
                    System.err.println("Error creating order: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        System.out.println("Created " + ordersCreated + " orders with " + reviewCount + " reviews.");
    }

    private void addRemovableElement(List<RemovableElement> elements, String name, MenuItem menuItem) {
        RemovableElement element = new RemovableElement();
        element.setName(name);
        element.setMenuItem(menuItem);
        elements.add(element);
    }

    private String getRandomDistrict() {
        return "Çankaya";
    }

    private String getRandomNeighborhood() {
        String[] neighborhoods = { "Beytepe", "100. Yıl", "Ümitköy", "Bilkent", "Çayyolu", "İncek", "Alacaatlı",
                "Yaşamkent" };
        return neighborhoods[random.nextInt(neighborhoods.length)];
    }

    private String getRandomStreet() {
        String[] streets = { "Üniversiteler", "Beytepe", "İhsan Doğramacı", "100. Yıl", "Teknokent", "Bilkent",
                "Prof. Dr.", "Hacettepe", "Kampüs", "ODTÜ", "Akademi", "Bilim", "Araştırma", "Taşpınar", "Öğrenci" };
        return streets[random.nextInt(streets.length)] + " " + (random.nextBoolean() ? "Caddesi" : "Sokağı");
    }

    private String getRandomAntalyaStreet() {
        String[] streets = { "Hükümet", "Liman", "Deniz", "Çarşı", "Kaleiçi", "Uluçınar", "Andifli", "Süleyman Topçu",
                "İskele", "Mavi" };
        return streets[random.nextInt(streets.length)] + " " + (random.nextBoolean() ? "Caddesi" : "Sokağı");
    }

}