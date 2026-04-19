import React, { useEffect, useRef, useState } from "react";
import { Star, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import InfiniteScrollTrack from "../ui/InfiniteScrollTrack";

import { reviewsApi, type ReviewDto } from "../../features/admin/reviews/reviewsApi";

const isCustomerReview = (review: ReviewDto) => {
    const author = (review.user_name || "").trim().toLowerCase();
    return author !== "admin" && !author.includes("admin");
};

/* ── Component ── */
const ReviewsSection: React.FC = () => {
    const { t } = useTranslation("home");
    const [reviews, setReviews] = useState<ReviewDto[]>([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await reviewsApi.list({ limit: 10 });
                // Show only 4-5 star reviews for social proof
                const results = (data.results || []).filter(isCustomerReview);
                const good = results.filter((r) => r.rating >= 4);
                setReviews(good.length > 0 ? good : results);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                // Use fallback reviews if API fails
                setReviews(fallbackReviews as ReviewDto[]); // Cast to ReviewDto[] for type safety
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

    // Calculate average rating
    const avgRating =
        displayReviews.length > 0
            ? (displayReviews as ReviewDto[]).reduce((sum: number, r: ReviewDto) => sum + r.rating, 0) / displayReviews.length
            : 4.8;

    const updateScrollButtons = () => {
        const el = carouselRef.current;
        if (!el) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }

        const threshold = 4;
        const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
        setCanScrollLeft(el.scrollLeft > threshold);
        setCanScrollRight(maxScrollLeft - el.scrollLeft > threshold);
    };

    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;

        updateScrollButtons();
        const onScroll = () => updateScrollButtons();
        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        const rafId = window.requestAnimationFrame(updateScrollButtons);

        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            window.cancelAnimationFrame(rafId);
        };
    }, [loading, displayReviews.length]);

    const handleArrowScroll = (direction: "left" | "right") => {
        const el = carouselRef.current;
        if (!el) return;

        const delta = Math.max(280, Math.floor(el.clientWidth * 0.75));
        const amount = direction === "left" ? -delta : delta;
        el.scrollBy({ left: amount, behavior: "smooth" });
    };

    return (
        <section className="relative bg-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background deco */}
            <div className="pointer-events-none absolute -top-40 right-0 w-[280px] sm:w-[400px] lg:w-[500px] h-[280px] sm:h-[400px] lg:h-[500px] bg-cyan-50/40 rounded-full blur-3xl opacity-60" />
            <div className="pointer-events-none absolute -bottom-40 left-0 w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] bg-yellow-50/40 rounded-full blur-3xl opacity-50" />

            <div className="relative mx-auto  ">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-100 rounded-full mb-4">
                            <MessageCircle size={14} className="text-cyan-500" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600">
                                {t("reviews.kicker")}
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                            {t("reviews.title")}{" "}
                            <span className="text-cyan-600">
                                {t("reviews.titleHighlight")}
                            </span>
                        </h2>
                        <p className="mt-3 text-zinc-500 text-sm max-w-md">
                            {t("reviews.subtitle")}
                        </p>
                    </div>

                    {/* Rating summary card */}
                    <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <div className="text-center">
                            <p className="text-3xl font-extrabold text-zinc-900">{avgRating.toFixed(1)}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={12}
                                        className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Arrows */}
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={() => handleArrowScroll("left")}
                                disabled={!canScrollLeft}
                                className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={18} className="rtl-flip" />
                            </button>
                            <button
                                onClick={() => handleArrowScroll("right")}
                                disabled={!canScrollRight}
                                className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight size={18} className="rtl-flip" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Skeleton */}
                {loading && (
                    <div className="flex gap-5 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="min-w-[280px] sm:min-w-[340px] bg-zinc-50 rounded-2xl p-6 animate-pulse">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-11 h-11 bg-zinc-200 rounded-full" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-24 bg-zinc-200 rounded" />
                                        <div className="h-2 w-16 bg-zinc-200 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-zinc-200 rounded" />
                                    <div className="h-3 w-3/4 bg-zinc-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reviews Carousel */}
                {!loading && (
                    <InfiniteScrollTrack
                        items={displayReviews}
                        speed={0.5}
                        copies={4}
                        scrollRef={carouselRef}
                        outerClassName="overflow-hidden py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                        gap="gap-4 sm:gap-5"
                        renderItem={(review, i) => (
                            <ReviewCard review={review} index={i} />
                        )}
                    />
                )}
            </div>
        </section>
    );
};

