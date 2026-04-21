import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Search, Filter, Download, ListFilter,
    Eye, EyeOff, X, Tag, Box, IndianRupee, TrendingUp, Columns3,
    Clock, Trash2, MessageSquare, Calendar, User, Check, Gift, RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import { useToast } from "../../../components/ui/Toast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { QuickStat } from "../../../components/ui/QuickStat";
import { Pagination } from "../../../components/ui/Pagination";
import {
    fetchCouponsRequest,
    fetchCouponStatsRequest,
    selectCoupons,
    selectCouponStats,
    selectCouponsLoading,
    selectCouponsError,
    selectCouponsTotal,
    softDeleteCouponRequest,
    restoreCouponRequest,
    deleteCouponRequest,
    updateCouponRequest,
} from "./couponsSlice";
import type { Coupon } from "./couponsSlice";
import { formatDate } from "../../../utils/date";

/* --- Column definitions --- */
type ColumnKey =
    | "id"
    | "code"
    | "description"
    | "discount"
    | "validity"
    | "status"
    | "usage"
    | "assignedUser"
    | "type"
    | "createdAt"
    | "actions";

interface ColumnDef {
    key: ColumnKey;
    label: string;
    icon?: React.ReactNode;
    alwaysVisible?: boolean;
    defaultVisible: boolean;
}

const COLUMNS: ColumnDef[] = [
    { key: "id", label: "ID", icon: <Tag size={14} />, alwaysVisible: true, defaultVisible: true },
    { key: "code", label: "Code", icon: <Box size={14} />, alwaysVisible: true, defaultVisible: true },
    { key: "description", label: "Description", icon: <MessageSquare size={14} />, defaultVisible: true },
    { key: "discount", label: "Discount", icon: <IndianRupee size={14} />, defaultVisible: true },
    { key: "validity", label: "Validity", icon: <Calendar size={14} />, defaultVisible: true },
    { key: "status", label: "Status", icon: <Eye size={14} />, defaultVisible: true },
    { key: "usage", label: "Usage", icon: <TrendingUp size={14} />, defaultVisible: true },
    { key: "assignedUser", label: "Assigned User", icon: <User size={14} />, defaultVisible: true },
    { key: "type", label: "Type", icon: <Tag size={14} />, defaultVisible: true },
    { key: "createdAt", label: "Created At", icon: <Clock size={14} />, defaultVisible: false },
    { key: "actions", label: "Actions", icon: <ListFilter size={14} />, alwaysVisible: true, defaultVisible: true },
];

