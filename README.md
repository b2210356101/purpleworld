
![Logo](https://i.hizliresim.com/qkl6ett.png)


# Purple World

HU-FDS is an online food delivery platform that connects restaurants, customers, and couriers. Developed by Purple World team, this system allows users to browse restaurants, place orders, and track deliveries while providing restaurants with tools to manage their menus and orders.

---
## Features

- **Multi-User System**: Separate modules for administrators, restaurants, customers, and couriers
- **Customer Features**:
  - Browse and search restaurants by name or category.
  - Filter restaurants by delivery time and price range
  - Place orders with customization options
  - Save favorite restaurants
  - Rate and review restaurants
  - Cancel order
  
- **Restaurant Features**:
  - Manage menu items (add, update, delete)
  - Process incoming orders
  - Track order history and current deliveries
  - Respond to customer reviews
  - Manage stock and inventory
  - Track earnings and statistics
  
- **Courier Features**:
  - Set availability status
  - Mark orders as picked up and delivered
  - Track earnings and performance metrics
  
- **Admin Features**:
  - Manage couriers and restaurants
  - Approve/reject restaurant and courier registrations
  - Configure platform settings (promotions etc.)
  - Ban restaurants who violate policies

- **Additional Features**:
  - Secure user authentication
  - Password reset via email
  - Advanced search and filtering
  - Coupon and promotion management
  - User-friendly interfaces
  - Responsive design
  - Supports multiple languages (Turkish and English).
  - Switch between dark and light themes.

## Tech Stack

**Client:**
- React, TypeScript, Material UI, Vite.js

**Server:**
- Java, Spring Boot

**Database:**
- PostgreSQL

**Architecture:**
- Model-View-Controller (MVC)
## Deployment

Access the live version of the website at [purpleworld.tr](http://purpleworld.tr).
## Run Locally

Clone the project

```bash
  git clone https://gitlab.com/bbm384-25/purple-world.git
```

Go to the project directory

```bash
  cd purple-world
```

### Frontend

```bash
  cd frontend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

### Backend

```bash
  cd ../backend
```

Install dependencies

```bash
  mvn install
```

Start the server

```bash
  mvn spring-boot:run
```



## Licence

This project is part of the BBM384 Software Engineering Laboratory course.

© Purple World, 2025