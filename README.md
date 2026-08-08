# Misgie LCD — Phone Accessory Management System

A scalable backend REST API for **Misgie LCD**, a phone LCD and accessories management and e-commerce platform built with **Node.js, Express.js, and MongoDB**.

The system provides product and category management, inventory tracking, authentication, shopping carts, wishlists, orders, reviews, coupons, notifications, and an admin dashboard.

---

## 🚀 Features

### 📦 Products & Categories

* Category CRUD
* Product CRUD
* Products linked to categories
* Brand and model management
* Quality-grade filtering
* Screen type and compatible-model filtering
* Product search
* Product sorting
* Pagination
* Featured products

### 📊 Inventory Management

* Stock management
* Manual stock adjustments
* Stock movement audit log
* Low-stock detection
* Reorder-point support
* Automatic stock deduction when orders are created
* Automatic stock restoration when orders are cancelled

### 🔐 Authentication & Users

* User registration
* User login
* JWT authentication
* Email verification
* Password reset
* Google OAuth login
* User profile management
* Role-based access control
* User / Staff / Admin roles
* User blocking and unblocking
* Admin user management

### 🛒 Shopping Cart

* Add products to cart
* Update product quantities
* Remove products from cart
* Clear cart
* View authenticated user's cart

### ❤️ Wishlist

* Add products to wishlist
* View wishlist
* Remove products from wishlist

### 📋 Orders

* Create orders from cart
* Automatic stock deduction
* Coupon support
* Order history
* Order cancellation
* Automatic restocking when eligible orders are cancelled
* Admin order management
* Order status management

### ⭐ Reviews

* Product reviews
* Rating system
* Update own reviews
* Delete own reviews
* Purchase-verified reviews
* Admin review management

### 🎟️ Coupons

* Create coupons
* Update coupons
* Delete coupons
* List coupons
* Cart discount preview
* Coupon validation
* Apply discounts during checkout

### 🔔 Notifications

* Order status notifications
* Low-stock notifications
* Price-drop notifications
* Mark notification as read
* Mark all notifications as read
* Unread notification count

### 📈 Admin Dashboard

* Total sales
* Pending orders
* Low-stock products
* Total users
* Total products
* Top-selling products

---

# 🛠️ Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**

### Authentication & Security

* **JWT**
* **Passport.js**
* **Google OAuth**
* **bcryptjs**
* **CORS**

### Utilities

* **dotenv**
* **Nodemailer**
* **Nodemon**
---

# 🏗️ Backend Architecture

The application follows a modular REST API architecture:

```text
Client
   │
   ▼
Express Routes
   │
   ▼
Middleware
   │
   ├── Authentication
   └── Authorization
   │
   ▼
Controllers
   │
   ▼
Services / Business Logic
   │
   ▼
Mongoose Models
   │
   ▼
MongoDB
```

For inventory-related operations:

```text
Order / Admin Action
        │
        ▼
inventoryService
        │
        ├── Update Product Stock
        │
        └── Create StockMovement
```

Product stock should be changed through the inventory service so every stock change can be audited.

---

📁 Project Structure
product-crud-api/
│
├── client/                         # Frontend application
│   └── ...
│
├── server/                         # Backend API
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   ├── couponController.js
│   │   ├── inventoryController.js
│   │   ├── notificationController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   └── wishlistController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Coupon.js
│   │   ├── Notification.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── StockMovement.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── googleRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── userRoutes.js
│   │   └── wishlistRoutes.js
│   │
│   ├── utils/
│   │   ├── couponService.js
│   │   ├── inventoryService.js
│   │   ├── notificationService.js
│   │   └── sendEmail.js
│   │
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/me-1219/Phone-lcd-store
cd product-crud-api
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority

JWT_SECRET=your_long_random_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Environment Variables

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `PORT`                 | API server port. Defaults to `5000`              |
| `MONGO_URI`            | MongoDB Atlas or local MongoDB connection string |
| `JWT_SECRET`           | Secret used to sign JWT tokens                   |
| `EMAIL_USER`           | Email account used by Nodemailer                 |
| `EMAIL_PASS`           | Email app password                               |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                           |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                       |
| `GOOGLE_CALLBACK_URL`  | Google OAuth callback URL                        |

> Google OAuth and email variables are only required when those features are enabled.

---

## 4. Start the Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

---

# 🚨 Available Scripts

```bash
npm start
```

Runs the application with Node.js.

```bash
npm run dev
```

Runs the application with Nodemon for automatic restarts during development.

---

# 🔐 Authentication & Roles

The system supports three roles:

```text
user
staff
admin
```

### User

Customers can:

* Browse products
* Search and filter products
* Manage their cart
* Manage their wishlist
* Create orders
* View their orders
* Review purchased products
* Manage their profile

### Staff

Staff permissions can be used for operational tasks such as:

* Inventory management
* Stock adjustments
* Order processing

### Admin

Administrators can:

