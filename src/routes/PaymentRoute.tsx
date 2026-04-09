import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { Loader2 } from 'lucide-react';

/**
 * Guard for payment result pages.
 * Requires: authenticated user + valid order context (order_id param or pending_order_id in storage).
 * Prevents direct URL access without a legitimate payment flow.
 */
export const PaymentRoute = () => {
  const { isAuthenticated, checkingAuth } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={36} className="animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasOrderId =
    searchParams.get('order_id') ||
    sessionStorage.getItem('pending_order_id') ||
    localStorage.getItem('pending_order_id');

  if (!hasOrderId) {
    return <Navigate to="/orders" replace />;
  }

  return <Outlet />;
};
