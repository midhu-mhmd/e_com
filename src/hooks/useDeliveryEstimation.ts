import { useEffect, useState } from "react";
import { ordersApi, type DeliveryEstimationDto } from "../features/admin/orders/ordersApi";

export interface DeliveryStockDetail {
  product_id: number;
  product_name: string;
  requested_quantity: number;
  available_stock: number;
}

interface UseDeliveryEstimationReturn {
  estimation: DeliveryEstimationDto | null;
  loading: boolean;
  error: string | null;
  stockDetails: DeliveryStockDetail[] | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch delivery estimation for current cart
 * Useful for checkout flow to show estimated delivery dates
 */
export const useDeliveryEstimation = (): UseDeliveryEstimationReturn => {
  const [estimation, setEstimation] = useState<DeliveryEstimationDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockDetails, setStockDetails] = useState<DeliveryStockDetail[] | null>(null);

  const fetchEstimation = async () => {
    setLoading(true);
    setError(null);
    setStockDetails(null);

    try {
      const data = await ordersApi.estimateDelivery();
      setEstimation(data);
    } catch (err: any) {
      const responseData = err?.response?.data;
      const formattedError =
        (typeof responseData === "string" && responseData.trim()) ||
        (typeof responseData?.error === "string" && responseData.error.trim()) ||
        (typeof responseData?.message === "string" && responseData.message.trim()) ||
        (typeof responseData?.detail === "string" && responseData.detail.trim()) ||
        "Failed to estimate delivery";

      setError(formattedError);
      setEstimation(null);

      if (Array.isArray(responseData?.stock_details)) {
        setStockDetails(
          responseData.stock_details.map((item: any) => ({
            product_id: Number(item.product_id ?? item.productId ?? 0),
            product_name: String(item.product_name ?? item.productName ?? "Unknown product"),
            requested_quantity: Number(item.requested_quantity ?? item.requestedQuantity ?? 0),
            available_stock: Number(item.available_stock ?? item.availableStock ?? 0),
          }))
        );
      }

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimation();
  }, []);

  return {
    estimation,
    loading,
    error,
    stockDetails,
    refetch: fetchEstimation,
  };
};
