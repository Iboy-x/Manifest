import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ManifestLog from "./pages/ManifestLog";
import DailyReflection from "./pages/DailyReflection";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Intro from "./pages/Intro";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && location.pathname === '/intro') {
      navigate('/', { replace: true });
    }
  }, [user, location, navigate]);

  if (loading) return null; // Or a global spinner

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/intro" element={<Intro />} />
          <Route path="*" element={<Navigate to="/intro" replace />} />
        </>
      ) : (
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/manifest" element={<ManifestLog />} />
          <Route path="/reflection" element={<DailyReflection />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
