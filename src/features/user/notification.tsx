import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Tag, Info, CheckCircle, Trash2, ArrowLeft, Loader2, CheckCheck, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import useLanguageToggle from '../../hooks/useLanguageToggle';
import { useTranslation } from 'react-i18next';

// Notification Types
type NotificationType = 'order' | 'promo' | 'system';

interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    date: string;
    read: boolean;
    created_at?: string;
    action_url?: string | null;
}

/* ── API helpers ── */
const notificationsApi = {
    list: async (opts?: { limit?: number; offset?: number; is_read?: boolean | null }): Promise<{ results: Notification[]; next?: string | null; count?: number; total?: number; read?: number; unread?: number }> => {
        const params: Record<string, any> = {};
        if (opts?.limit != null) params.limit = opts.limit;
        if (opts?.offset != null) params.offset = opts.offset;
        if (typeof opts?.is_read === 'boolean') params.is_read = opts.is_read;
        const res = await api.get('/notifications/', { params });
        const data = res.data;
        const results = Array.isArray(data) ? data : (data.results || []);
        const next = Array.isArray(data) ? null : (data.next || null);
        const count = Array.isArray(data) ? results.length : (data.count ?? results.length);
        const total = Array.isArray(data) ? results.length : (data.total ?? count);
        const read = Array.isArray(data) ? results.filter((n: any) => n.is_read ?? n.read).length : (data.read ?? undefined);
        const unread = Array.isArray(data) ? results.filter((n: any) => !(n.is_read ?? n.read)).length : (data.unread ?? undefined);
        return { results, next, count, total, read, unread };
    },

    markAsRead: async (id: number) => {
        const res = await api.post(`/notifications/${id}/mark_as_read/`);
        return res.data;
    },

    markAllAsRead: async () => {
        const res = await api.post('/notifications/mark_all_as_read/');
        return res.data;
    },

    deleteNotification: async (id: number) => {
        await api.delete(`/notifications/${id}/`);
    },
};

