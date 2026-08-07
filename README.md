# Misge Lcd Phone managent system

A backend REST API built with **Node.js**, **Express**, and **MongoDB** for managing products, users, carts, orders, reviews, and wishlists.

---

## 🚀 Features

- Product CRUD operations
- User registration, login, and email verification
- Google OAuth login support
- Cart management
- Wishlist management
- Order creation and admin order management
- Review creation, update, and deletion
- Role-based access control for admins

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB / Mongoose
- Passport.js (Google OAuth)
- JSON Web Token (JWT)
- dotenv
- CORS
- nodemailer

---

## 📁 Project Structure

```
product-crud-api/
├── config/
│   ├── db.js
│   └── passport.js
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── reviewController.js
│   ├── userController.js
│   └── wishlistController.js
├── middleware/
│   ├── adminMiddleware.js
│   └── authMiddleware.js
├── models/
│   ├── Cart.js
│   ├── Order.js
│   ├── Product.js
│   ├── Review.js
│   ├── User.js
│   └── Wishlist.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── googleRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   ├── userRoutes.js
│   └── wishlistRoutes.js
├── utils/
│   └── sendEmail.js
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone repository
```bash
git clone https://github.com/your-username/product-crud-api.git
cd product-crud-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root with at least these values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

- `PORT` defaults to `5000` if not set.
- `MONGO_URI` should point to your MongoDB Atlas cluster or local MongoDB.
- `JWT_SECRET` signs authentication tokens.
- `EMAIL_USER` and `EMAIL_PASS` are used for sending verification/reset emails.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are required only if you use Google login.

### 4. Start the server
```bash
npm run dev
```

---

## 🚨 Available Scripts

- `npm start` — Run the server with Node
- `npm run dev` — Run the server with nodemon for auto-reload

---

## 📌 Main API Endpoints

Base URL: `http://localhost:5000`

### Authentication
- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login with email or username
- `POST /api/auth/verify-email` — verify user email
- `POST /api/auth/resend-verification` — resend verification code
- `POST /api/auth/forgot-password` — request password reset code
- `POST /api/auth/reset-password` — reset password with code
- `GET /api/auth/google` — start Google login
- `GET /api/auth/google/callback` — Google OAuth callback

### Products
- `GET /api/products` — list products
- `GET /api/products/:id` — get product details
- `POST /api/products` — create a product
- `PUT /api/products/:id` — update a product
- `DELETE /api/products/:id` — delete a product

### Users
- `PUT /api/users/me` — update own profile
- `GET /api/users` — admin: list users
- `GET /api/users/:id` — admin: get user by ID
- `PUT /api/users/:id/block` — admin: block/unblock user
- `PUT /api/users/:id/role` — admin: change user role
- `DELETE /api/users/:id` — admin: delete user

### Cart
- `GET /api/cart` — get logged-in user cart
- `POST /api/cart` — add item to cart
- `PUT /api/cart/:productId` — update cart item quantity
- `DELETE /api/cart/:productId` — remove item from cart
- `DELETE /api/cart` — clear cart

### Wishlist
- `GET /api/wishlist` — get wishlist
- `POST /api/wishlist` — add product to wishlist
- `DELETE /api/wishlist/:productId` — remove wishlist item

### Orders
- `POST /api/orders` — create order from cart
- `GET /api/orders/my-orders` — logged-in user orders
- `GET /api/orders/:id` — get order by ID
- `PUT /api/orders/:id/cancel` — cancel own order
- `GET /api/orders` — admin: list all orders
- `PUT /api/orders/:id/status` — admin: update order status

### Reviews
- `GET /api/reviews/product/:productId` — list product reviews
- `POST /api/reviews` — create review
- `PUT /api/reviews/:id` — update own review
- `DELETE /api/reviews/:id` — delete own review or admin delete

---

## 💡 Notes

- Make sure your `.env` values match the actual app requirements.
- The app uses ES modules, so all route and controller files are imported with `.js` file extensions.
- Restart the server after editing `.env` or code files.

---

## 🙋‍♂️ Troubleshooting

- If nodemon crashes on module import, ensure file exports/imports are consistent with ESM.
- If email sending fails, verify `EMAIL_USER` and `EMAIL_PASS` and enable less secure app access or an app-specific password.
- If Google login fails with `redirect_uri_mismatch`, update `GOOGLE_CALLBACK_URL` to exactly match the URI in your Google Cloud console.

---

## 📚 Learn More

This project is a solid starter for building APIs with Node.js, Express, and MongoDB and can be extended with frontend clients or additional authentication methods.
