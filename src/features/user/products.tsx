import React, { useEffect, useState, useCallback, memo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { type ProductDto } from "../admin/products/productApi";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Star, Filter, ArrowRight, Zap, Loader2 } from "lucide-react";
import { useAppDispatch, useRequireAuth } from "../../hooks";
import { fetchCartRequest } from "../admin/cart/cartSlice";
import { cartsApi } from "../admin/cart/cartApi";
import { useNavigate } from "react-router-dom";
import ShrimpLoader from "../../components/loader/preloader";
import { useTranslation } from "react-i18next";
import { useInfiniteProducts } from "../../hooks/queries";
import { useToast } from "../../components/ui/Toast";
import useLanguageToggle from "../../hooks/useLanguageToggle";

/** Main image field → feature gallery image → first gallery image */
const getProductImage = (p: ProductDto): string => {
    if (p.image) return p.image;
    const featured = p.images?.find((img) => img.is_feature);
    if (featured) return featured.image;
    return p.images?.[0]?.image || "";
};

// --- Extracted Memoized Product Card ---
const ProductCard = memo(({
    product,
    onAddToCart,
    onBuyNow
}: {
    product: ProductDto;
    onAddToCart: (e: React.MouseEvent, p: ProductDto) => void;
    onBuyNow: (e: React.MouseEvent, p: ProductDto) => void;
}) => {
    const { t } = useTranslation("product");
    const unitDisplay =
        product.unit === "kg"
            ? "Kg"
            : product.unit === "piece"
                ? "Piece"
                : product.unit === "Gram"
                    ? "100g"
                    : "";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="group relative bg-white rounded-[2rem] p-3 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100 hover:border-slate-200 h-full"
        >
            <Link to={`/products/${product.id}`} className="block h-full flex flex-col">
                {/* Image Container with aspect-ratio to prevent Layout Shift */}
                <div className="relative aspect-[3/4] bg-slate-50 rounded-[1.5rem] overflow-hidden mb-4 isolate">
                    <img
                        src={getProductImage(product) || "https://via.placeholder.com/400x500?text=Fresh+Catch"}
                        alt={product.name}
                        loading="lazy" // Native Lazy Loading
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {product.discount_price && (
                            <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                {t("card.sale")}
                            </span>
                        )}
                        {product.average_rating > 4.5 && (
                            <span className="px-2.5 py-1 bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                                <Star size={10} fill="black" /> {t("card.topRated")}
                            </span>
                        )}
                        {product.is_available && product.stock > 0 && product.stock < 7 && (
                            <span className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                {t("card.onlyLeft", { count: product.stock })}
                            </span>
                        )}
                        {product.is_available && product.stock >= 7 && product.stock < 10 && (
                            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                {t("card.lowStock")}
                            </span>
                        )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button
                            onClick={(e) => onAddToCart(e, product)}
                            disabled={!product.is_available || product.stock === 0}
                            className="w-10 h-10 bg-white shadow-xl text-slate-900 rounded-full flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-all duration-300 disabled:opacity-50"
                            title={t("card.addToCart")}
                        >
                            <ShoppingCart size={18} />
                        </button>

                    </div>

                    {/* Out of Stock Overlay */}
                    {(!product.is_available || product.stock === 0) && (
                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-xl">
                                <span className="text-slate-900 text-xs font-black uppercase tracking-widest">{t("card.outOfStock")}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-2 pb-2 flex-grow flex flex-col">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">
                            {product.category_name || t("card.categoryFallback")}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-700">{product.average_rating ? Number(product.average_rating).toFixed(1) : t("card.new")}</span>
                        </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-1 line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-1">{product.description || t("card.descriptionFallback")}</p>

                    <div className="mt-auto pt-3 border-t border-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                {product.discount_price ? (
                                    <>
                                        <span className="text-[10px] text-slate-400 line-through font-medium">AED {Number(product.price).toFixed(2)}{unitDisplay ? ` / ${unitDisplay}` : ""}</span>
                                        <span className="text-lg font-black text-slate-900">AED {Number(product.discount_price).toFixed(2)}{unitDisplay ? ` / ${unitDisplay}` : ""}</span>
                                    </>
                                ) : (
                                    <span className="text-lg font-black text-slate-900">AED {Number(product.price).toFixed(2)}{unitDisplay ? ` / ${unitDisplay}` : ""}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group/btn">
                                <span className="hidden sm:inline-block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-500">{t("card.view")}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Stock info — always reserve height to keep card size consistent */}
                        <p className="text-[10px] text-slate-400 font-medium h-4">
                            {product.is_available && product.stock > 0 && product.stock < 15 ? t("card.inStock", { count: product.stock }) : ""}
                        </p>

                        {/* Buy Now Button */}
                        <button
                            onClick={(e) => onBuyNow(e, product)}
                            disabled={!product.is_available || product.stock === 0}
                            className="w-full py-2.5 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Zap size={14} />
                            {t("card.buyNow")}
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
});

const UserProductsPage: React.FC = () => {
    const { t } = useTranslation("product");
    const { isArabic } = useLanguageToggle();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const requireAuth = useRequireAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const LIMIT = 12;

    // Filters state
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    const category = searchParams.get("category");

    // Debounce the search term for data fetching
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Sync filters to URL (debounced)
    useEffect(() => {
        const handler = setTimeout(() => {
            const params: any = {};
            if (searchTerm) params.q = searchTerm;
            if (category) params.category = category;
            setSearchParams(params, { replace: true });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, category, setSearchParams]);

    // ✅ TanStack Infinite Query — Load More pagination
    const filters = {
        ...(debouncedSearch && { search: debouncedSearch, q: debouncedSearch }),
        ...(category && { category }),
    };
    const {
        data,
        isLoading: loading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteProducts(filters, LIMIT);

    const products = data?.pages.flatMap(page => page.results) || [];
    const totalCount = data?.pages[0]?.count || 0;
    const error = isError ? t("list.errorLoading") : null;
    const toast = useToast();

    const handleAddToCart = useCallback((e: React.MouseEvent, product: ProductDto) => {
        e.preventDefault();
        e.stopPropagation();

        requireAuth(async () => {
            try {
                const result = await cartsApi.addItem(product.id, 1);
                if (result?.error) {
                    toast.show(result.error, "error");
                    return;
                }
                dispatch(fetchCartRequest());
                toast.show(`${product.name} added to cart`, "cart");
            } catch (err: any) {
                const msg = err?.response?.data?.error || "Failed to add item to cart";
                toast.show(msg, "error");
            }
        })();
    }, [dispatch, requireAuth, toast]);

    const handleBuyNow = useCallback((e: React.MouseEvent, product: ProductDto) => {
        e.preventDefault();
        e.stopPropagation();

        requireAuth(async () => {
            try {
                const result = await cartsApi.addItem(product.id, 1);
                if (result?.error) {
                    toast.show(result.error, "error");
                    return;
                }
                dispatch(fetchCartRequest());
                toast.show(`${product.name} added to cart`, "cart");
                navigate('/checkout');
            } catch (err: any) {
                const msg = err?.response?.data?.error || "Failed to add item to cart";
                toast.show(msg, "error");
            }
        })();
    }, [dispatch, navigate, requireAuth, toast]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-cyan-100 selection:text-cyan-900">

            {/* ─── Static Filter Bar ─── */}
            <div className="relative z-30 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Search Input */}
                        <div className="relative w-full md:w-96 group">
                            <Search className={`absolute ${isArabic ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors`} size={20} />
                            <input
                                type="text"
                                placeholder={t("list.searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-100/50 hover:bg-slate-100 border border-transparent focus:bg-white focus:border-cyan-200 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Product Grid ─── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {loading && products.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <ShrimpLoader />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <div className="w-16 h-16 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center mb-4">
                            <Filter size={32} />
                        </div>
                        <p className="text-slate-900 font-bold text-lg mb-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors">
                            {t("list.tryAgain")}
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Search className="text-slate-300" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{t("list.noProductsFound")}</h3>
                        <p className="text-slate-500 mb-8 max-w-sm">{t("list.noProductsDescription", { searchTerm })}</p>
                        <button
                            onClick={() => { setSearchTerm(""); }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20"
                        >
                            {t("list.clearSearch")}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            <AnimatePresence mode="popLayout">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onBuyNow={handleBuyNow}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Load More Section */}
                        {hasNextPage && (
                            <div className="mt-14 flex flex-col items-center gap-5">
                                {/* Progress bar
                                <div className="w-full max-w-xs">
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.round((products.length / totalCount) * 100)}%` }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                                        {products.length} / {totalCount}
                                    </p>
                                </div> */}

                                {/* Load More button */}
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="relative px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-full font-semibold text-sm shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0"
                                >
                                    {isFetchingNextPage ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            {t("list.loading", "Loading...")}
                                        </span>
                                    ) : (
                                        t("list.loadMore", "Load More")
                                    )}
                                </button>
                            </div>
                        )}

                        {/* All loaded */}
                        {!hasNextPage && products.length > 0 && totalCount > LIMIT && (
                            <div className="mt-14 flex flex-col items-center gap-2">
                                <div className="w-full max-w-xs h-1 bg-linear-to-r from-cyan-400 to-cyan-600 rounded-full" />
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    ✨ {t("list.allLoaded", "That's everything!")}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default UserProductsPage;
