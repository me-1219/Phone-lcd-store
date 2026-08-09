import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, LogOut } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { CUSTOMER_NAV_LINKS } from "../../utils/constants";
import { getDisplayName, getInitials } from "../../utils/getDisplayName";
import { useAuth } from "../../hooks/useAuth";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo — signature element: a small angled "glass" duo-tone mark,
              echoing a screen catching light, rather than a literal phone icon. */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-ink-950">
              <span className="absolute -left-2 top-0 h-full w-6 -skew-x-12 bg-linear-to-b from-brand-300 to-brand-600 opacity-90" />
              <span className="relative font-display text-sm font-bold text-white">ML</span>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink-950">
              Misgie <span className="text-brand-600">LCD</span>
            </span>
          </Link>

          {/* Desktop nav */}
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

          {/* Search — desktop only, mobile gets its own bar below header */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:block">
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
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950 sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-ink-950">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-ink-700 hover:bg-muted hover:text-ink-950"
                >
                  <User className="h-5 w-5" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <p className="truncate px-3 py-2 text-xs text-ink-500">
                      Signed in as <span className="font-medium text-ink-900">{getDisplayName(user)}</span>
                    </p>
                    <div className="my-1 border-t border-border" />
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-sm text-ink-900 hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger-500 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700 md:flex"
              >
                <User className="h-4 w-4" /> Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2.5 text-ink-700 hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <form onSubmit={handleSearch} className="border-t border-border px-4 py-2.5 md:hidden">
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

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;
