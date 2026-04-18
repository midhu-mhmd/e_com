import type { OrderCounts, RecentOrder, Review, Product } from "../../../types/admin";
import { BRAND_COLORS } from "../../../constants/theme";

export const calculateFulfillmentRate = (counts: OrderCounts | undefined) => {
  if (!counts || counts.total_orders === 0) return null;
  return Math.round((counts.delivered / counts.total_orders) * 100);
};

export const calculateAvgRating = (reviews: Review[]) => {
  if (reviews.length === 0) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
};

export const getRatingDistribution = (reviews: Review[]) => {
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
  }));
  const maxRatingCount = Math.max(...ratingDist.map(r => r.count), 1);
  return { ratingDist, maxRatingCount };
};

export const getInventoryStats = (products: Product[]) => {
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const healthyCount = products.filter(p => p.stock > 10).length;
  const totalProductCount = products.length || 1;
  const healthPct = (healthyCount / totalProductCount) * 100;
  
  const healthColor =
    healthPct >= 70
      ? BRAND_COLORS.CYAN
      : healthPct >= 40
      ? BRAND_COLORS.GOLD
      : BRAND_COLORS.RED;

  return { outOfStockCount, lowStockCount, healthyCount, totalProductCount, healthPct, healthColor };
};

export const getTopProducts = (orders: RecentOrder[], limit = 5) => {
  const map = new Map<string, { name: string; sales: number }>();
  orders.forEach(o =>
    o.items.forEach(item => {
      const e = map.get(item.product_name) ?? { name: item.product_name, sales: 0 };
      e.sales += item.quantity;
      map.set(item.product_name, e);
    })
  );
  return [...map.values()].sort((a, b) => b.sales - a.sales).slice(0, limit);
};

export const getEmirateBreakdown = (orders: RecentOrder[], limit = 5) => {
  const map = new Map<string, number>();
  orders.forEach(o => {
    const em = o.shipping_address_details?.emirate;
    if (em) map.set(em, (map.get(em) ?? 0) + 1);
  });
  const breakdown = [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  const maxEmirateCount = breakdown[0]?.count ?? 1;
  return { breakdown, maxEmirateCount };
};

export const getPaymentSplit = (orders: RecentOrder[]) => {
  const map = new Map<string, number>();
  orders.forEach(o => {
    const m = o.payment?.payment_method ?? "other";
    map.set(m, (map.get(m) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);
};

export const getDonutSegments = (c: OrderCounts | undefined) => {
  if (!c) return [];
  
  const knownCount = 
    (c.delivered ?? 0) + 
    (c.shipped ?? 0) + 
    (c.processing ?? 0) + 
    (c.pending ?? 0) + 
    (c.paid ?? 0) + 
    (c.cancelled ?? 0);
    
  const otherOrders = Math.max(0, c.total_orders - knownCount);
  
  return [
    { label: "Completed", value: c.delivered ?? 0, color: BRAND_COLORS.CYAN },
    { label: "In Prog.", value: (c.shipped ?? 0) + (c.processing ?? 0) + (c.paid ?? 0), color: BRAND_COLORS.GOLD },
    { label: "Pending", value: (c.pending ?? 0) + (c.cancelled ?? 0) + otherOrders, color: BRAND_COLORS.RED },
  ].filter(s => s.value > 0);
};

export const getDashboardInsights = (
  topProducts: { name: string; sales: number }[],
  fulfillmentRate: number | null,
  paidUnassignedCount: number,
  availableDBoysCount: number,
  outOfStockCount: number,
  avgRating: number | null,
  topEmirate: string | undefined
) => {
  const insights: { title: string; text: string }[] = [];
  
  if (topProducts[0]?.sales > 0) {
    insights.push({ 
      title: "Trending Product", 
      text: `${topProducts[0].name} is currently your best-seller with ${topProducts[0].sales} recent unit sales.` 
    });
  }
  
  if (fulfillmentRate !== null) {
    insights.push({ 
      title: "Fulfillment Health", 
      text: `Your successful delivery rate is ${fulfillmentRate}%. ${fulfillmentRate >= 70 ? "Operations are running smoothly." : "Your delivery pipeline needs attention."}` 
    });
  }
  
  if (paidUnassignedCount > 0) {
    insights.push({ 
      title: "Delivery Bottleneck", 
      text: `You have ${paidUnassignedCount} paid order${paidUnassignedCount === 1 ? "" : "s"} waiting for assignment, but only ${availableDBoysCount} rider${availableDBoysCount === 1 ? "" : "s"} ${availableDBoysCount === 1 ? "is" : "are"} currently free.` 
    });
  }
  
  if (outOfStockCount > 0) {
    insights.push({ 
      title: "Inventory Alert", 
      text: `${outOfStockCount} item${outOfStockCount === 1 ? "" : "s"} ${outOfStockCount === 1 ? "has" : "have"} completely run out of stock. Please restock soon to avoid losing sales.` 
    });
  }
  
  if (avgRating !== null) {
    insights.push({ 
      title: "Customer Satisfaction", 
      text: `Your store maintains a strong average rating of ${avgRating.toFixed(1)} out of 5 stars based on recent feedback!` 
    });
  }
  
  if (topEmirate) {
    insights.push({ 
      title: "Top Region", 
      text: `Most of your recent orders are originating from ${topEmirate}.` 
    });
  }
  
  return insights;
};
