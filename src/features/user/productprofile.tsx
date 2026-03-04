import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type ProductDto } from "../admin/products/productApi";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Minus, Plus, Heart, Zap, Play, ChevronDown } from "lucide-react";
import { useAppDispatch, useRequireAuth } from "../../hooks";
import { addToCart } from "../admin/cart/cartSlice";
import { useTranslation } from "react-i18next";
import { useProductDetails } from "../../hooks/queries";
import { useToast } from "../../components/ui/Toast";

/** Unified media item for the gallery */
type MediaItem =
  | { type: "image"; id: number; src: string }
  | { type: "video"; id: number; src: string; title: string };

/** Get the best available image: featured → first gallery → main image field */
const getProductImage = (p: ProductDto): string => {
  const featured = p.images?.find((img) => img.is_feature);
  if (featured) return featured.image;
  if (p.images?.[0]) return p.images[0].image;
  return p.image || "";
};

/** Build unified media list from product data */
const buildMediaList = (product: ProductDto): MediaItem[] => {
  const items: MediaItem[] = [];
  const addedSrcs = new Set<string>();

  // 1. Main image field first (if exists and not in images array)
  if (product.image && !addedSrcs.has(product.image)) {
    items.push({ type: "image", id: -1, src: product.image });
    addedSrcs.add(product.image);
  }

  // 2. Featured image from gallery (if exists)
  const featured = product.images?.find((img) => img.is_feature);
  if (featured && !addedSrcs.has(featured.image)) {
    items.push({ type: "image", id: featured.id, src: featured.image });
    addedSrcs.add(featured.image);
  }

  // 3. All other gallery images (skip duplicates)
  for (const img of product.images || []) {
    if (!addedSrcs.has(img.image)) {
      items.push({ type: "image", id: img.id, src: img.image });
      addedSrcs.add(img.image);
    }
  }

  // 4. Videos
  for (const vid of product.videos || []) {
    const src = vid.video_file || vid.video_url;
    if (src) {
      items.push({ type: "video", id: vid.id, src, title: vid.title });
    }
  }

  return items;
};

