import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SearchRides from "./pages/SearchRides";
import NotFound from "./pages/NotFound";
import DebugUsers from "./pages/DebugUsers";
import MyBookings from "./pages/MyBookings";
import ManageRides from "./pages/ManageRides";
import Earnings from "./pages/Earnings";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchRides />} />
          <Route path="/search-rides" element={<SearchRides />} />
          <Route path="/debug/users" element={<DebugUsers />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/manage-rides" element={<ManageRides />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/chat/:bookingId" element={<Chat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
