import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SplashScreen } from "./components/pwa/SplashScreen";
import { ThemeProvider } from "./hooks/useTheme";
import { SplashScreen } from "./components/pwa/SplashScreen";
import Dashboard from "./pages/Dashboard";
import TripsList from "./pages/TripsList";
import VoyagesList from "./pages/VoyagesList";
import VoyageDetail from "./pages/VoyageDetail";
import AddTrip from "./pages/AddTrip";
import AddVoyage from "./pages/AddVoyage";
import CalendarView from "./pages/CalendarView";
import MapView from "./pages/MapView";
import TripDetail from "./pages/TripDetail";
import EditTrip from "./pages/EditTrip";
import Auth from "./pages/Auth";
import OAuthCallback from "./pages/OAuthCallback";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on PWA standalone mode or first visit
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    const hasSeenSplash = sessionStorage.getItem('splash-shown');
    return isStandalone && !hasSeenSplash;
  });

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem('splash-shown', 'true');
    }
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
          <TooltipProvider>
            <div>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/trips" element={<ProtectedRoute><TripsList /></ProtectedRoute>} />
                  <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
                  <Route path="/trips/:id/edit" element={<ProtectedRoute><EditTrip /></ProtectedRoute>} />
                  <Route path="/voyages" element={<ProtectedRoute><VoyagesList /></ProtectedRoute>} />
                  <Route path="/voyages/:id" element={<ProtectedRoute><VoyageDetail /></ProtectedRoute>} />
                  <Route path="/add" element={<ProtectedRoute><AddVoyage /></ProtectedRoute>} />
                  <Route path="/add-single" element={<ProtectedRoute><AddTrip /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
                  <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
