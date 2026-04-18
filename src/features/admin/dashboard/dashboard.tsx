import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Star, AlertCircle,
  ChevronRight, Truck, Headphones, Fish,
  BarChart3, RefreshCw, Zap, MessageSquare, MapPin, CreditCard,
  Package, Activity,
} from "lucide-react";
import { BRAND_COLORS } from "../../../constants/theme";
import {
  fetchOrderCounts,
  fetchUsersCount,
  fetchRecentOrders,
  fetchProducts,
  fetchDeliveryBoys,
  fetchSupport,
  fetchReviews
} from "./dashboardApi";
import {
  calculateFulfillmentRate,
  calculateAvgRating,
  getRatingDistribution,
  getInventoryStats,
  getTopProducts,
  getEmirateBreakdown,
  getPaymentSplit,
  getDonutSegments,
  getDashboardInsights
} from "./dashboardUtils";

// Internal Components
import Tooltip from "../../../components/ui/Tooltip";
import { Sparkline, DonutRing, GaugeMeter } from "../../../components/charts/DashboardCharts";
import StatusBadge from "../../../components/admin/StatusBadge";
import SkeletonRow from "../../../components/admin/SkeletonRow";

const {
  CYAN,
  CYAN_DARK,
  CYAN_MEDIUM,
  CYAN_LIGHT
} = BRAND_COLORS;


