import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import AppRoutes from "./routes/AppRoutes";
import AuthModal from "./components/auth/AuthModal";
import CartToast from "./components/cart/CartToast";

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AuthModalProvider>
            <AppRoutes />
            <AuthModal />
            <CartToast />
          </AuthModalProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;