import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import Deals from "./pages/Deals";
import CategoryProducts from "./pages/CategoryProducts";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

// Layout wrapper for public routes
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <div className="flex-1">{children}</div>
    <Footer />
    <CartDrawer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
          <NotificationProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
          <Routes>
            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requireRole="admin"><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requireRole="admin"><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute requireRole="admin"><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireRole="admin"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireRole="admin"><AdminUsers /></ProtectedRoute>} />
            
            {/* Public Routes - With Header/Footer */}
            <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/deals" element={<PublicLayout><Deals /></PublicLayout>} />
            <Route path="/category" element={<PublicLayout><CategoryProducts /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            {/* Auth Routes */}
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
            <Route path="/verify-email/:token" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
            <Route path="/auth/callback" element={<PublicLayout><AuthCallback /></PublicLayout>} />
            {/* Protected Routes */}
            <Route path="/checkout" element={<PublicLayout><ProtectedRoute><Checkout /></ProtectedRoute></PublicLayout>} />
            <Route path="/orders" element={<PublicLayout><ProtectedRoute><Orders /></ProtectedRoute></PublicLayout>} />
            <Route path="/orders/:orderId/confirmation" element={<PublicLayout><ProtectedRoute><OrderConfirmation /></ProtectedRoute></PublicLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
      </CartProvider>
          </NotificationProvider>
      </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