* Manage categories
* Manage products
* Manage inventory
* Manage users
* Manage orders
* Manage coupons
* Manage reviews
* Manage notifications
* View dashboard analytics
* Manage staff/admin roles

Registration always creates a normal `user` account. Administrator privileges should be granted manually or by an existing administrator.

---

# 📌 API Endpoints

Base URL:

```text
http://localhost:5000/api
```

---

## 🔐 Authentication

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| POST   | `/auth/register`            | Register a new user          |
| POST   | `/auth/login`               | Login                        |
| GET    | `/auth/me`                  | Get logged-in user's profile |
| POST   | `/auth/verify-email`        | Verify email                 |
| POST   | `/auth/resend-verification` | Resend verification code     |
| POST   | `/auth/forgot-password`     | Request password reset       |
| POST   | `/auth/reset-password`      | Reset password               |
| GET    | `/auth/google`              | Start Google OAuth           |
| GET    | `/auth/google/callback`     | Google OAuth callback        |

---

## 📂 Categories

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| GET    | `/categories`            | List categories        |
| GET    | `/categories/slug/:slug` | Get category by slug   |
| GET    | `/categories/:id`        | Get category by ID     |
| POST   | `/categories`            | Admin: create category |
| PUT    | `/categories/:id`        | Admin: update category |
| DELETE | `/categories/:id`        | Admin: delete category |

> Category deletion should be blocked when products still reference that category.

---

## 📦 Products

| Method | Endpoint                         | Description           |
| ------ | -------------------------------- | --------------------- |
| GET    | `/products`                      | List products         |
| GET    | `/products/search?q=`            | Search products       |
| GET    | `/products/category/:categoryId` | Products by category  |
| GET    | `/products/:id`                  | Product details       |
| POST   | `/products`                      | Admin: create product |
| PUT    | `/products/:id`                  | Admin: update product |
| DELETE | `/products/:id`                  | Admin: delete product |

### Product Filtering

The product listing endpoint supports:

```text
GET /api/products?category=
GET /api/products?brand=
GET /api/products?qualityGrade=
GET /api/products?screenType=
GET /api/products?compatibleModel=
GET /api/products?minPrice=
GET /api/products?maxPrice=
GET /api/products?featured=
GET /api/products?sort=
GET /api/products?page=1&limit=10
```

### Product Search

```text
GET /api/products/search?q=samsung
```

Search can match product information such as:

* Name
* Brand
* Model
* SKU

---

## 📊 Inventory

Admin/staff inventory operations:

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/inventory/adjust`    | Manual stock adjustment  |
| GET    | `/inventory/movements` | Stock movement audit log |
| GET    | `/inventory/low-stock` | Get low-stock products   |

Example:

```text
GET /api/inventory/movements?productId=&type=
```

```text
GET /api/inventory/low-stock
```

Manual stock adjustments should include a reason for auditing.

---

## 👤 Users

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| PUT    | `/users/me`        | Update own profile        |
| GET    | `/users`           | Admin: list users         |
| GET    | `/users/:id`       | Admin: get user           |
| PUT    | `/users/:id/block` | Admin: block/unblock user |
| PUT    | `/users/:id/role`  | Admin: change role        |
| DELETE | `/users/:id`       | Admin: delete user        |

---

## 🛒 Cart

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| GET    | `/cart`            | Get logged-in user's cart |
| POST   | `/cart`            | Add product to cart       |
| PUT    | `/cart/:productId` | Update quantity           |
| DELETE | `/cart/:productId` | Remove product            |
| DELETE | `/cart`            | Clear cart                |

---

## ❤️ Wishlist

| Method | Endpoint               | Description    |
| ------ | ---------------------- | -------------- |
| GET    | `/wishlist`            | Get wishlist   |
| POST   | `/wishlist`            | Add product    |
| DELETE | `/wishlist/:productId` | Remove product |

---

## 📋 Orders

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| POST   | `/orders`            | Create order from cart     |
| GET    | `/orders/my-orders`  | Get user's orders          |
| GET    | `/orders/:id`        | Get order details          |
| PUT    | `/orders/:id/cancel` | Cancel own order           |
| GET    | `/orders`            | Admin: list all orders     |
| PUT    | `/orders/:id/status` | Admin: update order status |

### Order Flow

```text
Cart
 ↓
Checkout
 ↓
Validate Products
 ↓
Validate Stock
 ↓
Apply Coupon
 ↓
Calculate Total
 ↓
Create Order
 ↓
Deduct Stock
 ↓
Clear Cart
 ↓
Send Notification
```

Cancelling an eligible order automatically restores the reserved stock.

---

## ⭐ Reviews

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/reviews/product/:productId` | List product reviews           |
| POST   | `/reviews`                    | Create review                  |
| PUT    | `/reviews/:id`                | Update own review              |
| DELETE | `/reviews/:id`                | Delete own review/admin delete |

Reviews are **purchase-verified** and can only be created for eligible delivered orders.

---

