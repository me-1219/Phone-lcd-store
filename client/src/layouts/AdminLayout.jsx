import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ClipboardList,
  Star,
  Ticket,
  Users,
  User,
  Menu,
  X,
  LogOut,
  Store,
  ChevronDown,
} from "lucide-react";
import { ADMIN_NAV_LINKS } from "../utils/constants";
import { useAuth } from "../hooks/useAuth";
import { getDisplayName, getInitials } from "../utils/getDisplayName";
import Badge from "../components/common/Badge";

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

const ROLE_VARIANT = { admin: "brand", staff: "amber", user: "neutral" };

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

const ProfileMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 hover:bg-muted"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {getInitials(user)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-ink-950">
            {getDisplayName(user)}
          </span>
          <span className="block text-xs leading-tight text-ink-500">{user?.email}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-white py-1.5 shadow-lg">
          <div className="border-b border-border px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-ink-950">{getDisplayName(user)}</p>
              {user?.role && (
                <Badge variant={ROLE_VARIANT[user.role] || "neutral"} className="shrink-0">
                  {user.role}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <Link
          to="/admin/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-900 hover:bg-muted"
        >
          <User className="h-4 w-4 text-ink-500" /> My Profile
        </Link>

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-900 hover:bg-muted"
          >
            <Store className="h-4 w-4 text-ink-500" /> View Store
          </Link>

          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-danger-500 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-950 py-5 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-5 pb-6">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10">
            <span className="absolute -left-2 top-0 h-full w-6 -skew-x-12 bg-linear-to-b from-brand-300 to-brand-500 opacity-90" />
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

        <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-5 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
            {getInitials(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{getDisplayName(user)}</p>
            <p className="truncate text-xs text-ink-300">{user?.email}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1 px-3">
       
         {/*  <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> View Store
          </Link> */}
          <button
            onClick={handleLogout}
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

            <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-5 pt-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                {getInitials(user)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{getDisplayName(user)}</p>
                <p className="truncate text-xs text-ink-300">{user?.email}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
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

          <div className="ml-auto">
            <ProfileMenu user={user} onLogout={handleLogout} />
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