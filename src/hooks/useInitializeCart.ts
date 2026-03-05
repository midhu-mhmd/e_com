import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from ".";
import { fetchCartRequest } from "../features/admin/cart/cartSlice";

/**
 * Hook to initialize cart data on app load / when user authenticates
 * Call this in the root App component or layout to ensure cart data
 * is always available, even before visiting the cart page
 */
export const useInitializeCart = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const checkingAuth = useAppSelector((s) => s.auth.checkingAuth);

  useEffect(() => {
    // Fetch cart when auth check is complete and user is authenticated
    if (!checkingAuth && isAuthenticated) {
      dispatch(fetchCartRequest());
    }
  }, [checkingAuth, isAuthenticated, dispatch]);
};
