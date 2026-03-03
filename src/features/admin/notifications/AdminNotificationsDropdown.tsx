import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { adminNotificationApi, type AdminNotificationDto } from './adminNotificationApi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNotificationsDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<AdminNotificationDto[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const data = await adminNotificationApi.list();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch admin notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Polling every few minutes
        const interval = setInterval(fetchNotifications, 60000 * 5); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="text-[#A1A1AA] hover:text-black relative transition-colors focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={18} strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right flex flex-col max-h-[85vh]"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                <p className="text-xs text-gray-500 mt-0.5">You have {unreadCount} unread messages</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <CheckCheck size={14} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-3">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Bell size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors group relative ${notification.is_read ? 'opacity-70' : 'bg-blue-50/30'}`}
                                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                        >
                                            {!notification.is_read && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-r-full transition-all group-hover:h-8 h-full" />
                                            )}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className={`flex-1 ${!notification.is_read ? 'pl-2' : ''}`}>
                                                    <h4 className={`text-sm tracking-tight ${!notification.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] font-medium text-gray-400 mt-2 block uppercase tracking-wider">
                                                        {new Date(notification.created_at).toLocaleString(undefined, {
                                                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 5 && (
                            <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                                <span className="text-xs font-semibold text-gray-500">End of notifications</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminNotificationsDropdown;
