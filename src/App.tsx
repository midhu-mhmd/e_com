import { useEffect, useState, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./features/auth/authSlice";
import { AppRoutes } from "./routes/AppRoutes";
import ShrimpLoader from "./components/loader/preloader";
import { useToast } from "./components/ui/Toast";

function App() {
  const dispatch = useDispatch();
  const { checkingAuth, isAuthenticated, user } = useSelector((state: any) => state.auth);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const toast = useToast();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    dispatch(checkAuth() as any);
    const timer = setTimeout(() => setMinDelayDone(true), 2000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Show toast on login/register success (only on transition)
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current && !checkingAuth) {
      const name = user?.first_name || user?.name || "";
      toast.show(name ? `Welcome back, ${name}!` : "Welcome! You're signed in.", "success");
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, checkingAuth]);

  if (checkingAuth || !minDelayDone) {
    return <ShrimpLoader label="Checking account..." />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
