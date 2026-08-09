import { Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Customer pages
import Home from "../pages/customer/Home";
import Products from "../pages/customer/Products";
import ProductDetails from "../pages/customer/ProductDetails";
import Categories from "../pages/customer/Categories";
import Cart from "../pages/customer/Cart";
import Wishlist from "../pages/customer/Wishlist";
import Checkout from "../pages/customer/Checkout";
import Orders from "../pages/customer/Orders";
import OrderDetails from "../pages/customer/OrderDetails";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Admin pages
import Dashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import AdminCategories from "../pages/admin/Categories";
import AdminInventory from "../pages/admin/Inventory";
import AdminOrders from "../pages/admin/Orders";
import AdminReviews from "../pages/admin/Reviews";
import AdminCoupons from "../pages/admin/Coupons";
import AdminUsers from "../pages/admin/Users";
import AdminProfile from "../pages/admin/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Everything here gets CustomerLayout (navbar + footer) */}
      <Route element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="categories" element={<Categories />} />

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
        </Route>
      </Route>

      {/* Admin block is a SEPARATE top-level route — sibling of the
          CustomerLayout route above, NOT nested inside it. This is what
          keeps the customer navbar/footer off every /admin/* page. */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;