/* ── Helper: format date for display ── */
function formatRelativeTime(dateStr: string | undefined, t: any, lang: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('notifications.justNow');
    if (diffMin < 60) return t('notifications.minAgo', { count: diffMin });
    if (diffHr < 24) return t('notifications.hourAgo', { count: diffHr });
    if (diffDay < 7) return t('notifications.dayAgo', { count: diffDay });

    const locale = lang === 'ar' ? 'ar-AE' : lang === 'cn' ? 'zh-CN' : 'en-AE';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

const NotificationPage: React.FC = () => {
    const navigate = useNavigate();
    const { isArabic } = useLanguageToggle();
    const { t, i18n } = useTranslation('common');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [limit] = useState<number>(20);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const loadMoreRef = React.useRef<HTMLDivElement>(null);
    const [serverCounts, setServerCounts] = useState<{ total: number; read: number; unread: number } | null>(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async (reset: boolean = false) => {
        try {
            const is_read = filter === 'unread' ? false : filter === 'read' ? true : null;
            const pageOffset = reset ? 0 : notifications.length;
            const { results, next, total, read, unread } = await notificationsApi.list({ limit, offset: pageOffset, is_read });
            if (reset && total != null && read != null && unread != null) {
                setServerCounts({ total, read, unread });
            }
            const mapped = results.map((n: any) => ({
                ...n,
                type: n.type || 'system',
                read: n.read ?? n.is_read ?? false,
                date: n.date || formatRelativeTime(n.created_at, t, i18n.language),
                action_url: n.action_url || null,
            }));
            if (reset) setNotifications(mapped);
            else setNotifications(prev => [...prev, ...mapped]);
            setHasMore(Boolean(next) || mapped.length === limit);
        } catch {
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [filter, limit, notifications.length]);

    useEffect(() => {
        setLoading(true);
        setHasMore(true);
        fetchNotifications(true);
    }, [filter]);

    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading && !isLoadingMore) {
                setIsLoadingMore(true);
                fetchNotifications(false).finally(() => setIsLoadingMore(false));
            }
        }, { root: null, rootMargin: '200px', threshold: 0 });
        io.observe(el);
        return () => io.disconnect();
    }, [hasMore, loading, isLoadingMore, filter, limit]);

    // Mark single as read
    const markAsRead = async (id: number) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification || notification.read) return;

        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setServerCounts(prev => prev ? { ...prev, read: prev.read + 1, unread: Math.max(0, prev.unread - 1) } : null);
        } catch {
            // ignore
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setServerCounts(prev => prev ? { ...prev, read: prev.total, unread: 0 } : null);
        } catch {
            // ignore
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteNotification = async (id: number) => {
        const notification = notifications.find(n => n.id === id);
        try {
            await notificationsApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notification) {
                setServerCounts(prev => {
                    if (!prev) return null;
                    const wasUnread = !notification.read;
                    return {
                        total: Math.max(0, prev.total - 1),
                        read: wasUnread ? prev.read : Math.max(0, prev.read - 1),
                        unread: wasUnread ? Math.max(0, prev.unread - 1) : prev.unread,
                    };
                });
            }
        } catch {
            // leave notification visible if delete failed
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'order': return <Package size={20} className="text-amber-500" />;
            case 'promo': return <Tag size={20} className="text-rose-500" />;
            case 'system': return <Info size={20} className="text-slate-500" />;
            default: return <Bell size={20} className="text-amber-500" />;
        }
    };

    const hasUnread = (serverCounts?.unread ?? notifications.filter(n => !n.read).length) > 0;
    const unreadCount = serverCounts?.unread ?? notifications.filter(n => !n.read).length;
    const readCount = serverCounts?.read ?? notifications.filter(n => n.read).length;
    const totalCount = serverCounts?.total ?? notifications.length;
    const filtered = useMemo(() => {
        if (filter === 'unread') return notifications.filter(n => !n.read);
        if (filter === 'read') return notifications.filter(n => n.read);
        return notifications;
    }, [notifications, filter]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-800 pb-20 overflow-x-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Bell size={20} /> {t('notifications.title', 'Notifications')}
                        </h1>
                    </div>
                    {hasUnread && (
                        <button
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors disabled:opacity-50"
                        >
                            {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={14} />}
                            {t('notifications.markAllRead', 'Mark all read')}
                        </button>
                    )}
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full overflow-x-hidden">
                {/* Filter Pills */}
                <div className="mb-6">
                    <div className="inline-flex bg-slate-100/60 p-1 rounded-xl border border-slate-200 max-w-full">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3.5 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                            title={t('notifications.showAll', 'Show all notifications')}
                        >
                            <Bell size={14} /> {t('notifications.all', 'All')}
                            <span className={`${isArabic ? 'mr-1' : 'ml-1'} inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md text-[10px] font-black bg-white border border-slate-200 text-slate-700`}>{totalCount}</span>
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3.5 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-colors ${filter === 'unread' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                            title={t('notifications.showUnread', 'Show unread')}
                        >
                            <CircleDot size={14} className="text-rose-500" /> {t('notifications.unread', 'Unread')}
                            <span className={`${isArabic ? 'mr-1' : 'ml-1'} inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md text-[10px] font-black bg-white border border-slate-200 text-slate-700`}>{unreadCount}</span>
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-3.5 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-colors ${filter === 'read' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                            title={t('notifications.showRead', 'Show read')}
                        >
                            <CheckCheck size={14} className="text-emerald-600" /> {t('notifications.read', 'Read')}
                            <span className={`${isArabic ? 'mr-1' : 'ml-1'} inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md text-[10px] font-black bg-white border border-slate-200 text-slate-700`}>{readCount}</span>
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-slate-300 mb-3" />
                        <p className="text-sm text-slate-400 font-medium">{t('notifications.loading', 'Loading notifications…')}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{filter === 'all' ? t('notifications.emptyAll', 'No notifications yet') : filter === 'unread' ? t('notifications.emptyUnread', 'No unread notifications') : t('notifications.emptyRead', 'No read notifications')}</h3>
                        <p className="text-slate-500 text-sm">{filter === 'all' ? t('notifications.emptyHintAll', "We'll let you know when something important happens.") : t('notifications.emptyHintOther', 'Try switching filters or check back later.')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filtered.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    className={`relative bg-white rounded-2xl p-5 border transition-all hover:shadow-md group ${
                                        notification.read ? 'border-slate-100' : 'border-rose-100 bg-rose-50/10 cursor-pointer'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            notification.read ? 'bg-slate-50' : 'bg-white shadow-sm'
                                        }`}>
                                            {getIcon(notification.type)}
                                        </div>

                                        {/* Ensure text never overlaps with the absolute buttons */}
                                        <div className={`flex-1 ${isArabic ? 'pl-14 sm:pl-0' : 'pr-14 sm:pr-0'}`}>
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-sm font-bold ${isArabic ? 'pl-4 sm:pl-0' : 'pr-4 sm:pr-0'} ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{notification.date}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ✅ Actions (Absolute corner to preserve card height) */}
                                    <div className={`absolute bottom-4 ${isArabic ? 'left-4' : 'right-4'} flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300`}>
                                        {notification.action_url && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const url = String(notification.action_url || '').trim();
                                                    if (!url) return;
                                                    if (!notification.read) markAsRead(notification.id);
                                                    if (/^https?:\/\//i.test(url)) {
                                                        window.location.href = url;
                                                    } else if (url.startsWith('/')) {
                                                        navigate(url);
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-white text-violet-600 rounded-lg shadow-sm border border-slate-100 hover:bg-violet-50 transition-colors text-[10px] font-bold"
                                                title={t('notifications.open')}
                                            >
                                                {t('notifications.open')}
                                            </button>
                                        )}
                                        {!notification.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                className="p-1.5 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100 hover:bg-emerald-50 transition-colors"
                                                title={t('notifications.markRead', 'Mark as Read')}
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="p-1.5 bg-white text-slate-400 rounded-lg shadow-sm border border-slate-100 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            title={t('notifications.delete', 'Delete')}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Unread indicator dot */}
                                    {!notification.read && (
                                        <span className={`absolute top-5 ${isArabic ? 'left-5' : 'right-5'} w-2 h-2 bg-rose-500 rounded-full`} />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={loadMoreRef} className="h-8" />
                        {isLoadingMore && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 size={20} className="animate-spin text-slate-300" />
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationPage;
