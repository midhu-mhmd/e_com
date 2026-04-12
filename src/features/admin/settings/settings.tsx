import React, { useState } from "react";
import {
  ChevronRight,
  Gift,
  Truck,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RewardSettings } from "../marketing/RewardSettings";
import { DeliveryChargeSettings } from "./DeliveryChargeSettings";
import { DeliveryTimeslotsSettings } from "./DeliveryTimeslotsSettings";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("rewards");

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-[#18181B] font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-[#EEEEEE] hidden md:flex flex-col p-6 space-y-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A1A1AA] mb-4 px-3">Storefront Settings</h2>
        <TabButton icon={<Gift size={16} />} label="Rewards" active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} />
        <TabButton icon={<Truck size={16} />} label="Delivery" active={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')} />
        <TabButton icon={<Clock size={16} />} label="Timeslots" active={activeTab === 'timeslots'} onClick={() => setActiveTab('timeslots')} />
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 sm:p-6 md:p-12 lg:p-16 max-w-5xl overflow-y-auto w-full">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight italic">Settings</h1>
          <p className="text-[#71717A] text-sm mt-1">Configure your storefront settings.</p>
        </header>

        {/* --- MOBILE TABS --- */}
        <div className="flex md:hidden gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none snap-x active:cursor-grabbing">
          <TabButtonMobile icon={<Gift size={16} />} label="Rewards" active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} />
          <TabButtonMobile icon={<Truck size={16} />} label="Delivery" active={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')} />
          <TabButtonMobile icon={<Clock size={16} />} label="Timeslots" active={activeTab === 'timeslots'} onClick={() => setActiveTab('timeslots')} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "rewards" && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RewardSettings />
            </motion.div>
          )}
          {activeTab === "delivery" && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DeliveryChargeSettings />
            </motion.div>
          )}
          {activeTab === "timeslots" && (
            <motion.div
              key="timeslots"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DeliveryTimeslotsSettings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
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

const TabButtonMobile = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${active ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-[#EEEEEE]'}`}
  >
    {icon}
    {label}
  </button>
);

export default SettingsPage;