const ProductProfile: React.FC = () => {
  const { t } = useTranslation("product");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const requireAuth = useRequireAuth();

  // ✅ TanStack Query — cached product details
  const productId = id ? parseInt(id) : undefined;
  const { data: product = null, isLoading: loading, isError } = useProductDetails(productId);
  const error = isError ? t("details.errorLoad") : null;

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showBulkOrder, setShowBulkOrder] = useState(false);

  // Build media list and set initial selection
  const mediaList = product ? buildMediaList(product) : [];

  React.useEffect(() => {
    if (product && !selectedMedia && mediaList.length > 0) {
      setSelectedMedia(mediaList[0]);
    }
  }, [product]);

  React.useEffect(() => {
    checkWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const checkWishlist = () => {
    if (!product) return;
    try {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        const items = JSON.parse(stored) as ProductDto[];
        setIsWishlisted(items.some((item) => item.id === product.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const stored = localStorage.getItem("wishlist");
      let items: ProductDto[] = stored ? JSON.parse(stored) : [];

      if (isWishlisted) {
        items = items.filter((item) => item.id !== product.id);
        setIsWishlisted(false);
      } else {
        if (!items.find((item) => item.id === product.id)) {
          items.push(product);
        }
        setIsWishlisted(true);
      }

      localStorage.setItem("wishlist", JSON.stringify(items));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-4" />
          <div className="h-4 bg-slate-200 rounded w-32" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-cyan-500 font-bold mb-4">{error || t("details.notFound")}</p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold"
        >
          <ArrowLeft size={16} /> {t("details.backToShop")}
        </button>
      </div>
    );
  }

  const discountPercentage = product.discount_price
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)
    : 0;

  const skuLabel = product.sku || t("details.perUnitFallback");

  const toast = useToast();

  const addItemToCart = (goTo: "cart" | "checkout") => {
    requireAuth(() => {
      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          discountPrice: product.discount_price ? parseFloat(product.discount_price) : undefined,
          finalPrice: product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price),
          image: getProductImage(product),
          quantity,
          stock: product.stock,
          sku: product.sku,
          category: product.category_name
        })
      );
      toast.show(`${product.name} added to cart`, "cart");
      navigate(goTo === "cart" ? "/cart" : "/checkout");
    })();
  };

  // Determine what to show in the main viewer
  const activeMedia = selectedMedia || mediaList[0] || null;

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800 pb-20">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-cyan-600 transition-colors"
        >
          <ArrowLeft size={16} /> {t("details.back")}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* ═══ Media Gallery ═══ */}
        <div className="space-y-4">
          {/* Main Viewer */}
          <motion.div
            key={activeMedia?.src || "empty"}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative aspect-[4/3] bg-slate-50 rounded-3xl overflow-hidden border border-slate-100"
          >
            {activeMedia?.type === "video" ? (
              <video
                key={activeMedia.src}
                src={activeMedia.src}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black rounded-3xl"
              />
            ) : (
              <img
                src={activeMedia?.src || "https://via.placeholder.com/600x450?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.discount_price && (
                <span className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-cyan-600/30">
                  {t("details.off", { value: discountPercentage })}
                </span>
              )}
              {!product.is_available && (
                <span className="px-3 py-1.5 bg-cyan-900 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg">
                  {t("details.outOfStock")}
                </span>
              )}
            </div>
          </motion.div>

          {/* Thumbnails Strip — Images + Videos */}
          {mediaList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {mediaList.map((item, idx) => (
                <button
                  key={`${item.type}-${item.id}-${idx}`}
                  onClick={() => setSelectedMedia(item)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-slate-100 group ${activeMedia?.src === item.src
                    ? "border-cyan-600 ring-2 ring-cyan-600/20 shadow-lg"
                    : "border-transparent hover:border-stone-300"
                    }`}
                >
                  {item.type === "video" ? (
                    <>
                      {/* Video poster — use first frame or dark bg */}
                      <video
                        src={item.src}
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                          <Play size={14} className="text-stone-800 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.src}
                      alt={`View ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-2 py-1 rounded-md">
                {product.category_name}
              </span>

              {product.average_rating > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold text-stone-700">
                    {t("details.ratingText", {
                      rating: product.average_rating,
                      reviews: product.total_reviews
                    })}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight">{product.name}</h1>
            <p className="text-stone-500 leading-relaxed text-lg">{product.description}</p>
          </div>

          {/* Price block */}
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-stone-400 font-bold mb-1">
                {t("details.pricePer", { sku: skuLabel })}
              </p>

              <div className="flex items-baseline gap-3">
                {product.discount_price ? (
                  <>
                    <span className="text-4xl font-black text-stone-900">
                      {t("details.currencyAed", { value: product.discount_price })}
                    </span>
                    <span className="text-xl text-stone-400 line-through font-bold">
                      {t("details.currencyAed", { value: product.price })}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-stone-900">
                    {t("details.currencyAed", { value: product.price })}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-4 bg-white rounded-xl p-1 border border-stone-200 shadow-sm w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  aria-label={t("details.qtyDecrease")}
                >
                  <Minus size={18} />
                </button>

                <span className="text-lg font-black w-8 text-center" aria-label={t("details.qtyLabel", { value: quantity })}>
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  aria-label={t("details.qtyIncrease")}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => addItemToCart("cart")}
              disabled={!product.is_available}
              className="flex-1 py-4 bg-stone-900 text-white text-base font-black rounded-2xl hover:bg-stone-800 shadow-xl shadow-stone-900/10 hover:shadow-stone-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <ShoppingCart size={22} />
              {product.is_available ? t("details.addToCart") : t("details.outOfStock")}
            </button>

            <button
              onClick={() => addItemToCart("checkout")}
              disabled={!product.is_available}
              className="flex-1 py-4 bg-cyan-600 text-white text-base font-black rounded-2xl hover:bg-cyan-700 shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Zap size={22} />
              {t("details.buyNow")}
            </button>

            <motion.button
              onClick={toggleWishlist}
              whileTap={{ scale: 0.8 }}
              animate={{ scale: isWishlisted ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={`p-4 border-2 rounded-2xl transition-all ${isWishlisted
                ? "bg-cyan-50 border-cyan-100 text-cyan-600"
                : "bg-white border-stone-100 text-stone-400 hover:text-cyan-500 hover:border-cyan-100 hover:bg-cyan-50"
                }`}
              aria-label={isWishlisted ? t("details.removeWishlist") : t("details.addWishlist")}
            >
              <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
            </motion.button>
          </div>

          {/* Bulk Order Section */}
          <div
            className="bg-cyan-50 border border-cyan-100 rounded-3xl p-5 cursor-pointer hover:bg-cyan-100/50 transition-colors"
            onClick={() => setShowBulkOrder(!showBulkOrder)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-black text-cyan-900 text-lg">{t("details.bulkOrder.title")}</p>
                <p className="text-sm font-bold text-cyan-700">{t("details.bulkOrder.subtitle")}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-cyan-600">
                <ChevronDown size={20} className={`transition-transform duration-300 ${showBulkOrder ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {showBulkOrder && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 pt-5 border-t border-cyan-200/50">
                    <p className="text-sm font-medium text-cyan-800 mb-4 leading-relaxed">
                      {t("details.bulkOrder.description")}
                    </p>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-900 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                        {t("details.bulkOrder.minOrder", { count: 50 })}
                      </span>
                    </div>
                    {/* Using a generic WhatsApp link structure; this can be customized with exact number later */}
                    <a
                      href={`https://wa.me/971500000000?text=${encodeURIComponent(`Hello, I am interested in bulk ordering "${product.name}"`)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the link
                      className="flex items-center justify-center w-full py-4 bg-green-500 text-white font-black rounded-2xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                    >
                      {t("details.bulkOrder.getQuote")}
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100">
              <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                <Truck size={20} />
              </div>
              <div>
                <p className="font-bold text-stone-900">{t("details.meta.fastDelivery.title")}</p>
                <p className="text-stone-500 text-xs">{t("details.meta.fastDelivery.subtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100">
              <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-stone-900">{t("details.meta.freshGuaranteed.title")}</p>
                <p className="text-stone-500 text-xs">{t("details.meta.freshGuaranteed.subtitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductProfile;