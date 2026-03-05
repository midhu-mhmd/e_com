import React, { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, UploadCloud, Plus, Trash2, Image as ImageIcon, Film, AlertCircle } from "lucide-react";
import {
    productsActions,
    selectProductsStatus,
    selectProductsError,
} from "./productsSlice";
import type { ProductDto } from "./productApi";
import { productsApi } from "./productApi";

/* ─────────────────────────────────────────────
   Extended Interface for Form Handling
   ───────────────────────────────────────────── */
interface ProductFormValues extends Omit<Partial<ProductDto>, 'image'> {
    image?: string | FileList | null;
    new_gallery_images?: FileList;
    new_videos?: FileList;
}

/* ─────────────────────────────────────────────
   Wrapper Component: Handles Data Fetching
   ───────────────────────────────────────────── */
const EditProduct: React.FC = () => {
    const { id } = useParams();
    const productId = Number(id);
    const navigate = useNavigate();

    const [dto, setDto] = useState<ProductDto | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(productId)) return;
        let cancelled = false;

        const fetchProduct = async () => {
            try {
                const data = await productsApi.details(productId);
                if (!cancelled) setDto(data);
            } catch (e: any) {
                if (!cancelled) setFetchError(e?.message || "Failed to load product");
            }
        };

        fetchProduct();
        return () => { cancelled = true; };
    }, [productId]);

    if (fetchError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FDFDFD]">
                <p className="text-rose-500 font-bold">{fetchError}</p>
                <button
                    onClick={() => navigate("/admin/products")}
                    className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    if (!dto) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
                <Loader2 className="animate-spin text-zinc-300" size={40} />
            </div>
        );
    }

    return <EditProductForm dto={dto} productId={productId} />;
};

/* ─────────────────────────────────────────────
   Form Component: Handles Logic & Submission
   ───────────────────────────────────────────── */
interface EditProductFormProps {
    dto: ProductDto;
    productId: number;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ dto, productId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const submitted = useRef(false);

    const status = useSelector(selectProductsStatus);
    const backendError = useSelector(selectProductsError);

    const [existingImages, setExistingImages] = useState(dto.images || []);
    const [existingVideos, setExistingVideos] = useState(dto.videos || []);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<ProductFormValues>({
        defaultValues: dto
    });

    const { fields: discountFields, append: appendDiscount, remove: removeDiscount } = useFieldArray({
        control,
        name: "discount_tiers"
    });

    const { fields: deliveryFields, append: appendDelivery, remove: removeDelivery } = useFieldArray({
        control,
        name: "delivery_tiers"
    });

    useEffect(() => {
        if (dto) {
            reset({
                ...dto,
                name: dto.name || "",
                description: dto.description || "",
                price: dto.price,
                discount_price: dto.discount_price || "",
                stock: dto.stock,
                category: dto.category,
                sku: dto.sku || "",
                is_available: dto.is_available,
                expected_delivery_time: dto.expected_delivery_time || "",
                discount_tiers: dto.discount_tiers || [],
                delivery_tiers: dto.delivery_tiers || [],
            });
            setExistingImages(dto.images || []);
            setExistingVideos(dto.videos || []);
        }
    }, [dto, reset]);

    useEffect(() => {
        dispatch(productsActions.resetStatus());
        return () => { dispatch(productsActions.resetStatus()); };
    }, [dispatch]);

    useEffect(() => {
        if (status === "succeeded" && submitted.current) {
            navigate("/admin/products");
        }
    }, [status, navigate]);

    // Handle Frontend Validation failures to ensure silent blocking doesn't happen
    const onInvalid = (errors: any) => {
        console.error("Form Validation Errors:", errors);
        setValidationError("Please fill out all required fields correctly.");
    };