const Dashboard: React.FC = () => {
  const [isInventoryFlipped, setIsInventoryFlipped] = useState(false);
  const opts = { staleTime: 60_000, refetchOnWindowFocus: false };

  const counts = useQuery({ queryKey: ["dash-counts"], queryFn: fetchOrderCounts, ...opts });
  const usersQ = useQuery({ queryKey: ["dash-users"], queryFn: fetchUsersCount, ...opts });
  const orders = useQuery({ queryKey: ["dash-orders"], queryFn: fetchRecentOrders, ...opts });
  const products = useQuery({ queryKey: ["dash-products"], queryFn: fetchProducts, ...opts });
  const delivery = useQuery({ queryKey: ["dash-delivery"], queryFn: fetchDeliveryBoys, ...opts });
  const support = useQuery({ queryKey: ["dash-support"], queryFn: fetchSupport, ...opts });
  const reviews = useQuery({ queryKey: ["dash-reviews"], queryFn: fetchReviews, ...opts });

  const c = counts.data;
  const availableDBoys = (delivery.data ?? []).filter(d => d.is_active && d.delivery_profile?.is_available);
  const busyDBoys = (delivery.data ?? []).filter(d => d.is_active && !d.delivery_profile?.is_available);
  const totalDBoys = (delivery.data ?? []).filter(d => d.is_active).length;
  const paidUnassigned = (orders.data ?? []).filter(o => o.status === "PAID" && !o.delivery_assignment);
  const lowStock = (products.data ?? []).filter(p => p.stock <= 10).sort((a, b) => a.stock - b.stock).slice(0, 8);

  const fulfillmentRate = calculateFulfillmentRate(c);
  const avgRating = calculateAvgRating(reviews.data ?? []);
  const { ratingDist, maxRatingCount } = getRatingDistribution(reviews.data ?? []);
  const { outOfStockCount, lowStockCount, healthyCount, totalProductCount, healthPct, healthColor } = getInventoryStats(products.data ?? []);

  const topProducts = getTopProducts(orders.data ?? []);
  const { breakdown: emirateBreakdown, maxEmirateCount } = getEmirateBreakdown(orders.data ?? []);
  const paymentSplit = getPaymentSplit(orders.data ?? []);
  const donutSegments = getDonutSegments(c);

  const insights = getDashboardInsights(
    topProducts,
    fulfillmentRate,
    paidUnassigned.length,
    availableDBoys.length,
    outOfStockCount,
    avgRating,
    emirateBreakdown[0]?.name
  );

  const refetchAll = () => {
    counts.refetch(); usersQ.refetch(); orders.refetch();
    products.refetch(); delivery.refetch(); support.refetch(); reviews.refetch();
  };

  const isFetchingAny = counts.isFetching || usersQ.isFetching || orders.isFetching || products.isFetching || delivery.isFetching || support.isFetching || reviews.isFetching;

  return (
    <div className="min-h-screen pb-16 font-sans overflow-x-hidden max-w-full bg-white  p-2" >

      {/* Hero */}
      <div className="rounded-[2.5rem] mb-5 shadow-xl relative" style={{ background: CYAN_DARK }}>
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-x-0 bottom-0 h-24 opacity-20">
            <Sparkline data={[10, 25, 40, 35, 60, 55, 80, 75, 95]} color={CYAN_LIGHT} height={96} />
          </div>
        </div>
        <div className="px-5 md:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 relative z-10">
          <div className="flex justify-between items-start md:items-center w-full md:w-auto md:flex-1 min-w-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Overview</h1>
              <p className="text-[10px] md:text-xs mt-0.5" style={{ color: `${CYAN}99` }}>
                {new Date().toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <button onClick={refetchAll}
              className="md:hidden flex items-center justify-center p-2 rounded-xl transition-all shrink-0"
              style={{ background: "#ffffff14", color: `${CYAN}cc`, border: `1px solid ${CYAN}40` }}
            >
              <RefreshCw size={14} className={isFetchingAny ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex justify-between md:justify-end items-center w-full md:w-auto">
            <Tooltip text="Gross Revenue: Total value of all finalized and paid transactions.">
              <div className="text-left md:text-center pr-3 md:px-5 py-1 border-r" style={{ borderColor: "#ffffff18" }}>
                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: `${CYAN}99` }}>Total Revenue</p>
                {counts.isLoading
                  ? <div className="animate-pulse h-6 md:h-8 w-16 md:w-28 bg-white/10 rounded" />
                  : <h2 className="text-lg md:text-2xl font-black tracking-tight" style={{ color: "white" }}>
                    AED {c ? parseFloat(c.total_revenue).toLocaleString("en-AE", { maximumFractionDigits: 0 }) : "—"}
                  </h2>
                }
              </div>
            </Tooltip>
            {([
              { label: "Orders", value: c ? `${c.total_orders}` : "—", loading: counts.isLoading, color: "white", tip: "Total volume of orders processed in the system." },
              { label: "Fulfilled", value: fulfillmentRate !== null ? `${fulfillmentRate}%` : "—", loading: counts.isLoading, color: CYAN_LIGHT, tip: "Fulfillment Success: Ratio of delivered orders to total placements." },
              { label: "Avg Rating", value: avgRating !== null ? `${avgRating.toFixed(1)}★` : "—", loading: reviews.isLoading, color: CYAN_LIGHT, tip: "Aggregate customer satisfaction score out of 5.0." },
              { label: "Users", value: usersQ.data ? `${usersQ.data.total_users}` : "—", loading: usersQ.isLoading, color: "white", tip: "Total count of registered customers in the database." },
            ] as const).map(m => (
              <Tooltip key={m.label} text={m.tip}>
                <div className={`text-center px-3 md:px-5 py-1 border-r last:border-0 ${['Avg Rating', 'Users'].includes(m.label) ? 'hidden md:block' : ''}`} style={{ borderColor: "#ffffff18" }}>
                  <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: `${CYAN}80` }}>{m.label}</p>
                  {m.loading
                    ? <div className="animate-pulse h-4 md:h-5 w-6 md:w-10 bg-white/10 rounded mx-auto" />
                    : <p className="text-sm md:text-base font-black" style={{ color: m.color }}>{m.value}</p>
                  }
                </div>
              </Tooltip>
            ))}
          </div>

          <button onClick={refetchAll}
            className="hidden md:flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shrink-0 ml-1"
            style={{ background: "#ffffff14", color: `${CYAN}cc`, border: `1px solid ${CYAN}40` }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ffffff22")}
            onMouseLeave={e => (e.currentTarget.style.background = "#ffffff14")}
          >
            <RefreshCw size={12} className={isFetchingAny ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-3/4 md:w-1/3 rounded-t-xl z-10 opacity-90" style={{ background: `linear-gradient(90deg, ${BRAND_COLORS.CYAN}, ${BRAND_COLORS.GOLD}, ${BRAND_COLORS.RED})` }} />
      </div>



      {/* Business Pulse — 4 equal-height cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5" style={{ gridAutoRows: "1fr" }}>

        {/* Order Flow */}
        <div className="bg-white rounded-[2rem] shadow-sm flex flex-col h-[280px] border border-slate-100 group transition-all duration-500">
          <div className="px-6 py-4 flex items-center gap-2 border-b border-slate-50">
            <div className="p-2 rounded-xl" style={{ background: `${CYAN}08` }}>
              <Activity size={14} style={{ color: CYAN }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Transaction Pulse</span>
          </div>
          <div className="flex-1 flex flex-col p-6">
            {counts.isLoading
              ? <div className="animate-pulse flex-1 bg-slate-50 rounded-[2rem]" />
              : <>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <Tooltip text="Lifetime Order Count: Total transaction volume processed (All Statuses).">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300 mb-0.5">Total Loop</p>
                      <p className="text-3xl font-black leading-none" style={{ color: CYAN_DARK }}>{c?.total_orders ?? "—"}</p>
                    </div>
                  </Tooltip>
                  <div className="text-right">
                    <Tooltip text="Fulfillment Success: Percentage of orders successfully delivered to customers.">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300 mb-0.5">Success</p>
                        <p className="text-2xl font-black leading-none" style={{ color: CYAN }}>{fulfillmentRate !== null ? `${fulfillmentRate}%` : "—"}</p>
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full" style={{ background: "radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%)", opacity: 0.5 }} />
                  </div>
                  <Tooltip text="Status Distribution: Real-time visual breakdown of order progress stages.">
                    <div className="relative group-hover:scale-105 transition-transform duration-500 w-20 h-20 lg:w-[100px] lg:h-[100px] mx-auto mb-4">
                      <DonutRing segments={donutSegments} trackColor="#F8FAFC" strokeWidth={12} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1.5">
                        <span className="text-xl lg:text-2xl font-black leading-none" style={{ color: CYAN_DARK }}>
                          {c?.delivered ?? "—"}
                        </span>
                        <span className="text-[7px] lg:text-[8px] text-slate-300 font-black mt-0.5 uppercase tracking-widest">Done</span>
                      </div>
                    </div>
                  </Tooltip>
                  <div className="flex justify-center gap-2 z-20">
                    {donutSegments.filter(s => s.value > 0).slice(0, 3).map(seg => (
                      <div key={seg.label} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: seg.color }} />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">{seg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            }
          </div>
        </div>

        {/* Smart Insights */}
        <div className="bg-white rounded-[2rem] shadow-sm flex flex-col h-[280px] border border-slate-100">
          <div className="px-6 py-4 flex items-center gap-2 border-b border-slate-50">
            <div className="p-1.5 rounded-xl" style={{ background: `${CYAN}12` }}>
              <Zap size={12} style={{ color: CYAN }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Actionable Insights</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {(counts.isLoading || orders.isLoading)
              ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse h-12 bg-slate-50 rounded-2xl" />)}</div>
              : <div className="space-y-2.5">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl p-3 transition-all hover:translate-x-1"
                    style={{ border: `1px solid ${CYAN}15`, background: i % 2 === 0 ? `${CYAN}06` : "transparent" }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-sm"
                      style={{ background: CYAN }} />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                        {insight.title}
                      </span>
                      <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && <p className="text-xs italic text-slate-400 text-center py-6">Gathering insights…</p>}
              </div>
            }
          </div>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm flex flex-col h-[280px] border border-slate-100 relative overflow-visible" style={{ perspective: "1200px" }}>
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 relative z-30 bg-white rounded-t-[2rem]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl" style={{ background: `${CYAN}08` }}>
                <Package size={14} style={{ color: CYAN }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Inventory Health</span>
            </div>
            <button
              onClick={() => setIsInventoryFlipped(!isInventoryFlipped)}
              className="group/flip p-2 hover:bg-slate-50 rounded-xl transition-all duration-300 text-slate-300 hover:text-cyan-500 flex items-center gap-2"
              title={isInventoryFlipped ? "Show Chart" : "Show Details"}
            >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/flip:opacity-100 transition-opacity">{isInventoryFlipped ? "Chart" : "Details"}</span>
              <RefreshCw size={14} className={`${isInventoryFlipped ? "rotate-180" : ""} transition-transform duration-500`} />
            </button>
          </div>

          <div className="flex-1 relative">
            <motion.div
              className="w-full h-full relative"
              initial={false}
              animate={{ rotateY: isInventoryFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT SIDE (Gauge Chart) */}
              <div
                className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-white rounded-b-[2rem]"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                {products.isLoading
                  ? <div className="animate-pulse w-full h-full bg-slate-50 rounded-2xl" />
                  : <div className="flex flex-col items-center justify-center scale-110">
                    <Tooltip text="Overall Stock Reliability: Percentage of your products that have safe inventory levels (>10 units).">
                      <div className="relative w-32 h-20 lg:w-[140px] lg:h-[84px] mx-auto">
                        <GaugeMeter
                          segments={[
                            { value: outOfStockCount, color: BRAND_COLORS.RED },
                            { value: lowStockCount, color: BRAND_COLORS.GOLD },
                            { value: healthyCount, color: BRAND_COLORS.CYAN },
                          ]}
                          strokeWidth={14}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                          <span className="text-3xl font-black leading-none" style={{ color: healthColor }}>
                            {Math.round(healthPct)}%
                          </span>
                        </div>
                      </div>
                    </Tooltip>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">Health Score</div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">Safety Threshold: 10+ Units</p>
                  </div>
                }
              </div>

              {/* BACK SIDE (Granular Breakdown) */}
              <div
                className="absolute inset-0 p-6 flex flex-col justify-center bg-white rounded-b-[2rem]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Total SKU", val: totalProductCount, color: "#475569", bg: "#F8FAFC", tip: "Total unique products in catalog." },
                    { label: "Safe", val: healthyCount, color: CYAN, bg: `${CYAN}08`, tip: "Healthy stock levels (>10 units)." },
                    { label: "Low", val: lowStockCount, color: BRAND_COLORS.GOLD, bg: `${BRAND_COLORS.GOLD}08`, tip: "Items below safety threshold (1-10 units)." },
                    { label: "Out", val: outOfStockCount, color: BRAND_COLORS.RED, bg: `${BRAND_COLORS.RED}08`, tip: "Items with zero inventory." }
                  ].map(stat => (
                    <Tooltip key={stat.label} text={stat.tip}>
                      <div className="p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-50 transition-transform hover:scale-[1.02]"
                        style={{ background: stat.bg }}>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-xl font-black" style={{ color: stat.color }}>{stat.val}</p>
                      </div>
                    </Tooltip>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between px-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN }} />
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Safe: &gt;10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND_COLORS.GOLD }} />
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Low: 1-10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND_COLORS.RED }} />
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Out: 0</span>
                    </div>
                  </div>
                  <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest italic">Stock Rules</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Low Stock */}
        <div className="bg-white rounded-[2rem] shadow-sm flex flex-col h-[280px] border border-slate-100">
          <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50">
            <div className="flex items-center gap-2">
              <AlertCircle size={12} style={{ color: CYAN }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Alerts</span>
            </div>
            <Link to="/admin/products" className="text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors" style={{ color: CYAN }}>
              Manage
            </Link>
          </div>
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {products.isLoading
              ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse h-8 bg-slate-50 rounded-xl" />)}</div>
              : lowStock.length === 0
                ? <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner">
                    <Fish size={20} style={{ color: CYAN }} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Stock!</p>
                </div>
                : <>
                  <div className="flex-1 space-y-1.5 overflow-y-auto pr-2 mb-2">
                    {lowStock.map(p => (
                      <div key={p.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 rounded bg-white shadow-sm shrink-0">
                            <Fish size={10} className="text-slate-400" />
                          </div>
                          <span className="text-xs font-bold truncate text-slate-700">{p.name}</span>
                        </div>
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg shrink-0 ml-2 shadow-sm"
                          style={{ background: p.stock === 0 ? CYAN : "#FFFFFF", color: p.stock === 0 ? "#FFFFFF" : CYAN }}>
                          {p.stock === 0 ? "OUT" : p.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${outOfStockCount > 0 ? 'animate-pulse' : ''}`} style={{ background: outOfStockCount > 0 ? BRAND_COLORS.RED : BRAND_COLORS.GOLD }} />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {outOfStockCount > 0 ? "Action Required" : "Low Stock Alert"}
                      </span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md" style={{ color: outOfStockCount > 0 ? BRAND_COLORS.RED : BRAND_COLORS.GOLD, background: outOfStockCount > 0 ? `${BRAND_COLORS.RED}15` : `${BRAND_COLORS.GOLD}15` }}>
                      {outOfStockCount} OUT OF STOCK
                    </span>
                  </div>
                </>
            }
          </div>
        </div>


      </div>

      {/* Action Required */}
      {paidUnassigned.length > 0 && (
        <div className="mb-6 rounded-[2rem] p-6 shadow-sm border border-slate-100 bg-white flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-[1.25rem]" style={{ background: `${CYAN}08` }}>
                <Zap size={16} style={{ color: CYAN }} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">
                  Action Required
                </h2>
                <p className="text-sm font-black text-slate-700">
                  {paidUnassigned.length} Priority Order{paidUnassigned.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Link to="/admin/orders" className="text-[10px] font-black flex items-center gap-1.5 px-5 py-2.5 rounded-full hover:shadow-md transition-all bg-slate-50 text-slate-500 hover:text-slate-700">
              Operational Queue <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paidUnassigned.slice(0, 3).map(o => (
              <div key={o.id} className="group flex flex-col gap-4 bg-slate-50/50 hover:bg-white rounded-[1.5rem] p-5 border border-transparent hover:border-slate-100 hover:shadow-sm transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-cyan-500 transition-colors">#{o.id}</span>
                    <span className="text-xs font-black text-slate-700 mt-1">{o.shipping_address_details?.full_name ?? "—"}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-50">
                    AED {parseFloat(o.total_amount).toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{o.shipping_address_details?.emirate}</span>
                  </div>
                  <Link to="/admin/orders"
                    className="text-[9px] font-black px-4 py-2 rounded-xl text-white shadow-sm hover:shadow-cyan-200 transition-all active:scale-95 whitespace-nowrap"
                    style={{ background: CYAN }}>
                    ASSIGN RIDER
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders + Delivery Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5" style={{ gridAutoRows: "1fr" }}>

        <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-sm flex flex-col border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
              <ShoppingCart size={13} style={{ color: CYAN }} /> Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
              Activity History <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                  {["Order", "Customer", "Items", "Total", "Status"].map((h, idx) => (
                    <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase text-slate-400 ${idx === 3 || idx === 4 ? "text-right" : ""} ${idx === 1 ? "hidden sm:table-cell" : ""} ${idx === 2 ? "hidden md:table-cell" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  : (orders.data ?? []).slice(0, 8).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold" style={{ color: CYAN }}>#{o.id}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="font-bold text-[11px] text-slate-800">{o.shipping_address_details?.full_name ?? "—"}</p>
                        <p className="text-[9px] text-slate-400 capitalize">{o.shipping_address_details?.emirate}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[11px] text-slate-500 truncate max-w-[140px] block">
                          {o.items.map(i => i.product_name).join(", ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-[11px] whitespace-nowrap" style={{ color: CYAN_DARK }}>
                        AED {parseFloat(o.total_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm flex flex-col border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
              <Truck size={13} style={{ color: CYAN }} /> Delivery Fleet
            </h2>
            <Link to="/admin/delivery/boys" className="text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
              Live Fleet <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {delivery.isLoading
              ? <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="animate-pulse h-8 bg-slate-100 rounded" />)}</div>
              : (delivery.data ?? []).length === 0
                ? <p className="text-xs text-slate-400 italic text-center py-6">No delivery boys found</p>
                : <>
                  <div className="mb-4">
                    <div className="flex justify-between text-[9px] font-bold mb-1.5 text-slate-400">
                      <span>Fleet utilization</span>
                      <span>{totalDBoys > 0 ? `${Math.round((busyDBoys.length / totalDBoys) * 100)}% busy` : "—"}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                      <Tooltip text={`${Math.round((busyDBoys.length / totalDBoys) * 100)}% of your active delivery fleet is currently engaged in an order.`}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: totalDBoys > 0 ? `${(busyDBoys.length / totalDBoys) * 100}%` : "0%", background: CYAN }} />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: `${CYAN}08`, border: `1px solid ${CYAN}20` }}>
                      <p className="text-3xl font-black leading-none" style={{ color: CYAN_DARK }}>{availableDBoys.length}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wide mt-1.5" style={{ color: CYAN }}>Available</p>
                    </div>
                    <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: `${CYAN}15`, border: `1px solid ${CYAN}30` }}>
                      <p className="text-3xl font-black leading-none" style={{ color: CYAN_MEDIUM }}>{busyDBoys.length}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wide mt-1.5 text-slate-400">Busy</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-0">
                    {(delivery.data ?? []).filter(d => d.is_active).map(d => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: d.delivery_profile?.is_available ? CYAN : CYAN_LIGHT }} />
                          <span className="text-[11px] font-semibold truncate text-slate-700">{d.first_name} {d.last_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {d.delivery_profile?.assigned_emirates?.slice(0, 1).map(em => (
                            <span key={em} className="text-[8px] text-slate-400 capitalize">{em}</span>
                          ))}
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={d.delivery_profile?.is_available
                              ? { background: `${CYAN}18`, color: CYAN_DARK }
                              : { background: `${CYAN}08`, color: "#64748B" }
                            }>
                            {d.delivery_profile?.is_available ? "Free" : "Busy"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>
        </div>
      </div>

      {/* Analytics Grid — 3 equal-height cols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ gridAutoRows: "1fr" }}>

        {/* Top Products */}
        <div className="bg-white rounded-[2rem] shadow-sm flex flex-col border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <BarChart3 size={12} /> Top Products
            </h2>
            <Link to="/admin/products" className="text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1">
              All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            {orders.isLoading
              ? <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="animate-pulse h-8 bg-slate-100 rounded" />)}</div>
              : topProducts.length === 0
                ? <p className="text-xs text-slate-400 italic text-center py-6">No sales data yet</p>
                : <div className="space-y-3.5">
                  {topProducts.map((p, i) => {
                    const maxSales = Math.max(...topProducts.map(x => x.sales), 1);
                    return (
                      <div key={p.name}>
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                          <span className="truncate max-w-[160px] text-slate-700">
                            <span className="mr-1.5 font-black" style={{ color: CYAN }}>{i + 1}.</span>
                            {p.name}
                          </span>
                          <span className="shrink-0 ml-2 tabular-nums" style={{ color: CYAN_DARK }}>{p.sales} sold</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(p.sales / maxSales) * 100}%`, background: CYAN }} />
                        </div>
                      </div>
                    );
                  })
                  }
                </div>
            }
          </div>
        </div>

        {/* Orders by Location + Payment */}
        <div className="bg-white rounded-[2rem] shadow-sm flex flex-col border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2 border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
            <MapPin size={12} style={{ color: CYAN }} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders by Location</h2>
          </div>
          <div className="flex-1 flex flex-col p-5">
            {orders.isLoading
              ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse h-7 bg-slate-100 rounded" />)}</div>
              : emirateBreakdown.length === 0
                ? <p className="text-xs text-slate-400 italic text-center py-6">No location data</p>
                : <div className="flex-1 space-y-3.5">
                  {emirateBreakdown.map((em, i) => (
                    <div key={em.name}>
                      <div className="flex justify-between text-[10px] font-bold mb-1.5">
                        <span className="capitalize text-slate-700">{em.name}</span>
                        <span className="tabular-nums" style={{ color: i === 0 ? CYAN_DARK : "#A1A1AA" }}>{em.count}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(em.count / maxEmirateCount) * 100}%`, background: i === 0 ? CYAN : `${CYAN}70` }} />
                      </div>
                    </div>
                  ))}
                </div>
            }
            {paymentSplit.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-400">
                  <CreditCard size={9} /> Payment Methods
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {paymentSplit.map(p => (
                    <span key={p.method} className="text-[9px] font-bold px-2.5 py-1 rounded-full capitalize"
                      style={{ background: `${CYAN}15`, color: CYAN_DARK, border: `1px solid ${CYAN}30` }}>
                      {p.method} · {p.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support + Reviews */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[2rem] shadow-sm flex flex-col border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Headphones size={12} /> Open Support
              </h2>
              <Link to="/admin/support" className="text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1">
                All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              {support.isLoading
                ? <div className="animate-pulse h-12 bg-slate-100 rounded" />
                : (support.data ?? []).length === 0
                  ? <p className="text-xs text-slate-400 italic py-1">No open tickets</p>
                  : (support.data ?? []).slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate text-slate-700">{t.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{t.subject}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 ml-2">
                        {new Date(t.created_at).toLocaleDateString("en-AE", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm flex flex-col flex-1 border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MessageSquare size={12} /> Reviews
              </h2>
              <Link to="/admin/reviews" className="text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1">
                All <ChevronRight size={12} />
              </Link>
            </div>
            {avgRating !== null && (
              <div className="px-5 py-3 flex items-center justify-between flex-shrink-0"
                style={{ background: `${CYAN}08`, borderBottom: `1px solid ${CYAN}10` }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={11}
                        style={n <= Math.round(avgRating) ? { fill: CYAN, color: CYAN } : { color: "#E2E8F0" }} />
                    ))}
                  </div>
                  <span className="text-sm font-black" style={{ color: CYAN_DARK }}>{avgRating.toFixed(1)}</span>
                </div>
                <div className="flex items-end gap-0.5 h-6">
                  {ratingDist.map(r => (
                    <Tooltip key={r.n} text={`${r.count} review${r.count !== 1 ? "s" : ""} given ${r.n} Stars`}>
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 rounded-sm transition-all duration-700 hover:brightness-90 cursor-pointer"
                          style={{ height: `${(r.count / maxRatingCount) * 100}%`, minHeight: r.count > 0 ? "3px" : "0px", background: CYAN }} />
                        <span className="text-[7px] font-black text-slate-300 mt-1">{r.n}★</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 flex-1 overflow-y-auto">
              {reviews.isLoading
                ? <div className="space-y-2">{[1, 2].map(i => <div key={i} className="animate-pulse h-10 bg-slate-100 rounded" />)}</div>
                : (reviews.data ?? []).length === 0
                  ? <p className="text-xs text-slate-400 italic text-center py-3">No reviews yet</p>
                  : (reviews.data ?? []).slice(0, 10).map(r => (
                    <div key={r.id} className="py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={9}
                              style={n <= r.rating ? { fill: CYAN, color: CYAN } : { color: "#E2E8F0" }} />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-400">{r.user_name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{r.comment}</p>
                      <p className="text-[9px] text-slate-400">{r.product_name}</p>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted components and utilities moved to their respective files

export default Dashboard;
