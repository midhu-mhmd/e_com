import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { bannerApi, type BannerDto } from "../features/admin/banners/bannerApi";
import { productsApi, type ProductsQuery } from "../features/admin/products/productApi";
import { profileApi } from "../features/user/profileApi";
import { reviewsApi } from "../features/admin/reviews/reviewsApi";

/* ══════════════════════════════════════════
   Banner Hooks
   ══════════════════════════════════════════ */

/** Fetch all banners — shared cache across Hero + Offers */
export const useBanners = () =>
    useQuery<BannerDto[]>({
        queryKey: ["banners"],
        queryFn: () => bannerApi.list(),
        staleTime: 5 * 60 * 1000,
    });

/* ══════════════════════════════════════════
   Product Hooks
   ══════════════════════════════════════════ */

/** Bestsellers for the home page */
export const useBestsellers = () =>
    useQuery({
        queryKey: ["bestsellers"],
        queryFn: () => productsApi.list({ limit: 12, ordering: "created_at" }),
        staleTime: 5 * 60 * 1000,
    });

/** Product list with pagination, search, and category filters */
export const useProducts = (params: ProductsQuery) =>
    useQuery({
        queryKey: ["products", params],
        queryFn: () => productsApi.list(params),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

/** Infinite product list for Load More pagination */
export const useInfiniteProducts = (
    filters: Omit<ProductsQuery, "offset">,
    limit: number = 12
) =>
    useInfiniteQuery({
        queryKey: ["products-infinite", filters],
        queryFn: ({ pageParam = 0 }) =>
            productsApi.list({ ...filters, limit, offset: pageParam as number }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, p) => sum + p.results.length, 0);
            return loaded < lastPage.count ? loaded : undefined;
        },
        staleTime: 2 * 60 * 1000,
    });

/** Single product details by ID */
export const useProductDetails = (id: number | undefined) =>
    useQuery({
        queryKey: ["product", id],
        queryFn: () => productsApi.details(id!),
        enabled: !!id,
        staleTime: 3 * 60 * 1000,
    });

export const useProductReviews = (id: number | undefined, limit: number = 10) =>
    useQuery({
        queryKey: ["product-reviews", id, limit],
        queryFn: () => reviewsApi.list({ product: id!, is_visible: true, limit }),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });

/* ══════════════════════════════════════════
   User Profile Hook
   ══════════════════════════════════════════ */

/**
 * User profile hook — uses Redux state as initial data and only fetches if not present in Redux
 */
export const useUserProfile = (enabled: boolean = true) => {
    const user = useSelector((state: any) => state.auth.user);
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: () => profileApi.getMe(),
        enabled: enabled && !user, // Only fetch if not already in Redux
        staleTime: 5 * 60 * 1000,
        initialData: user || undefined,
    });
};
