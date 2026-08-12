
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  LogOut,
  Phone,
} from "lucide-react";

import MobileMenu from "./MobileMenu";
import {
  CUSTOMER_NAV_LINKS,
  BUSINESS_PHONE,
  BUSINESS_PHONE_DISPLAY,
} from "../../utils/constants";
import { getDisplayName } from "../../utils/getDisplayName";
import { useAuth } from "../../hooks/useAuth";
import { CartContext } from "../../context/CartContext";
import NotificationBell from "./NotificationBell";
import { useAuthModal } from "../../hooks/useAuthModal.js";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { openLogin } = useAuthModal();

  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, bump } = useContext(CartContext);
  const [bouncing, setBouncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (bump === 0) return;
    setBouncing(true);
    const timer = setTimeout(() => setBouncing(false), 400);
    return () => clearTimeout(timer);
  }, [bump]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchValue.trim()) {
      navigate(
        `/products?q=${encodeURIComponent(searchValue.trim())}`
      );
    }
  };

  return (
    <>
      {/* Contact bar - desktop only */}
      <div className="hidden bg-linear-to-r from-ink-950 via-ink-900 to-brand-700 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-4 py-2 sm:px-6 lg:px-8">
          <a
            href={`tel:${BUSINESS_PHONE}`}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-300 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5" />
            {BUSINESS_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
          >
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-ink-950">
              <span className="absolute -left-2 top-0 h-full w-6 -skew-x-12 bg-linear-to-b from-brand-300 to-brand-600 opacity-90" />

              <span className="relative font-display text-sm font-bold text-white">
                ML
              </span>
            </span>

            <span className="font-display text-lg font-semibold tracking-tight text-ink-950">
              Misgie <span className="text-brand-600">LCD</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {CUSTOMER_NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-muted hover:text-ink-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            className="hidden max-w-md flex-1 md:block"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by model, brand, part..."
                className="h-10 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm placeholder:text-ink-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1">
            {/* Mobile click-to-call */}
            <a
              href={`tel:${BUSINESS_PHONE}`}
              aria-label="Call us"
              className="flex rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950 md:hidden"
            >
              <Phone className="h-5 w-5" />
            </a>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950 sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950"
            >
              <ShoppingCart className={`h-5 w-5 ${bouncing ? "animate-cart-bump" : ""}`} />

              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-ink-950">
                  {itemCount}
                </span>
              )}
            </Link>
        <NotificationBell />

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() =>
                    setUserMenuOpen((v) => !v)
                  }
                  className="flex items-center gap-2 rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950"
                >
                  <User className="h-5 w-5" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg"
                    onMouseLeave={() =>
                      setUserMenuOpen(false)
                    }
                  >
                    <p className="truncate px-3 py-2 text-xs text-ink-500">
                      Signed in as{" "}
                      <span className="font-medium text-ink-900">
                        {getDisplayName(user)}
                      </span>
                    </p>

                    <div className="my-1 border-t border-border" />

                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-sm text-ink-900 hover:bg-muted"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                    >
                      My Orders
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger-500 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
              onClick={openLogin}
              className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700 md:flex"
            >
              <User className="h-4 w-4" /> Login
            </button>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2.5 text-ink-700 hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <form
          onSubmit={handleSearch}
          className="border-t border-border px-4 py-2.5 md:hidden"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by model, brand, part..."
              className="h-10 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm placeholder:text-ink-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
};

export default Navbar;

