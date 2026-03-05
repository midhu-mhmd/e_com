import { useEffect, useState } from "react";
import { ordersApi, type DeliveryEstimationDto } from "../features/admin/orders/ordersApi";

interface UseDeliveryEstimationReturn {
  estimation: DeliveryEstimationDto | null;
  loading: boolean;
  error: string | null;
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

  const fetchEstimation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.estimateDelivery();
      setEstimation(data);
    } catch (err) {
      setError("Failed to estimate delivery");
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
    refetch: fetchEstimation,
  };
};
