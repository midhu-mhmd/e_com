import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { bannerApi, type BannerDto } from "../features/admin/banners/bannerApi";
import { productsApi, type ProductsQuery } from "../features/admin/products/productApi";
import { profileApi } from "../features/user/profileApi";
import { reviewsApi } from "../features/admin/reviews/reviewsApi";
import { api } from "../services/api";

export interface DeliveryOfferDto {
    id: number;
    title: string;
    subtitle: string | null;
    badge: string | null;
    description: string | null;
    cta_text: string | null;
    cta_link: string | null;
    tickerText: string;
    is_active: boolean;
    order: number;
}

const normalizeDeliveryOffer = (item: any, index: number): DeliveryOfferDto => {
    const title = String(
        item?.title ??
        item?.name ??
        item?.message ??
        item?.description ??
        item?.subtitle ??
        item?.code ??
        `Offer ${index + 1}`
    ).trim();
    const subtitle = item?.subtitle ?? item?.short_description ?? null;
    const badge = item?.badge ?? item?.tag ?? item?.label ?? item?.code ?? null;
    const description = item?.description ?? item?.message ?? null;
    const ctaText = item?.cta_text ?? item?.cta ?? item?.call_to_action ?? null;
    const ctaLink = item?.cta_link ?? item?.link ?? null;
    const tickerParts = [badge, title, subtitle].map((part) => String(part ?? "").trim()).filter(Boolean);

    return {
        id: Number(item?.id ?? index + 1),
        title,
        subtitle: subtitle ? String(subtitle).trim() : null,
        badge: badge ? String(badge).trim() : null,
        description: description ? String(description).trim() : null,
        cta_text: ctaText ? String(ctaText).trim() : null,
        cta_link: ctaLink ? String(ctaLink).trim() : null,
        tickerText: tickerParts.join(" • ") || title,
        is_active: item?.is_active ?? item?.active ?? true,
        order: Number(item?.sort_order ?? item?.order ?? item?.id ?? index + 1),
    };
};

type DeliveryOffersResponse = {
    results?: any[];
    data?: any[];
};

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

export const useDeliveryOffers = () =>
    useQuery<DeliveryOfferDto[]>({
        queryKey: ["delivery-offers"],
        queryFn: async () => {
            const response = await api.get<DeliveryOffersResponse | DeliveryOfferDto[] | any>("/marketing/promotional/delivery_offers/");
            const rawItems = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.results)
                    ? response.data.results
                    : Array.isArray(response.data?.data)
                        ? response.data.data
                        : [];

            const normalizedOffers = rawItems.map((item: any, index: number) => normalizeDeliveryOffer(item, index));

            return normalizedOffers
                .filter((item: DeliveryOfferDto) => item.is_active !== false)
                .sort((left: DeliveryOfferDto, right: DeliveryOfferDto) => left.order - right.order);
        },
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

/* ══════════════════════════════════════════
   Category Hooks
   ══════════════════════════════════════════ */

export const useCategories = () =>
    useQuery({
        queryKey: ["categories"],
        queryFn: () => productsApi.listCategories(),
        staleTime: 10 * 60 * 1000, // Categories change slowly
    });
