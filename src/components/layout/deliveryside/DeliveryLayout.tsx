import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Menu,
  X,
  User as UserIcon, // Aliased to prevent conflict
} from "lucide-react";
import simakLogo from "../../../assets/SIMAK FRESH FINAL LOGO-01 (1).png";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const DeliveryLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state: any) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation: NavItem[] = [
    { label: "Dashboard", path: "/delivery", icon: <LayoutDashboard size={20} /> },
    { label: "Available", path: "/delivery/available", icon: <Package size={20} /> },
    { label: "My Orders", path: "/delivery/my-orders", icon: <ShoppingBag size={20} /> },
  ];

  const isActive = (path: string) =>
    path === "/delivery"
      ? location.pathname === "/delivery"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* ─── Top Navbar ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/delivery" className="flex items-center gap-2.5">
            <img src={simakLogo} alt="Logo" className="h-8 w-8 object-contain" />
            <div>
              <p className="text-xs font-black tracking-tighter uppercase leading-none text-slate-800">
                {t('brand.name')}
              </p>
              <p className="text-[10px] text-cyan-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Truck size={10} /> Delivery
              </p>
            </div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Industry Style Profile Trigger */}
            <Link 
              to="/delivery/profile" 
              className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all border ${
                location.pathname === "/delivery/profile" 
                ? "bg-cyan-50 border-cyan-200 ring-4 ring-cyan-500/10" 
                : "bg-gray-50 border-gray-100 hover:border-gray-300"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-md">
                <UserIcon size={16} />
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Partner</p>
                <p className="text-xs font-bold text-gray-700">{user?.full_name?.split(' ')[0] || "Profile"}</p>
              </div>
            </Link>

            {/* Hamburger for mobile navigation */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 sm:hidden transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Menu Drawer ─── */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-300">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive(item.path) ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ─── Desktop Secondary Tab Nav ─── */}
      <nav className="hidden sm:flex bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 w-full">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
                isActive(item.path) 
                ? "border-cyan-600 text-cyan-600" 
                : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 mb-20 sm:mb-0">
        <Outlet />
      </main>

      {/* ─── Mobile Bottom Tab Bar (Standard for Delivery Apps) ─── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-40 flex items-center justify-around pb-6 pt-3 px-2">
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(item.path) ? "text-cyan-600 scale-110" : "text-gray-400 opacity-60"
            }`}
          >
            <div className={`p-2 rounded-xl ${isActive(item.path) ? "bg-cyan-50" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
        {/* Profile Tab in Bottom Bar */}
        <Link
          to="/delivery/profile"
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === "/delivery/profile" ? "text-cyan-600 scale-110" : "text-gray-400 opacity-60"
          }`}
        >
          <div className={`p-2 rounded-xl ${location.pathname === "/delivery/profile" ? "bg-cyan-50" : ""}`}>
            <UserIcon size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default DeliveryLayout;