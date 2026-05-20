import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { AddressProvider } from "@/context/AddressContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index.tsx";
import Restaurants from "./pages/Restaurants.tsx";
import RestaurantDetail from "./pages/RestaurantDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Track from "./pages/Track.tsx";
import About from "./pages/About.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Partner from "./pages/Partner.tsx";
import Rider from "./pages/Rider.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Profile from "./pages/Profile.tsx";
import Addresses from "./pages/Addresses.tsx";
import Orders from "./pages/Orders.tsx";
import PersonalInfo from "./pages/PersonalInfo.tsx";
import PaymentMethods from "./pages/PaymentMethods.tsx";
import Favourites from "./pages/Favourites.tsx";
import Contact from "./pages/Contact.tsx";
import FAQ from "./pages/FAQ.tsx";
import Help from "./pages/Help.tsx";
import Legal from "./pages/Legal.tsx";
import NotFound from "./pages/NotFound.tsx";

import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminRestaurants from "./pages/admin/Restaurants.tsx";
import AdminDelivery from "./pages/admin/Delivery.tsx";
import AdminOrders from "./pages/admin/Orders.tsx";
import AdminReports from "./pages/admin/Reports.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";

import RestaurantDashboard from "./pages/restaurant/Dashboard.tsx";
import RestaurantOrders from "./pages/restaurant/Orders.tsx";
import RestaurantMenu from "./pages/restaurant/Menu.tsx";
import RestaurantReviews from "./pages/restaurant/Reviews.tsx";
import RestaurantSales from "./pages/restaurant/Sales.tsx";

import DeliveryDashboard from "./pages/delivery/Dashboard.tsx";
import DeliveryActive from "./pages/delivery/Active.tsx";
import DeliveryHistory from "./pages/delivery/History.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrdersProvider>
          <AddressProvider>
          <CartProvider>
            <Toaster />
            <Sonner position="top-center" richColors />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Index />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurants/:slug" element={<RestaurantDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track/:id?" element={<Track />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/rider" element={<Rider />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<Help />} />
                <Route path="/legal" element={<Legal />} />

                {/* Customer */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
                <Route path="/profile/payment" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
                <Route path="/profile/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
                <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin"           element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users"     element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/restaurants" element={<ProtectedRoute roles={["admin"]}><AdminRestaurants /></ProtectedRoute>} />
                <Route path="/admin/delivery"  element={<ProtectedRoute roles={["admin"]}><AdminDelivery /></ProtectedRoute>} />
                {/* Admin orders tab removed */}
                <Route path="/admin/reports"   element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/settings"  element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>} />

                {/* Restaurant */}
                <Route path="/restaurant"          element={<ProtectedRoute roles={["restaurant"]}><RestaurantDashboard /></ProtectedRoute>} />
                <Route path="/restaurant/orders"   element={<ProtectedRoute roles={["restaurant"]}><RestaurantOrders /></ProtectedRoute>} />
                <Route path="/restaurant/menu"     element={<ProtectedRoute roles={["restaurant"]}><RestaurantMenu /></ProtectedRoute>} />
                <Route path="/restaurant/reviews"  element={<ProtectedRoute roles={["restaurant"]}><RestaurantReviews /></ProtectedRoute>} />
                <Route path="/restaurant/sales"    element={<ProtectedRoute roles={["restaurant"]}><RestaurantSales /></ProtectedRoute>} />

                {/* Delivery */}
                <Route path="/delivery"          element={<ProtectedRoute roles={["delivery"]}><DeliveryDashboard /></ProtectedRoute>} />
                <Route path="/delivery/active"   element={<ProtectedRoute roles={["delivery"]}><DeliveryActive /></ProtectedRoute>} />
                <Route path="/delivery/history"  element={<ProtectedRoute roles={["delivery"]}><DeliveryHistory /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
          </AddressProvider>
        </OrdersProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
