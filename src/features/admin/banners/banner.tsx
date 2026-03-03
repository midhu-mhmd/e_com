import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { fetchBanners, addBanner, updateBanner, deleteBanner, selectBanners, selectBannersLoading } from "./bannerSlice";
import type { BannerDto } from "./bannerApi";
import {
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon,
    Monitor,
    Smartphone,
    Save,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    GripVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BannersManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const banners = useAppSelector(selectBanners);
    const loading = useAppSelector(selectBannersLoading);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerDto | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        tag: "",
        highlight: "",
        cta_text: "",
        cta_link: "",
        price_text: "",
        old_price_text: "",
        is_active: true,
        position: "home_hero",
    });

    const [desktopImage, setDesktopImage] = useState<File | null>(null);
    const [mobileImage, setMobileImage] = useState<File | null>(null);
    const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
    const [mobilePreview, setMobilePreview] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    const resetForm = () => {
        setFormData({
            title: "",
            subtitle: "",
            tag: "",
            highlight: "",
            cta_text: "",
            cta_link: "",
            price_text: "",
            old_price_text: "",
            is_active: true,
            position: "home_hero",
        });
        setEditingBanner(null);
        setDesktopImage(null);
        setMobileImage(null);
        setDesktopPreview(null);
        setMobilePreview(null);
    };

    const handleOpenModal = (banner?: any) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title || "",
                subtitle: banner.subtitle || "",
                tag: banner.tag || "",
                highlight: banner.highlight || "",
                cta_text: banner.cta_text || "",
                cta_link: banner.cta_link || "",
                price_text: banner.price_text || "",
                old_price_text: banner.old_price_text || "",
                is_active: banner.is_active,
                position: banner.position || "home_hero",
            });
            setDesktopPreview(banner.desktop_image);
            setMobilePreview(banner.mobile_image);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === "desktop") {
                setDesktopImage(file);
                setDesktopPreview(URL.createObjectURL(file));
            } else {
                setMobileImage(file);
                setMobilePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
        });

        if (desktopImage) data.append("desktop_image", desktopImage);
        if (mobileImage) data.append("mobile_image", mobileImage);

        try {
            if (editingBanner) {
                await dispatch(updateBanner({ id: editingBanner.id, payload: data })).unwrap();
            } else {
                await dispatch(addBanner(data)).unwrap();
            }
            handleCloseModal();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to save banner");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            try {
                await dispatch(deleteBanner(id)).unwrap();
            } catch (err: any) {
                console.error(err);
                alert(err.message || "Failed to delete banner");
            }
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Banner Management</h1>
                    <p className="text-slate-500 mt-1">Design and control your home page banners</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={20} /> Add New Banner
                </button>
            </div>

            {/* Banners List */}
            {loading && banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Loader2 className="animate-spin text-slate-300 mb-4" size={40} />
                    <p className="text-slate-400 font-medium">Loading your banners...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <ImageIcon className="text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900">No Banners Found</h3>
                    <p className="text-slate-400 mb-6">Start by adding your first promotional banner.</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:text-black hover:border-black transition-all"
                    >
                        Create Banner
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {[...banners].sort((a, b) => a.order - b.order).map((banner) => (
                            <motion.div
                                key={banner.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image Preview Area */}
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={banner.desktop_image}
                                        alt={banner.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${banner.is_active ? "bg-green-500 text-white" : "bg-slate-500 text-white"
                                            }`}>
                                            {banner.is_active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {banner.is_active ? "Active" : "Paused"}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white ml-2">
                                            {banner.position || "home_hero"}
                                        </span>
                                    </div>

                                    {/* Icon Badges */}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white" title="Desktop View">
                                            <Monitor size={14} />
                                        </div>
                                        {banner.mobile_image && (
                                            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white" title="Mobile View Available">
                                                <Smartphone size={14} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Text Overlay */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">{banner.tag || "Promotion"}</p>
                                        <h3 className="text-xl font-black text-white line-clamp-1">{banner.title}</h3>
                                    </div>
                                </div>

                                {/* Content & Actions */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <GripVertical size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Order: #{banner.order}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(banner)}
                                                className="p-2.5 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2.5 bg-slate-50 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all active:scale-90"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal - Banner Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{editingBanner ? "Edit Banner" : "Add New Banner"}</h2>
                                    <p className="text-slate-500 text-sm mt-1">Fill in the details for your homepage highlight</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Text Content */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Banner Title</label>
                                            <input
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                placeholder="e.g. Fresh King Prawns"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Subtitle</label>
                                            <textarea
                                                rows={2}
                                                value={formData.subtitle}
                                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium placeholder:text-slate-300"
                                                placeholder="Short description under the title..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tag</label>
                                                <input
                                                    value={formData.tag}
                                                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                    placeholder="e.g. SPECIAL"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Highlight</label>
                                                <input
                                                    value={formData.highlight}
                                                    onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                    placeholder="e.g. 30% OFF"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CTA Text</label>
                                                <input
                                                    value={formData.cta_text}
                                                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                    placeholder="e.g. Shop Now"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CTA Link</label>
                                                <input
                                                    value={formData.cta_link}
                                                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                    placeholder="e.g. /products"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Banner Position</label>
                                                <select
                                                    value={formData.position}
                                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold appearance-none cursor-pointer"
                                                >
                                                    <option value="home_hero">Home Hero Carousel</option>
                                                    <option value="home_banner">Home Banner (Standard)</option>
                                                    <option value="home_offer_card">Home Offer Card (Small)</option>
                                                    <option value="home_promo_banner">Home Promo Banner (Large)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Price Label</label>
                                                <input
                                                    value={formData.price_text}
                                                    onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                    placeholder="e.g. AED 12.50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Old Price</label>
                                                <input
                                                    value={formData.old_price_text}
                                                    onChange={(e) => setFormData({ ...formData, old_price_text: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold placeholder:text-slate-300"
                                                    placeholder="e.g. AED 18.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-5 h-5 accent-black rounded cursor-pointer"
                                            />
                                            <label htmlFor="is_active" className="text-sm font-bold text-slate-900 cursor-pointer">Set as Active (Visible on Home Page)</label>
                                        </div>
                                    </div>

                                    {/* Right Column: Images */}
                                    <div className="space-y-8">
                                        {/* Desktop Image */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                                <Monitor size={14} /> Desktop Image (1200x420)
                                            </label>
                                            <div
                                                className="relative aspect-[16/6] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden group cursor-pointer"
                                                onClick={() => document.getElementById('desktop-input')?.click()}
                                            >
                                                {desktopPreview ? (
                                                    <img src={desktopPreview} className="w-full h-full object-cover" alt="Desktop preview" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                        <Plus size={32} />
                                                        <span className="text-xs font-bold mt-2">Upload Image</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                    <ImageIcon size={32} />
                                                </div>
                                                <input
                                                    id="desktop-input"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, "desktop")}
                                                    required={!editingBanner}
                                                />
                                            </div>
                                        </div>

                                        {/* Mobile Image */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                                <Smartphone size={14} /> Mobile Image (Optional - 600x600)
                                            </label>
                                            <div
                                                className="relative aspect-square max-w-[200px] mx-auto bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden group cursor-pointer"
                                                onClick={() => document.getElementById('mobile-input')?.click()}
                                            >
                                                {mobilePreview ? (
                                                    <img src={mobilePreview} className="w-full h-full object-cover" alt="Mobile preview" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                        <Plus size={32} />
                                                        <span className="text-xs font-bold mt-2">Upload Mobile</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                    <Smartphone size={32} />
                                                </div>
                                                <input
                                                    id="mobile-input"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, "mobile")}
                                                />
                                            </div>
                                            <p className="text-[10px] text-center text-slate-400 font-medium">Auto-responsive fallback to desktop if omitted.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="mt-12 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Save size={20} /> Save Banner
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BannersManagement;
