import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./features/auth/authSlice";
import { AppRoutes } from "./routes/AppRoutes";
import { useToast } from "./components/ui/Toast";
import { useInitializeCart } from "./hooks/useInitializeCart";
import { navigateTo } from "./utils/navigate";

function App() {
  const dispatch = useDispatch();
  const { checkingAuth, isAuthenticated, user } = useSelector((state: any) => state.auth);
  const toast = useToast();
  const wasAuthenticated = useRef(false);

  // Initialize cart data on app load for authenticated users
  useInitializeCart();

  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);

  // Global online/offline handling
  useEffect(() => {
    const handleOffline = () => {
      if (window.location.pathname !== "/network-error") {
        try { navigateTo("/network-error", { replace: true }); } catch {}
      }
    };
    const handleOnline = () => {
      if (window.location.pathname === "/network-error") {
        try { window.history.back(); } catch {}
      }
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Show toast on login/register success (only on transition)
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current && !checkingAuth) {
      const name = user?.first_name || user?.name || "";
      toast.show(name ? `Welcome back, ${name}!` : "Welcome! You're signed in.", "success");
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, checkingAuth]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