    const onSubmit = (data: ProductFormValues) => {
        setValidationError(null);
        submitted.current = true;
        const formData = new FormData();

        // 1. Append Standard Text & Number Fields
        formData.append("name", data.name || "");
        formData.append("description", data.description || "");
        formData.append("category", String(data.category));
        formData.append("price", String(data.price));
        formData.append("stock", String(data.stock));
        formData.append("is_available", data.is_available ? "true" : "false");

        // Safely handle discount price so backend doesn't crash on empty string
        if (data.discount_price) {
            formData.append("discount_price", String(data.discount_price));
        } else {
            formData.append("discount_price", "");
        }

        if (data.sku) formData.append("sku", data.sku);
        if (data.expected_delivery_time) formData.append("expected_delivery_time", data.expected_delivery_time);

        // 2. Append Arrays (Sent as JSON strings, standard for nested DRF processing)
        formData.append("discount_tiers", JSON.stringify(data.discount_tiers || []));
        formData.append("delivery_tiers", JSON.stringify(data.delivery_tiers || []));

        formData.append("retained_image_ids", JSON.stringify(existingImages.map(img => img.id)));
        formData.append("retained_video_ids", JSON.stringify(existingVideos.map(vid => vid.id)));

        // 3. Append Files (Checking if it's a FileList and not the existing URL string)
        if (data.image && data.image instanceof FileList && data.image.length > 0) {
            formData.append("image", data.image[0]);
        }

        if (data.new_gallery_images && data.new_gallery_images.length > 0) {
            Array.from(data.new_gallery_images).forEach((file) => {
                formData.append("uploaded_images", file);
            });
        }

        if (data.new_videos && data.new_videos.length > 0) {
            Array.from(data.new_videos).forEach((file) => {
                formData.append("uploaded_videos", file);
            });
        }

        dispatch(productsActions.updateProductRequest({ id: productId, data: formData }));
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-12 space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-[#F4F4F5] rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                        <p className="text-sm text-[#71717A]">Update inventory, pricing tiers, and media.</p>
                    </div>
                </div>
            </div>

            {/* Error Displays */}
            {(backendError || validationError) && (
                <div className="max-w-4xl mx-auto bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-medium border border-rose-200 flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Failed to save changes</p>
                        <p className="opacity-90">{validationError || (typeof backendError === 'string' ? backendError : JSON.stringify(backendError))}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="max-w-4xl mx-auto space-y-8 pb-24">

                {/* Basic Info */}
                <section className="bg-white border border-[#EEEEEE] rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">Basic Information</h2>
                        <span className="text-xs font-mono bg-slate-100 text-slate-500 px-3 py-1 rounded-lg">Slug: {dto.slug}</span>
                    </div>
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Product Name</label>
                            <input
                                {...register("name", { required: "Name is required" })}
                                className={`w-full px-4 py-3 bg-[#FAFAFA] border-2 rounded-xl text-sm font-medium focus:ring-2 outline-none transition-all ${errors.name ? 'border-rose-200 focus:border-rose-400 focus:ring-rose-100' : 'border-transparent focus:border-black focus:ring-black/5'}`}
                                placeholder="Product name"
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] font-bold">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Description</label>
                            <textarea
                                {...register("description", { required: "Description is required" })}
                                className={`w-full px-4 py-3 bg-[#FAFAFA] border-2 rounded-xl text-sm font-medium focus:ring-2 outline-none transition-all h-32 resize-none ${errors.description ? 'border-rose-200 focus:border-rose-400 focus:ring-rose-100' : 'border-transparent focus:border-black focus:ring-black/5'}`}
                                placeholder="Describe the product..."
                            />
                            {errors.description && <p className="text-rose-500 text-[10px] font-bold">{errors.description.message}</p>}
                        </div>
                    </div>
                </section>

                {/* Pricing & Inventory */}
                <section className="bg-white border border-[#EEEEEE] rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">Pricing & Inventory</h2>
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">
                            Final Price: AED {dto.final_price}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Price (AED)</label>
                            <input
                                type="number" step="0.01"
                                {...register("price", { required: "Price is required" })}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Discount Price</label>
                            <input
                                type="number" step="0.01"
                                {...register("discount_price")}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Stock</label>
                            <input
                                type="number"
                                {...register("stock", { required: "Stock is required", min: 0 })}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Advanced Tiers Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Discount Tiers */}
                    <section className="bg-white border border-[#EEEEEE] rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Discount Tiers</h2>
                            <button
                                type="button"
                                onClick={() => appendDiscount({ min_quantity: 1, discount_price: "" as any })}
                                className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:text-cyan-700"
                            >
                                <Plus size={14} /> Add Tier
                            </button>
                        </div>
                        <div className="space-y-3">
                            {discountFields.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-center bg-[#FAFAFA] p-3 rounded-xl border border-slate-100">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Min Qty</label>
                                        <input type="number" {...register(`discount_tiers.${index}.min_quantity` as const)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-black" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Price</label>
                                        <input type="number" step="0.01" {...register(`discount_tiers.${index}.discount_price` as const)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-black" />
                                    </div>
                                    <button type="button" onClick={() => removeDiscount(index)} className="mt-5 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {discountFields.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No wholesale tiers configured.</p>}
                        </div>
                    </section>

                    {/* Delivery Tiers */}
                    <section className="bg-white border border-[#EEEEEE] rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Delivery Tiers</h2>
                            <button
                                type="button"
                                onClick={() => appendDelivery({ name: "", cost: "" as any, estimated_days: "" })}
                                className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:text-cyan-700"
                            >
                                <Plus size={14} /> Add Tier
                            </button>
                        </div>
                        <div className="space-y-3">
                            {deliveryFields.map((item, index) => (
                                <div key={item.id} className="flex flex-col gap-3 bg-[#FAFAFA] p-3 rounded-xl border border-slate-100 relative">
                                    <button type="button" onClick={() => removeDelivery(index)} className="absolute top-3 right-3 text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="space-y-1 pr-8">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Region / Name</label>
                                        <input type="text" {...register(`delivery_tiers.${index}.name` as const)} placeholder="e.g. Dubai" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-black" />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Cost (AED)</label>
                                            <input type="number" step="0.01" {...register(`delivery_tiers.${index}.cost` as const)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-black" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                                            <input type="text" {...register(`delivery_tiers.${index}.estimated_days` as const)} placeholder="e.g. 1 Day" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-black" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {deliveryFields.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Standard delivery applies.</p>}
                        </div>
                    </section>
                </div>

                {/* Organization */}
                <section className="bg-white border border-[#EEEEEE] rounded-2xl p-6 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold">Organization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Category ID</label>
                            <input
                                type="number"
                                {...register("category", { required: "Category ID is required" })}
                                className={`w-full px-4 py-3 bg-[#FAFAFA] border-2 rounded-xl text-sm font-medium focus:ring-2 outline-none transition-all ${errors.category ? 'border-rose-200 focus:border-rose-400 focus:ring-rose-100' : 'border-transparent focus:border-black focus:ring-black/5'}`}
                            />
                            {errors.category && <p className="text-rose-500 text-[10px] font-bold">{errors.category.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#A1A1AA]">Unit / SKU</label>
                            <input
                                {...register("sku")}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            {...register("is_available")}
                            className="w-5 h-5 accent-black rounded cursor-pointer"
                        />
                        <label className="text-sm font-medium cursor-pointer">Available for purchase</label>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-[#A1A1AA]">Expected Delivery Time</label>
                        <input
                            {...register("expected_delivery_time")}
                            placeholder="e.g. 2-3 business days"
                            className="w-full px-4 py-3 bg-[#FAFAFA] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                    </div>
                </section>

                {/* Media Section */}
                <section className="bg-white border border-[#EEEEEE] rounded-2xl p-6 shadow-sm space-y-8">
                    <h2 className="text-lg font-bold">Product Media</h2>

                    {/* Main Cover Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><ImageIcon size={16} /> Main Cover Image</h3>
                        <MainImageUpload register={register} watch={watch} existingImageUrl={dto.image || undefined} />
                    </div>

                    <hr className="border-slate-100" />

                    {/* Gallery Images */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><ImageIcon size={16} /> Gallery Images</h3>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 group">
                                        <img src={img.image} alt="Gallery" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setExistingImages(prev => prev.filter(i => i.id !== img.id))}
                                            className="absolute top-1 right-1 bg-white/90 text-rose-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Images Input */}
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                            <input type="file" multiple accept="image/*" {...register("new_gallery_images")} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-sm font-bold text-cyan-600">Select new gallery images to add</p>
                            <p className="text-xs text-slate-400 mt-1">{(watch("new_gallery_images")?.length || 0)} files selected</p>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Videos */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Film size={16} /> Videos</h3>

                        {existingVideos.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {existingVideos.map((vid) => (
                                    <div key={vid.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <a href={vid.video_url || vid.video_file || undefined} target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-600 hover:underline truncate">
                                            {vid.title || "Product Video"}
                                        </a>
                                        <button type="button" onClick={() => setExistingVideos(prev => prev.filter(v => v.id !== vid.id))} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                            <input type="file" multiple accept="video/*" {...register("new_videos")} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <UploadCloud size={24} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-sm font-bold text-cyan-600">Select new videos to upload</p>
                            <p className="text-xs text-slate-400 mt-1">{(watch("new_videos")?.length || 0)} files selected</p>
                        </div>
                    </div>

                </section>

                {/* Fixed Footer Actions */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl flex items-center justify-end gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl z-50">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                        className="px-6 py-3 rounded-xl font-bold text-sm text-zinc-500 hover:bg-slate-100 transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="px-8 py-3 bg-black text-white rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                    >
                        {status === "loading" && <Loader2 size={16} className="animate-spin" />}
                        {status === "loading" ? "Updating..." : "Save Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Image Sub-component
   ───────────────────────────────────────────── */
const MainImageUpload = ({ register, watch, existingImageUrl }: any) => {
    const files = watch("image");
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (files && files.length > 0 && files[0] instanceof Blob) {
            const objectUrl = URL.createObjectURL(files[0]);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [files]);

    const activePreview = preview || existingImageUrl;

    return (
        <div className={`border-2 border-dashed border-[#E4E4E7] rounded-xl flex flex-col items-center justify-center text-center bg-[#FAFAFA] relative cursor-pointer overflow-hidden ${activePreview ? "p-0" : "p-10"}`}>
            <input type="file" accept="image/*" {...register("image")} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
            {activePreview ? (
                <div className="relative w-full h-72">
                    <img src={activePreview} alt="Main Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <span className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold shadow-lg">Replace Main Image</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm"><UploadCloud size={24} className="text-zinc-400" /></div>
                    <p className="text-sm font-bold text-slate-600">Click to upload main product image</p>
                </div>
            )}
        </div>
    );
};

export default EditProduct;