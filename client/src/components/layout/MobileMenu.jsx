import { Link } from "react-router-dom";
import { X, User, LogOut } from "lucide-react";
import { CUSTOMER_NAV_LINKS } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";

const MobileMenu = ({ open, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-ink-950/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="font-display font-semibold text-ink-950">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-ink-500 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {CUSTOMER_NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t border-border" />

          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                onClick={onClose}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-muted"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              <User className="h-4 w-4" /> Login
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
