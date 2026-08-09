import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ClipboardList,
  Star,
  Ticket,
  Users,
  Menu,
  X,
  LogOut,
  Store,
} from "lucide-react";
import { ADMIN_NAV_LINKS } from "../utils/constants";
import { useAuth } from "../hooks/useAuth";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/products": Package,
  "/admin/categories": FolderTree,
  "/admin/inventory": Boxes,
  "/admin/orders": ClipboardList,
  "/admin/reviews": Star,
  "/admin/coupons": Ticket,
  "/admin/users": Users,
};

const SidebarLinks = ({ onNavigate }) => {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {ADMIN_NAV_LINKS.map((link) => {
        const Icon = ICONS[link.to];
        const isActive =
          link.to === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(link.to);

        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-600 text-white"
                : "text-ink-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-950 py-5 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-5 pb-6">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10">
            <span className="absolute -left-2 top-0 h-full w-6 -skew-x-12 bg-gradient-to-b from-brand-300 to-brand-500 opacity-90" />
            <span className="relative font-display text-sm font-bold text-white">M</span>
          </span>
          <div>
            <p className="font-display text-sm font-semibold leading-tight text-white">
              Misgie LCD
            </p>
            <p className="text-xs text-ink-300">Admin Panel</p>
          </div>
        </Link>

        <SidebarLinks />

        <div className="mt-auto flex flex-col gap-1 px-3 pt-5">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> View Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink-950 py-5">
            <div className="flex items-center justify-between px-5 pb-6">
              <span className="font-display text-sm font-semibold text-white">
                Misgie LCD Admin
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-ink-300 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Admin header */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-white px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-ink-700 hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-semibold text-ink-950">
            Admin Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-2 text-sm text-ink-500">
            <span className="hidden sm:inline">Signed in as</span>
            <span className="font-medium text-ink-950">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
