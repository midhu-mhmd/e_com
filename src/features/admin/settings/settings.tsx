import React, { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  UploadCloud,
  X,
  Save,
  Image as ImageIcon,
  ChevronRight,
  Settings,
  Bell,
  Globe,
  Check,
  CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminNotificationApi, type AdminNotificationDto } from "../notifications/adminNotificationApi";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("banners");

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-[#18181B] font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-[#EEEEEE] flex flex-col p-6 space-y-1 hidden md:flex">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A1A1AA] mb-4 px-3">Storefront Settings</h2>
        <TabButton icon={<Settings size={16} />} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
        <TabButton icon={<ImageIcon size={16} />} label="Hero Banners" active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} />
        <TabButton icon={<Bell size={16} />} label="Notifications" active={activeTab === 'notif'} onClick={() => setActiveTab('notif')} />
        <TabButton icon={<Globe size={16} />} label="Regions" active={activeTab === 'regions'} onClick={() => setActiveTab('regions')} />
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-5xl overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-black tracking-tight italic">Settings</h1>
          <p className="text-[#71717A] text-sm mt-1">Configure your storefront appearance and banners.</p>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "banners" && <BannerSettingsView />}
          {activeTab === "notif" && <NotificationSettingsView />}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* --- BANNER SETTINGS VIEW --- */
const BannerSettingsView = () => {
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      type === 'desktop' ? setDesktopPreview(url) : setMobilePreview(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      {/* 1. CONTENT CONFIG */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#EEEEEE] pb-4">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg font-mono text-xs">01</div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Banner Content</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <InputGroup label="Tag Line" placeholder="e.g. Fresh Catch" />
          <InputGroup label="Main Title" placeholder="e.g. Premium Lobsters" />
          <InputGroup label="CTA Button Text" placeholder="e.g. Shop Now" />
          <InputGroup label="Redirect Link" placeholder="e.g. /category/seafood" />
        </div>
      </section>

      {/* 2. MEDIA UPLOAD */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-[#EEEEEE] pb-4">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg font-mono text-xs">02</div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Visual Assets</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Desktop Banner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A] flex items-center gap-2">
                <Monitor size={14} /> Desktop Version
              </label>
              <span className="text-[9px] text-[#A1A1AA]">1920 x 600px recommended</span>
            </div>

            <div className={`relative h-56 rounded-2xl border-2 border-dashed border-[#E4E4E7] bg-[#FAFAFA] flex flex-col items-center justify-center transition-all hover:bg-white hover:border-black group overflow-hidden ${desktopPreview ? 'p-0 border-none shadow-xl' : 'p-8'}`}>
              {desktopPreview ? (
                <>
                  <img src={desktopPreview} className="w-full h-full object-cover" alt="Desktop Preview" />
                  <button onClick={() => setDesktopPreview(null)} className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-all"><X size={16} /></button>
                </>
              ) : (
                <>
                  <UploadCloud className="text-[#D4D4D8] mb-3 group-hover:text-black transition-colors" size={32} strokeWidth={1.5} />
                  <p className="text-xs font-bold">Drop desktop banner here</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFile(e, 'desktop')} />
                </>
              )}
            </div>
          </div>

          {/* Mobile Banner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A] flex items-center gap-2">
                <Smartphone size={14} /> Mobile Version
              </label>
              <span className="text-[9px] text-[#A1A1AA]">800 x 1000px recommended</span>
            </div>

            <div className={`relative h-56 rounded-2xl border-2 border-dashed border-[#E4E4E7] bg-[#FAFAFA] flex flex-col items-center justify-center transition-all hover:bg-white hover:border-black group overflow-hidden ${mobilePreview ? 'p-0 border-none shadow-xl' : 'p-8'}`}>
              {mobilePreview ? (
                <>
                  <img src={mobilePreview} className="w-full h-full object-cover" alt="Mobile Preview" />
                  <button onClick={() => setMobilePreview(null)} className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-rose-50 hover:text-white transition-all"><X size={16} /></button>
                </>
              ) : (
                <>
                  <UploadCloud className="text-[#D4D4D8] mb-3 group-hover:text-black transition-colors" size={32} strokeWidth={1.5} />
                  <p className="text-xs font-bold">Drop mobile banner here</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFile(e, 'mobile')} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <footer className="pt-10 border-t border-[#EEEEEE] flex justify-end gap-4">
        <button className="px-6 py-3 text-xs font-bold text-[#71717A] hover:text-black transition-colors">Discard</button>
        <button className="px-8 py-3 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#222] transition-all shadow-lg hover:shadow-black/10">
          <Save size={14} /> Save Changes
        </button>
      </footer>
    </motion.div>
  );
};

/* --- NOTIFICATIONS SETTINGS VIEW --- */
const NotificationSettingsView = () => {
  const [notifications, setNotifications] = useState<AdminNotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminNotificationApi.list();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch admin notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await adminNotificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
            <Bell size={20} /> System Notifications
          </h3>
          <p className="text-sm text-[#71717A] mt-1">Manage and review your administrative alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-2"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-[#FAFAFA] rounded-full flex items-center justify-center border border-[#EEEEEE]">
            <Bell size={32} className="text-[#A1A1AA]" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-black">No Notifications</h4>
            <p className="text-[#71717A] text-sm mt-1">You're all caught up! There are no new alerts.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEEE] rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-[#EEEEEE]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-5 transition-colors group ${notification.is_read ? 'bg-white' : 'bg-blue-50/20'}`}
              >
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    {!notification.is_read ? (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm mt-1.5" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-base ${!notification.is_read ? 'font-black text-black' : 'font-semibold text-[#71717A]'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-[#71717A] mt-1 max-w-2xl leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[10px] font-bold text-[#A1A1AA] mt-2 block uppercase tracking-wider">
                      {new Date(notification.created_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#EEEEEE] text-[#71717A] hover:text-blue-600 hover:border-blue-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Mark as read"
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/* --- UI HELPERS --- */
const TabButton = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-white shadow-sm border border-[#EEEEEE] text-black' : 'text-[#71717A] hover:bg-gray-50'}`}
  >
    <div className="flex items-center gap-3">
      <span className={active ? 'text-black' : 'text-[#A1A1AA]'}>{icon}</span>
      <span className="text-xs font-bold tracking-tight">{label}</span>
    </div>
    {active && <ChevronRight size={12} className="text-[#A1A1AA]" />}
  </button>
);

const InputGroup = ({ label, placeholder }: { label: string, placeholder: string }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA] ml-1">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-[#FAFAFA] border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:font-normal placeholder:text-[#D4D4D8]"
    />
  </div>
);

export default SettingsPage;