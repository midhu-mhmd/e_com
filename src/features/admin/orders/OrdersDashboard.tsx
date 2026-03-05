import React, { useState, useEffect } from "react";
import { TrendingUp, Users, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";
import { ordersApi, type DashboardAnalyticsDto } from "./ordersApi";

const OrdersDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getDashboardAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError("Failed to load dashboard analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        {error || "Failed to load analytics"}
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Users",
      value: analytics.total_users,
      icon: Users,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600",
    },
    {
      label: "Active Users",
      value: analytics.active_users,
      icon: TrendingUp,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-600",
    },
    {
      label: "Total Orders",
      value: analytics.total_orders,
      icon: ShoppingCart,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-600",
    },
    {
      label: "Completed Orders",
      value: analytics.completed_orders,
      icon: ShoppingCart,
      color: "bg-cyan-50 border-cyan-200",
      textColor: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`border ${metric.color} rounded-lg p-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p className={`text-2xl font-bold ${metric.textColor} mt-1`}>
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${metric.textColor} opacity-20`}>
                  <Icon size={32} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-yellow-600" size={20} />
            <h3 className="font-semibold text-gray-900">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {parseFloat(analytics.total_revenue).toFixed(2)}
          </p>
        </div>

        <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-gray-900">Avg Order Value</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            {parseFloat(analytics.average_order_value).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="border border-gray-200 bg-white rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Cart Conversion Rate</h3>
        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-linear-to-r from-cyan-500 to-cyan-600 h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(analytics.cart_conversion_rate, 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {analytics.cart_conversion_rate.toFixed(2)}% conversion rate
        </p>
      </div>

      {/* Top Products */}
      {analytics.top_products.length > 0 && (
        <div className="border border-gray-200 bg-white rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                    Sales
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-3">{product.name}</td>
                    <td className="py-2 px-3">{product.sales}</td>
                    <td className="py-2 px-3 font-semibold text-cyan-600">
                      {parseFloat(product.revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAnalytics}
        className="w-full md:w-auto px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition"
      >
        Refresh Analytics
      </button>
    </div>
  );
};

export default OrdersDashboard;