/* ── Review Card ── */
const ReviewCard: React.FC<{ review: ReviewDto; index: number }> = ({ review, index }) => {
    const { t } = useTranslation("home");
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const name = review.user_name || `${t("reviews.customerLabel")} #${review.user || review.id}`;
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const timeAgo = getTimeAgo(review.created_at, t);

    // Rotating pastel colors for avatars
    const avatarColors = [
        "bg-cyan-100 text-cyan-600",
        "bg-yellow-100 text-yellow-600",
        "bg-cyan-50 text-cyan-500",
        "bg-yellow-50 text-yellow-500",
        "bg-cyan-200 text-cyan-700",
        "bg-yellow-200 text-yellow-700",
    ];
    const colorClass = avatarColors[index % avatarColors.length];

    return (
        <div
            ref={ref}
            className={`group relative min-w-[280px] sm:min-w-[340px] bg-white border border-zinc-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-default ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            style={{ transitionDelay: `${index * 60}ms` }}
        >
            {/* Content Section - Force LTR for English comments */}
            <div dir="ltr" className="text-left">
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
                        />
                    ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-zinc-600 leading-relaxed mb-3 line-clamp-3 sm:line-clamp-4 italic">
                    {review.comment}
                </p>

                {/* Product tag */}
                {review.product_name && (
                    <div className="inline-flex px-2.5 py-1 bg-zinc-50 border border-zinc-100 rounded-lg mb-4">
                        <span className="text-[10px] font-bold text-zinc-500">
                            🐟 {review.product_name}
                        </span>
                    </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold`}>
                        {initials}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-900">{name}</p>
                        <p className="text-[10px] text-zinc-400">{timeAgo}</p>
                    </div>
                    <div className="ms-auto">
                        <span className="text-[9px] font-bold text-cyan-500 bg-cyan-50 px-2 py-0.5 rounded">
                            {t("reviews.verified")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Time ago helper ── */
function getTimeAgo(dateStr: string, t: any): string {
    try {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}${t("reviews.timeAgo.m")}`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}${t("reviews.timeAgo.h")}`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}${t("reviews.timeAgo.d")}`;
        const months = Math.floor(days / 30);
        return `${months}${t("reviews.timeAgo.mo")}`;
    } catch {
        return t("reviews.timeAgo.recently");
    }
}

/* ── Fallback reviews ── */
const fallbackReviews: ReviewDto[] = [
    { id: 1, product: 0, user: 0, rating: 5, comment: "The prawns were incredibly fresh — like they just came off the boat! Packaging was ice-cold and delivery was right on time. Best seafood service in Mumbai!", product_name: "Tiger Prawns (500g)", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), is_visible: true, updated_at: "", admin_response: null, images: [] },
    { id: 2, product: 0, user: 0, rating: 5, comment: "I've tried multiple online fish shops and nothing comes close to FreshCatch. The Pomfret was cleaned perfectly and vacuum-sealed. Will order again!", product_name: "White Pomfret", created_at: new Date(Date.now() - 5 * 86400000).toISOString(), is_visible: true, updated_at: "", admin_response: null, images: [] },
    { id: 3, product: 0, user: 0, rating: 4, comment: "Ordered the Surmai steaks for a family dinner. Everyone loved it! The quality is restaurant-grade. Only wish they had more cut options.", product_name: "Surmai Steaks", created_at: new Date(Date.now() - 7 * 86400000).toISOString(), is_visible: true, updated_at: "", admin_response: null, images: [] },
    { id: 4, product: 0, user: 0, rating: 5, comment: "Same-day delivery, perfectly cold packaging, and the fish was fresh beyond my expectations. This is how seafood delivery should be done.", product_name: "Rohu Fish", created_at: new Date(Date.now() - 10 * 86400000).toISOString(), is_visible: true, updated_at: "", admin_response: null, images: [] },
    { id: 5, product: 0, user: 0, rating: 5, comment: "The crab was massive and super fresh. My mother-in-law said it tasted just like the ones from the market. Huge compliment! Thank you FreshCatch!", product_name: "Live Mud Crab", created_at: new Date(Date.now() - 14 * 86400000).toISOString(), is_visible: true, updated_at: "", admin_response: null, images: [] },
    { id: 6, product: 0, user: 0, rating: 4, comment: "Great squid rings — cleaned, cut, and ready to fry. Saved me so much prep time. The app is easy to use and the delivery slot system is very convenient.", product_name: "Squid Rings (300g)", created_at: new Date(Date.now() - 21 * 86400000).toISOString(), is_visible: true, updated_at: "", admin_response: null, images: [] },
];

export default ReviewsSection;
