import React, { useEffect, useRef, useState } from "react";
import { Star, ShoppingCart, Flame, Eye, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useRequireAuth } from "../../hooks";
import { addToCart } from "../../features/admin/cart/cartSlice";
import { useTranslation } from "react-i18next";
import { type ProductDto } from "../../features/admin/products/productApi";
import { useBestsellers } from "../../hooks/queries";

/* ── Product Card ── */
const ProductCard: React.FC<{
  product: ProductDto;
  image: string;
  discount: number;
  index: number;
  onAddToCart: () => void;
  onDirectBuy: () => void;
  onQuickView: () => void;
}> = ({ product, image, discount, index, onAddToCart, onDirectBuy, onQuickView }) => {
  const { t } = useTranslation("home");

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const price = parseFloat(product.price);
  const finalPrice = parseFloat(product.final_price);
  const rating = product.average_rating || 0;

  return (
    <div
      ref={ref}
      onClick={onQuickView}
      // Added `h-full flex flex-col` to ensure the card stretches to match sibling heights
      className={`group relative flex flex-col h-full min-w-[280px] max-w-[280px] bg-white rounded-2xl border border-zinc-100 overflow-hidden snap-start transition-all duration-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative h-52 shrink-0 bg-zinc-50 overflow-hidden">
        {image && (
          <img
            src={image}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"
              }`}
          />
        )}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
            <Sparkles size={32} />
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-cyan-600 text-white rounded-lg text-[10px] font-bold shadow-md">
            {discount}% {t("bestsellers.off", "OFF")}
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-4 py-1.5 bg-white/90 rounded-full text-xs font-bold text-zinc-700">
              {t("bestsellers.outOfStock")}
            </span>
          </div>
        )}

        {/* Quick view on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-lg hover:bg-white transition-all"
          >
            <Eye size={14} /> {t("bestsellers.quickView")}
          </button>
        </div>
      </div>

      {/* Details - Added `flex-1 flex flex-col` to allow internal spacing */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
          {product.category_name || t("bestsellers.fallbackCategory")}
        </p>

        {/* Name (from API) */}
        <h3 className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2 h-10 mb-2 group-hover:text-cyan-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating Placeholder/Actual - Fixed height to prevent vertical shifting */}
        <div className="h-4 flex items-center mb-3">
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-zinc-200"
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] text-zinc-400">({product.total_reviews})</span>
            </div>
          )}
        </div>

        {/* Price + Actions - Fixed mt-auto to anchor at the bottom */}
        <div className="mt-auto pt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-zinc-900">
                <span className="text-yellow-500">AED</span> {finalPrice}
              </span>
              {discount > 0 && (
                <span className="text-xs text-zinc-400 line-through">
                  <span className="text-yellow-500/70">AED</span> {Math.round(price)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={!product.is_available}
              aria-label={t("bestsellers.addToCartAria", "Add to cart")}
              className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-300 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
            >
              <ShoppingCart size={16} />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirectBuy();
            }}
            disabled={!product.is_available}
            className="w-full py-2.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Zap size={14} className="fill-current" />
            {t("bestsellers.buyNow", "Buy Now")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Section ── */
const BestsellersSection: React.FC = () => {
  const { t } = useTranslation("home");

  // ✅ TanStack Query — cached bestsellers
  const { data, isLoading: loading } = useBestsellers();
  const products = data?.results || [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();

  const getProductImage = (p: ProductDto) => {
    const featured = p.images?.find((img) => img.is_feature);
    if (featured) return featured.image;
    if (p.images?.[0]) return p.images[0].image;
    return p.image || "";
  };

  const getDiscount = (p: ProductDto) => {
    const price = parseFloat(p.price);
    const final = parseFloat(p.final_price);
    if (!price || !final || price <= final) return 0;
    return Math.round(((price - final) / price) * 100);
  };

  const handleAddToCart = (product: ProductDto) => {
    requireAuth(() => {
      const price = parseFloat(product.price);
      const discountPrice = product.discount_price
        ? parseFloat(product.discount_price)
        : undefined;
      const finalPrice = parseFloat(product.final_price) || discountPrice || price;

      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          price,
          discountPrice,
          finalPrice,
          image: getProductImage(product) || product.image,
          sku: product.sku || product.slug,
          stock: product.stock,
          quantity: 1,
        })
      );
    })();
  };

  const handleDirectBuy = (product: ProductDto) => {
    requireAuth(() => {
      const price = parseFloat(product.price);
      const discountPrice = product.discount_price
        ? parseFloat(product.discount_price)
        : undefined;
      const finalPrice = parseFloat(product.final_price) || discountPrice || price;

      const directBuyItem = {
        id: product.id,
        name: product.name,
        price,
        discountPrice,
        finalPrice,
        image: getProductImage(product) || product.image,
        sku: product.sku || product.slug,
        stock: product.stock,
        quantity: 1,
      };

      // Dispatch to Redux cart and then navigate directly to checkout page
      dispatch(addToCart(directBuyItem));
      navigate("/checkout");
    })();
  };

  return (
    <section className="relative bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 bg-yellow-50 rounded-full blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-100 rounded-full mb-3">
              <Flame size={14} className="text-cyan-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600">
                {t("bestsellers.kicker")}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              {t("bestsellers.title")}{" "}
              <span className="text-cyan-600">{t("bestsellers.titleHighlight")}</span>{" "}
              {t("bestsellers.titleSuffix")}
            </h2>

            <p className="mt-2 text-zinc-500 text-sm max-w-md">
              {t("bestsellers.subtitle")}
            </p>
          </div>
        </div>

        {/* Skeleton loader */}
        {loading && (
          // Added `py-4` padding to skeleton container for consistency
          <div className="flex gap-5 overflow-hidden py-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="min-w-[280px] bg-white rounded-2xl border border-zinc-100 overflow-hidden animate-pulse flex flex-col h-[380px]"
              >
                <div className="h-52 bg-zinc-100 shrink-0" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="h-3 w-16 bg-zinc-100 rounded mb-3" />
                  <div className="h-4 w-3/4 bg-zinc-100 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-zinc-100 rounded" />
                  <div className="mt-auto pt-3 flex justify-between items-end">
                    <div className="h-5 w-16 bg-zinc-100 rounded" />
                    <div className="h-8 w-8 bg-zinc-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Carousel */}
        {!loading && products.length > 0 && (
          <div
            ref={scrollRef}
            // Replaced `pb-4` with `py-6 px-1 -mx-1` to prevent hover shadows/translation from triggering vertical scroll
            className="flex gap-5 overflow-x-auto py-6 px-1 -mx-1 scrollbar-hide snap-x snap-mandatory items-stretch"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                image={getProductImage(product)}
                discount={getDiscount(product)}
                index={i}
                onAddToCart={() => handleAddToCart(product)}
                onDirectBuy={() => handleDirectBuy(product)}
                onQuickView={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="mx-auto text-zinc-300 mb-4" size={48} />
            <p className="text-zinc-400 text-sm">{t("bestsellers.empty")}</p>
          </div>
        )}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  );
};

export default BestsellersSection;