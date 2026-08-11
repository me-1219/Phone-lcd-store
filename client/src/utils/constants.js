// Centralized so nav/sidebar structure isn't duplicated across layout components.

export const CUSTOMER_NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Categories", to: "/categories" },
];

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", to: "/admin" },
  { label: "Products", to: "/admin/products" },
  { label: "Categories", to: "/admin/categories" },
  { label: "Inventory", to: "/admin/inventory" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Reviews", to: "/admin/reviews" },
  { label: "Coupons", to: "/admin/coupons" },
  { label: "Users", to: "/admin/users" },
];
export const BUSINESS_PHONE = "+251962725252"; // swap for your real number
export const BUSINESS_PHONE_DISPLAY = "0962725252";
export const TELEBIRR_MERCHANT_NUMBER = "0973921904";
// Matches the enum values on the Product model — kept here so filter UI
// and any select inputs pull from one source instead of hardcoded strings.
export const QUALITY_GRADES = ["Original", "OEM", "Copy", "Refurbished"];
export const SCREEN_TYPES = ["LCD", "OLED", "Incell"];

export const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Most Popular", value: "-numReviews" },
];

export const CURRENCY = "ETB";
