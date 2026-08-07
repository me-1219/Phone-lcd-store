# Product CRUD API

A simple backend REST API built with **Node.js**, **Express**, and **MongoDB** for managing products. This repository includes a clean project structure for CRUD operations and a MongoDB Atlas connection.

---

## 🚀 Features

- Create a product
- Read all products
- Read one product by ID
- Update product details
- Delete a product
- MongoDB Atlas connection via `mongoose`

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- CORS

---

## 📁 Project Structure

```
product-crud-api/
├── config/
│   └── db.js
├── controllers/
│   └── productController.js
├── models/
│   └── Product.js
├── routes/
│   └── productRoutes.js
├── server.js
├── .env
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
Create a `.env` file in the project root with the following values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

- `PORT` is optional and defaults to `5000`.
- `MONGO_URI` should point to your MongoDB Atlas cluster.

### 4. Start the development server
```bash
npm run dev
```

---

## 🚨 Available Scripts

- `npm start` - Start the server with Node
- `npm run dev` - Start the server with nodemon for auto-reload

---

## 📌 API Endpoints

Base URL: `http://localhost:5000/api/products`

### Create product
- Method: `POST`
- URL: `/api/products`
- Body example:
  ```json
  {
    "name": "Product Name",
    "price": 19.99,
    "description": "Product description"
  }
  ```

### Get all products
- Method: `GET`
- URL: `/api/products`

### Get single product
- Method: `GET`
- URL: `/api/products/:id`

### Update product
- Method: `PUT`
- URL: `/api/products/:id`
- Body example:
  ```json
  {
    "name": "Updated Name",
    "price": 24.99
  }
  ```

### Delete product
- Method: `DELETE`
- URL: `/api/products/:id`

---

## 💡 Notes

- Ensure MongoDB Atlas access is configured for your IP address.
- Use a valid MongoDB connection string; avoid unsupported query parameters.
- If your environment variables change, restart the server.

---

## 🙋‍♂️ Troubleshooting

- `MongoParseError: option node_api is not supported` means your `MONGO_URI` includes an invalid option.
- `Error connecting to MongoDB` usually indicates a bad URI or network issue.

---

## 📚 Learn More

This project is ideal as a starter API for learning Express and MongoDB CRUD operations.