## 🎟️ Coupons

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/coupons/apply` | Preview discount     |
| POST   | `/coupons`       | Admin: create coupon |
| GET    | `/coupons`       | Admin: list coupons  |
| PUT    | `/coupons/:id`   | Admin: update coupon |
| DELETE | `/coupons/:id`   | Admin: delete coupon |

Example:

```text
POST /api/coupons/apply
```

The endpoint can be used to preview the discount against the current cart before checkout.

---

## 🔔 Notifications

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| GET    | `/notifications`          | Get user notifications    |
| PUT    | `/notifications/:id/read` | Mark notification as read |
| PUT    | `/notifications/read-all` | Mark all as read          |

Notifications can include:

* Order status updates
* Low-stock alerts
* Price-drop alerts

The notification response includes an unread notification count.

---

## 📈 Admin Dashboard

```http
GET /api/admin/dashboard
```

Provides summary information such as:

* Total sales
* Pending orders
* Low-stock products
* Total users
* Total products
* Top-selling products

---

# 🗄️ MongoDB Collections

The main collections are:

```text
users
categories
products
carts
orders
reviews
wishlists
coupons
notifications
stockmovements
```

### Main Relationships

```text
User
 ├── Cart
 ├── Wishlist
 ├── Orders
 └── Reviews

Category
 └── Products

Product
 ├── Cart Items
 ├── Order Items
 ├── Reviews
 ├── Wishlist Items
 └── Stock Movements

Coupon
 └── Orders

User
 └── Notifications
```

---

# 🧪 API Testing

The API can be tested with **Postman**, Insomnia, or any REST API client.

### Example — Get Products

```http
GET http://localhost:5000/api/products
```

### Example — Create Product

```http
POST http://localhost:5000/api/products
```

```json
{
  "name": "Samsung A15 LCD",
  "description": "High-quality phone LCD display",
  "brand": "Samsung",
  "model": "A15",
  "category": "CATEGORY_ID",
  "price": 3500,
  "stock": 20
}
```

Protected endpoints require an authentication token.

---

# 🔒 Security

Important security practices:

* Never commit `.env`
* Use strong JWT secrets
* Hash passwords with bcryptjs
* Protect private routes with authentication middleware
* Use role-based authorization
* Validate user input
* Restrict administrative operations
* Do not expose database credentials
* Use HTTPS in production
* Configure CORS for trusted frontend origins

Add the following to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# 💡 Development Notes

### CommonJS

This project uses **CommonJS**:

```javascript
const express = require("express");
```

and:

```javascript
module.exports = router;
```

Keep new files consistent with CommonJS and do not mix `import/export` syntax with `require/module.exports`.

### Inventory

Product stock should be changed through the inventory service:

```text
utils/inventoryService.js
```

rather than directly modifying `Product.stock`.

This ensures stock changes are recorded in the `StockMovement` audit log.

### Route Ordering

Specific routes must be declared before generic `/:id` routes.

For example:

```javascript
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
```

Otherwise, Express may incorrectly interpret `search` or `category` as an ID.

---

# 🙋 Troubleshooting

### MongoDB Connection Error

Check:

* `MONGO_URI`
* MongoDB Atlas cluster status
* Atlas Network Access
* Database username/password
* Internet/DNS connection

### `require is not defined`

The project uses CommonJS. Check that you have not accidentally used ESM syntax:

```javascript
import express from "express";
```

Use:

```javascript
const express = require("express");
```

### Cart/Wishlist/Order User Error

If you see an error such as:

```text
Path 'user' is required
```

check that `authMiddleware.js` sets `req.user` to the authenticated Mongoose user document rather than only the decoded JWT payload.

### Route Returns 404

Check route ordering, especially for:

```text
/search
/category/:categoryId
/my-orders
```

Specific routes should appear before:

```text
/:id
```

### Email Sending Error

Check:

* `EMAIL_USER`
* `EMAIL_PASS`
* SMTP configuration
* Gmail App Password

Do not use your normal Gmail password when an app password is required.

### Google OAuth Error

For:

```text
redirect_uri_mismatch
```

make sure `GOOGLE_CALLBACK_URL` exactly matches the callback URL configured in Google Cloud Console.

---

# 🗺️ Roadmap

### Completed / Core

* [x] Category management
* [x] Product management
* [x] Authentication
* [x] Cart management
* [x] Wishlist management
* [x] Order management
* [x] Review system
* [x] Inventory management
* [x] Coupon system
* [x] Notifications
* [x] Admin dashboard

### Future Improvements

* [ ] React/Vite customer storefront
* [ ] React admin dashboard
* [ ] Product image upload
* [ ] Cloudinary integration
* [ ] Real-time notifications
* [ ] Swagger/OpenAPI documentation
* [ ] Automated API testing
* [ ] Docker deployment
* [ ] Production deployment
* [ ] Real payment gateway integration
* [ ] Supplier and purchase-order management
* [ ] Multi-warehouse inventory
* [ ] Live chat / FAQ support

---