/* --- MAIN COMPONENT --- */
const CouponManagement: React.FC = () => {
    const dispatch = useDispatch();
    const toast = useToast();

    const coupons = useSelector(selectCoupons);
    const stats = useSelector(selectCouponStats);
    const totalCount = useSelector(selectCouponsTotal);
    const loading = useSelector(selectCouponsLoading);
    const error = useSelector(selectCouponsError);

    const [activeTab, _setActiveTab] = useState<"list">("list");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Deleted">("All");
    const [discountTypeFilter, setDiscountTypeFilter] = useState<"All" | "percentage" | "fixed">("All");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const debouncedSearch = useDebounce(searchTerm, 2000);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<number | null>(null);
    const [isHardDelete, setIsHardDelete] = useState(false);

    // Column visibility
    const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => {
        const init: Record<string, boolean> = {};
        COLUMNS.forEach((c) => (init[c.key] = c.defaultVisible));
        return init as Record<ColumnKey, boolean>;
    });
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const columnsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
                setIsColumnsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleColumn = (key: ColumnKey) => {
        const col = COLUMNS.find((c) => c.key === key);
        if (col?.alwaysVisible) return;
        setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isVisible = (key: ColumnKey) => visibleColumns[key];

    const couponsQuery = useMemo(
        () => ({
            search: debouncedSearch || undefined,
            is_active: statusFilter === "All" || statusFilter === "Deleted" ? undefined : statusFilter === "Active",
            discount_type: discountTypeFilter === "All" ? undefined : discountTypeFilter,
            ordering: "-created_at",
            page,
            limit,
            offset: (page - 1) * limit,
        }),
        [debouncedSearch, statusFilter, discountTypeFilter, page, limit]
    );

    useEffect(() => {
        if (activeTab === "list") {
            dispatch(fetchCouponsRequest(couponsQuery));
            dispatch(fetchCouponStatsRequest());
        }
    }, [dispatch, couponsQuery, activeTab]);

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setDiscountTypeFilter("All");
        setPage(1);
    };

    const handleSoftDeleteCoupon = (id: number) => {
        setCouponToDelete(id);
        setIsHardDelete(false);
        setIsConfirmModalOpen(true);
    };

    const handleRestoreCoupon = (id: number) => {
        dispatch(restoreCouponRequest(id));
        toast.success("Coupon restored successfully!");
    };

    const handleToggleActive = (coupon: Coupon) => {
        dispatch(updateCouponRequest({ id: coupon.id, payload: { is_active: !coupon.is_active } }));
        toast.success(coupon.is_active ? "Coupon deactivated." : "Coupon activated.");
    };

    const handleHardDeleteCoupon = (id: number) => {
        setCouponToDelete(id);
        setIsHardDelete(true);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (couponToDelete !== null) {
            if (isHardDelete) {
                dispatch(deleteCouponRequest(couponToDelete));
                toast.success("Coupon permanently deleted!");
            } else {
                dispatch(softDeleteCouponRequest(couponToDelete));
                toast.success("Coupon moved to trash!");
            }
            setIsConfirmModalOpen(false);
            setCouponToDelete(null);
        }
    };

    // Export handler
    const handleExport = () => {
        const headers = COLUMNS.filter(c => c.key !== "actions").map(c => c.label);
        const rows = coupons.map((c: Coupon) => [
            c.id,
            c.code,
            c.description,
            `${c.discount_value} ${c.discount_type === "percentage" ? "%" : "AED"}`,
            `${formatDate(c.valid_from)} - ${c.valid_to ? formatDate(c.valid_to) : "No End Date"}`,
            c.deleted_at ? "Deleted" : (c.is_active ? "Active" : "Inactive"),
            `${c.used_count}/${c.usage_limit || "∞"}`,
            c.assigned_user_email || "N/A",
            c.is_referral_reward ? "Referral" : (c.is_first_order_reward ? "First Order" : "Standard"),
            formatDate(c.created_at),
        ]);
        const csvContent = [
            headers.join(","),
            ...rows.map((r: any[]) => r.map((c: any) => {
                const val = String(c || "");
                return val.includes(',') ? `"${val}"` : val;
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `coupons_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen w-full space-y-6 text-[#18181B] bg-[#FDFDFD]">
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Coupons & Rewards</h1>
                    <p className="text-[#71717A] text-sm mt-1">Manage discount codes and reward configurations.</p>
                </div>
                <div className="flex gap-3">
                </div>
            </div>

            {activeTab === "list" && (
                <>
                    {/* --- STATS OVERVIEW --- */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <QuickStat
                            label="Total Coupons"
                            value={`${stats?.total_coupons || totalCount}`}
                            sub="All coupons created"
                            icon={<Tag size={16} className="text-[#A1A1AA]" />}
                        />
                        <QuickStat
                            label="Active Now"
                            value={`${stats?.active_coupons || 0}`}
                            sub="Currently usable"
                            icon={<Eye size={16} className="text-emerald-500" />}
                        />
                        <QuickStat
                            label="Referral Coupons"
                            value={`${stats?.referral_coupons || 0}`}
                            sub="Referral rewards"
                            icon={<Gift size={16} className="text-amber-500" />}
                        />
                        <QuickStat
                            label="First Order"
                            value={`${stats?.first_order_coupons || 0}`}
                            sub="First order rewards"
                            icon={<Gift size={16} className="text-amber-500" />}
                        />
                        <QuickStat
                            label="Total Redeemed"
                            value={`${stats?.total_redeemed || 0}`}
                            sub="Successful redemptions"
                            icon={<TrendingUp size={16} className="text-blue-500" />}
                        />
                    </div>

                    {/* --- TABLE CONTAINER --- */}
                    <div className="bg-white rounded-2xl border border-[#EEEEEE] shadow-sm overflow-hidden">
                        {/* TABLE TOOLBAR */}
                        <div className="p-4 border-b border-[#EEEEEE] flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[11px] font-bold transition-all ${isFilterOpen
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-black border-[#EEEEEE] hover:bg-gray-50"
                                        }`}
                                >
                                    <Filter size={14} /> {isFilterOpen ? "Hide Filters" : "Show Filters"}
                                </button>

                                {/* Column Visibility Dropdown */}
                                <div className="relative" ref={columnsRef}>
                                    <button
                                        onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[11px] font-bold transition-all ${isColumnsOpen
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-black border-[#EEEEEE] hover:bg-gray-50"
                                            }`}
                                    >
                                        <Columns3 size={14} /> Columns
                                    </button>
                                    {isColumnsOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#EEEEEE] shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                                            <p className="px-4 py-2 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest border-b border-[#EEEEEE]">
                                                Toggle Columns
                                            </p>
                                            {COLUMNS.filter((c) => !c.alwaysVisible).map((col) => (
                                                <label
                                                    key={col.key}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleColumns[col.key]}
                                                        onChange={() => toggleColumn(col.key)}
                                                        className="w-3.5 h-3.5 rounded border-[#D4D4D8] text-black focus:ring-black/20 accent-black"
                                                    />
                                                    <span className="flex items-center gap-2 text-xs font-medium text-[#52525B]">
                                                        {col.icon}
                                                        {col.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-[#EEEEEE] rounded-lg text-xs font-bold hover:bg-[#FAFAFA] transition-colors"
                                >
                                    <Download size={14} /> Export
                                </button>
                            </div>
                        </div>

                        {/* Status/Error */}
                        {loading && coupons.length === 0 && (
                            <div className="p-6 text-sm text-[#71717A]">Loading coupons…</div>
                        )}
                        {error && (
                            <div className="p-6 text-sm text-rose-600">
                                {error || "Failed to load coupons"}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1100px]">
                                <thead className="bg-[#FAFAFA]">
                                    <tr className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest border-b border-[#EEEEEE]">
                                        {isVisible("id") && <th className="px-6 py-4 w-12 text-center">ID</th>}
                                        {isVisible("code") && <th className="px-6 py-4">Code</th>}
                                        {isVisible("description") && <th className="px-6 py-4">Description</th>}
                                        {isVisible("discount") && <th className="px-6 py-4">Discount</th>}
                                        {isVisible("validity") && <th className="px-6 py-4">Validity</th>}
                                        {isVisible("status") && <th className="px-6 py-4">Status</th>}
                                        {isVisible("usage") && <th className="px-6 py-4">Usage</th>}
                                        {isVisible("assignedUser") && <th className="px-6 py-4">Assigned User</th>}
                                        {isVisible("type") && <th className="px-6 py-4">Type</th>}
                                        {isVisible("createdAt") && <th className="px-6 py-4">Created At</th>}
                                        {isVisible("actions") && <th className="px-6 py-4 text-right">Actions</th>}
                                    </tr>

                                    {isFilterOpen && (
                                        <tr className="bg-white border-b border-[#EEEEEE] animate-in fade-in slide-in-from-top-1 duration-200">
                                            {isVisible("id") && (
                                                <td className="px-6 py-3 text-center">
                                                    <ListFilter size={14} className="text-[#D4D4D8] mx-auto" />
                                                </td>
                                            )}
                                            {isVisible("code") && (
                                                <td className="px-6 py-3">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={12} />
                                                        <input
                                                            type="text"
                                                            placeholder="Filter code..."
                                                            value={searchTerm}
                                                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                                            className="w-full pl-7 pr-2 py-2 bg-[#F9F9F9] border border-transparent rounded-md text-[11px] outline-none focus:bg-white focus:border-[#EEEEEE]"
                                                        />
                                                    </div>
                                                </td>
                                            )}
                                            {isVisible("description") && <td className="px-6 py-3"><div className="text-[10px] text-[#A1A1AA] italic">—</div></td>}
                                            {isVisible("discount") && (
                                                <td className="px-6 py-3">
                                                    <select
                                                        value={discountTypeFilter}
                                                        onChange={(e) => { setDiscountTypeFilter(e.target.value as "All" | "percentage" | "fixed"); setPage(1); }}
                                                        className="w-full p-2 bg-[#F9F9F9] border border-transparent rounded-md text-[11px] outline-none cursor-pointer focus:bg-white focus:border-[#EEEEEE]"
                                                    >
                                                        <option value="All">All Types</option>
                                                        <option value="percentage">Percentage</option>
                                                        <option value="fixed">Fixed Amount</option>
                                                    </select>
                                                </td>
                                            )}
                                            {isVisible("validity") && <td className="px-6 py-3"><div className="text-[10px] text-[#A1A1AA] italic">—</div></td>}
                                            {isVisible("status") && (
                                                <td className="px-6 py-3">
                                                    <select
                                                        value={statusFilter}
                                                        onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                                                        className="w-full p-2 bg-[#F9F9F9] border border-transparent rounded-md text-[11px] outline-none cursor-pointer focus:bg-white focus:border-[#EEEEEE]"
                                                    >
                                                        <option value="All">All Status</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                        <option value="Deleted">Deleted</option>
                                                    </select>
                                                </td>
                                            )}
                                            {isVisible("usage") && <td className="px-6 py-3"><div className="text-[10px] text-[#A1A1AA] italic">—</div></td>}
                                            {isVisible("assignedUser") && <td className="px-6 py-3"><div className="text-[10px] text-[#A1A1AA] italic">—</div></td>}
                                            {isVisible("type") && <td className="px-6 py-3"><div className="text-[10px] text-[#A1A1AA] italic">—</div></td>}
                                            {isVisible("createdAt") && <td className="px-6 py-3"><div className="text-[10px] text-[#A1A1AA] italic">—</div></td>}
                                            {isVisible("actions") && (
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={handleReset} className="text-[10px] font-bold text-rose-500 hover:underline px-2">
                                                        Clear
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )}
                                </thead>

                                <tbody className="divide-y divide-[#EEEEEE]">
                                    {loading && coupons.length === 0 ? (
                                        Array.from({ length: limit }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMNS.length} className="text-center py-10 text-sm text-[#71717A]">
                                                No coupons found.
                                            </td>
                                        </tr>
                                    ) : (
                                        coupons.map((coupon: Coupon) => (
                                            <tr key={coupon.id} className={`hover:bg-[#FAFAFA] transition-colors ${coupon.deleted_at ? "opacity-50 grayscale bg-stone-50" : ""}`}>
                                                {isVisible("id") && (
                                                    <td className="px-6 py-4 text-center text-xs font-medium text-[#A1A1AA]">
                                                        {coupon.id}
                                                    </td>
                                                )}
                                                {isVisible("code") && (
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-sm text-black">{coupon.code}</span>
                                                        {coupon.deleted_at && <span className="ml-2 text-[8px] font-black text-white bg-rose-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Trash</span>}
                                                    </td>
                                                )}
                                                {isVisible("description") && (
                                                    <td className="px-6 py-4 text-sm text-[#52525B]">
                                                        {coupon.description || "N/A"}
                                                    </td>
                                                )}
                                                {isVisible("discount") && (
                                                    <td className="px-6 py-4 text-sm font-medium text-[#52525B]">
                                                        {coupon.discount_value} {coupon.discount_type === "percentage" ? "%" : "AED"}
                                                        {coupon.max_discount_amount && coupon.discount_type === "percentage" && (
                                                            <span className="block text-xs text-[#A1A1AA]">Max: AED {coupon.max_discount_amount}</span>
                                                        )}
                                                    </td>
                                                )}
                                                {isVisible("validity") && (
                                                    <td className="px-6 py-4 text-sm text-[#52525B]">
                                                        {formatDate(coupon.valid_from)} - {coupon.valid_to ? formatDate(coupon.valid_to) : "No End Date"}
                                                    </td>
                                                )}
                                                {isVisible("status") && (
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${coupon.deleted_at ? "bg-stone-200 text-stone-600" : coupon.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                                            {coupon.deleted_at ? <Trash2 size={12} /> : coupon.is_active ? <Check size={12} /> : <X size={12} />}
                                                            {coupon.deleted_at ? "Deleted" : coupon.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                )}
                                                {isVisible("usage") && (
                                                    <td className="px-6 py-4 text-sm text-[#52525B]">
                                                        {coupon.used_count} / {coupon.usage_limit || "∞"}
                                                    </td>
                                                )}
                                                {isVisible("assignedUser") && (
                                                    <td className="px-6 py-4 text-sm text-[#52525B]">
                                                        {coupon.assigned_user_email ? (
                                                            <Link to={`/admin/users/${coupon.assigned_user_id}`} className="text-blue-600 hover:underline">
                                                                {coupon.assigned_user_email}
                                                            </Link>
                                                        ) : "N/A"}
                                                    </td>
                                                )}
                                                {isVisible("type") && (
                                                    <td className="px-6 py-4 text-sm text-[#52525B]">
                                                        {coupon.is_referral_reward ? "Referral" : (coupon.is_first_order_reward ? "First Order" : "Standard")}
                                                    </td>
                                                )}
                                                {isVisible("createdAt") && (
                                                    <td className="px-6 py-4 text-sm text-[#52525B]">
                                                        {formatDate(coupon.created_at)}
                                                    </td>
                                                )}
                                                {isVisible("actions") && (
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!coupon.deleted_at ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleToggleActive(coupon)}
                                                                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                                                                            coupon.is_active
                                                                                ? "text-amber-500 hover:text-amber-700"
                                                                                : "text-emerald-500 hover:text-emerald-700"
                                                                        }`}
                                                                        title={coupon.is_active ? "Deactivate" : "Activate"}
                                                                    >
                                                                        {coupon.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSoftDeleteCoupon(coupon.id)}
                                                                        className="p-2 rounded-full hover:bg-gray-100 text-rose-500 hover:text-rose-700 transition-colors"
                                                                        title="Move to Trash"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRestoreCoupon(coupon.id)}
                                                                        className="p-2 rounded-full hover:bg-gray-100 text-emerald-500 hover:text-emerald-700 transition-colors"
                                                                        title="Restore Coupon"
                                                                    >
                                                                        <RotateCcw size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleHardDeleteCoupon(coupon.id)}
                                                                        className="p-2 rounded-full hover:bg-gray-100 text-rose-600 hover:text-rose-800 transition-colors"
                                                                        title="Delete Permanently"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {totalCount > 0 && (
                            <Pagination
                                currentPage={page}
                                totalPages={Math.ceil(totalCount / limit)}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                                limit={limit}
                                visibleStart={totalCount === 0 ? 0 : (page - 1) * limit + 1}
                                visibleEnd={totalCount === 0 ? 0 : Math.min((page - 1) * limit + coupons.length, totalCount)}
                                totalItems={totalCount}
                            />
                        )}
                    </div>
                </>
            )}

            {/* CouponFormModal hidden */}

            <ConfirmModal
                open={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title={isHardDelete ? "Permanently Delete?" : "Move to Trash?"}
                message={isHardDelete
                    ? "This action is permanent and cannot be undone. All data for this coupon will be lost."
                    : "The coupon will be deactivated and hidden from users. You can restore it later from the trash."}
            />
        </div>
    );
};

export default CouponManagement;
