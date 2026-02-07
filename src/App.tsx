import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import TripsList from "./pages/TripsList";
import AddTrip from "./pages/AddTrip";
import AddVoyage from "./pages/AddVoyage";
import CalendarView from "./pages/CalendarView";
import MapView from "./pages/MapView";
import TripDetail from "./pages/TripDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/trips" element={<ProtectedRoute><TripsList /></ProtectedRoute>} />
              <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute><AddVoyage /></ProtectedRoute>} />
              <Route path="/add-single" element={<ProtectedRoute><AddTrip /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
