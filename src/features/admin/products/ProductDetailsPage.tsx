import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Package, Tag, Clock, Star, Edit3, Truck, Image as ImageIcon, Video } from "lucide-react";
import { productsApi, type ProductDto } from "./productApi";

function mapDto(dto: ProductDto) {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    categoryId: dto.category,
    categoryName: dto.category_name,
    unit: dto.unit || null,
    price: parseFloat(dto.price),
    discountPrice: dto.discount_price ? parseFloat(dto.discount_price) : null,
    finalPrice: parseFloat(dto.final_price),
    sku: dto.sku,
    stock: dto.stock,
    isAvailable: dto.is_available,
    imageUrl: dto.image,
    images: dto.images.map((img) => ({ id: img.id, url: img.image, isFeature: img.is_feature })),
    videos: dto.videos.map((v) => ({ id: v.id, url: v.video_url || v.video_file || "", title: v.title })),
    averageRating: dto.average_rating,
    totalReviews: dto.total_reviews,
    expectedDeliveryTime: dto.expected_delivery_time,
    discountTiers: dto.discount_tiers.map((t) => ({
      id: t.id,
      minQuantity: t.min_quantity,
      discountPrice: t.discount_price ? parseFloat(t.discount_price) : null,
      discountPercentage: t.discount_percentage !== undefined && t.discount_percentage !== null
        ? parseFloat(String(t.discount_percentage))
        : null,
    })),
    deliveryTiers: dto.delivery_tiers.map((t) => ({
      id: t.id,
      name: t.name || `${t.min_quantity}+`,
      cost: t.cost ? parseFloat(t.cost) : null,
      estimatedDays: t.estimated_days || `${t.delivery_days} days`,
      minQuantity: t.min_quantity,
      deliveryDays: t.delivery_days,
    })),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ReturnType<typeof mapDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const dto = await productsApi.details(Number(id));
      setProduct(mapDto(dto));
    } catch (e: any) {
      setError(e?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const statusBadge = useMemo(() => {
    if (!product) return null;
    const status = product.isAvailable
      ? (product.stock > 0 ? "Active" : "Out of Stock")
      : "Draft";
    const cls =
      status === "Active"
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : status === "Out of Stock"
        ? "bg-rose-50 text-rose-600 border-rose-100"
        : "bg-gray-50 text-gray-600 border-gray-200";
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${cls}`}>{status}</span>;
  }, [product]);

  return (
    <div className="min-h-screen w-full text-[#18181B] bg-[#FDFDFD]">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/products")}
              className="p-2 border border-[#EEEEEE] rounded-lg hover:bg-gray-50 transition-colors"
              title="Back"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {product?.name || "Product"}
              </h1>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Product Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            <button
              disabled={!product}
              onClick={() => navigate(`/admin/products/edit/${product?.id}`)}
              className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-[#222]"
              title="Edit Product"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>
        </div>

        {loading && <div className="p-6 bg-white border border-[#EEEEEE] rounded-2xl">Loading…</div>}
        {error && <div className="p-6 bg-white border border-[#EEEEEE] rounded-2xl text-rose-600">{error}</div>}
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-28 h-28 rounded-xl bg-slate-100 flex items-center justify-center border border-[#EEEEEE] overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={28} className="text-[#A1A1AA]" />
                    )}
                  </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <div>
                      <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Name</p>
                      <p className="text-sm font-bold">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Slug</p>
                      <p className="text-sm font-bold">{product.slug}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Category</p>
                      <p className="text-sm font-bold">{product.categoryName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">SKU</p>
                      <p className="text-sm font-bold">{product.sku}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Unit</p>
                      <p className="text-sm font-bold">
                        {product.unit === "kg" ? "Kg" : product.unit === "piece" ? "Piece" : product.unit === "Gram" ? "100g" : (product.unit || "—")}
                      </p>
                    </div>
                  </div>
                </div>
                {product.description && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-1">Description</p>
                    <p className="text-sm whitespace-pre-line">{product.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Price</p>
                  <p className="text-lg font-black">AED {product.finalPrice.toLocaleString()}</p>
                  {product.discountPrice !== null && product.discountPrice < product.price && (
                    <p className="text-[11px] text-[#A1A1AA] line-through">AED {product.price.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Stock</p>
                  <p className="text-lg font-black">{product.stock}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Delivery</p>
                  <p className="text-sm font-bold flex items-center gap-2"><Clock size={12} /> {product.expectedDeliveryTime || "—"}</p>
                </div>
              </div>

              {!!product.images.length && (
                <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3 flex items-center gap-2"><ImageIcon size={12} /> Images</p>
                  <div className="flex flex-wrap gap-3">
                    {product.images.map((img) => (
                      <div key={img.id} className="w-28 h-28 rounded-xl border border-[#EEEEEE] overflow-hidden">
                        <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!!product.videos.length && (
                <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3 flex items-center gap-2"><Video size={12} /> Videos</p>
                  <ul className="list-disc pl-5 text-sm">
                    {product.videos.map((v) => (
                      <li key={v.id} className="mb-1">
                        {v.title || "Video"} — <a href={v.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Open</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star size={14} className={`${product.averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-[#D4D4D8]"}`} />
                    <span className="text-xs font-bold">{product.averageRating.toFixed(1)} ({product.totalReviews})</span>
                  </div>
                </div>
                {!!product.discountTiers.length && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 flex items-center gap-2"><Tag size={12} /> Discount Tiers</p>
                    <div className="space-y-2">
                      {product.discountTiers.map((t) => {
                        const right = t.discountPercentage !== null && !isNaN(t.discountPercentage)
                          ? `${t.discountPercentage}%`
                          : (t.discountPrice !== null ? `${t.discountPrice}` : "—");
                        return (
                          <div key={t.id ?? `${t.minQuantity}-dp`} className="flex items-center justify-between text-sm">
                            <span>{t.minQuantity}+ units</span>
                            <span className="font-bold">{right}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!!product.deliveryTiers.length && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2 flex items-center gap-2"><Truck size={12} /> Delivery Tiers</p>
                    <div className="space-y-2">
                      {product.deliveryTiers.map((t) => {
                        const right = t.deliveryDays ? `${t.deliveryDays} days` : (t.estimatedDays || "—");
                        return (
                          <div key={t.id ?? `${t.minQuantity}-dl`} className="flex items-center justify-between text-sm">
                            <span>{t.minQuantity ? `${t.minQuantity}+ units` : t.name}</span>
                            <span className="font-bold">{right}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="text-[10px] text-[#A1A1AA]">
                  <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(product.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
