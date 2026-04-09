import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../features/auth/authSlice";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Truck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import simakLogo from "../../../assets/SIMAK FRESH FINAL SVG-01.svg";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const DeliveryLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const navigation: NavItem[] = [
    { label: "Dashboard", path: "/delivery", icon: <LayoutDashboard size={18} /> },
    { label: "Available Orders", path: "/delivery/available", icon: <Package size={18} /> },
    { label: "My Orders", path: "/delivery/my-orders", icon: <ShoppingBag size={18} /> },
  ];

  const isActive = (path: string) =>
    path === "/delivery"
      ? location.pathname === "/delivery"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── Header ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center">
              <img src={simakLogo} alt="SIMAK" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide uppercase leading-none">SIMAK FRESH</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                <Truck size={9} /> Delivery Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">
              {user?.full_name || user?.email}
            </span>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ─── Mobile nav drawer ─── */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-3 max-w-2xl mx-auto space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ─── Bottom nav (desktop) ─── */}
      <nav className="hidden sm:flex bg-white border-b border-gray-100 sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-1 w-full">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive(item.path)
                  ? "border-cyan-600 text-cyan-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* ─── Page content ─── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* ─── Mobile bottom tab bar ─── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-medium gap-1 transition-colors ${
              isActive(item.path) ? "text-cyan-700" : "text-gray-400"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DeliveryLayout;
