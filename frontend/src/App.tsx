import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PrivateRoute from "./context/PrivateRoute";
import { Toaster } from "react-hot-toast";
import VerifyOtp from "./pages/AuthPages/VerifyOtp";
import Roles from "./pages/Roles/Roles";
import Permissions from "./pages/Permissions/Permissions";
import Products from "./pages/Products/Products";
import Order from "./pages/Order/Order";
import ViewOrder from "./pages/Order/ViewOrder";
import ShopperDashboard from "./pages/Dashboard/ShopperDashboard";
import ShopperRequests from "./pages/Requests/ShopperRequests";
import ViewAllRequests from "./pages/Order/ViewAllRequests";
import ShipperDashboard from "./pages/Dashboard/ShipperDashboard";
import ShopperPayments from "./pages/Payments/ShopperPayments";
import AllPayments from "./pages/Payments/AllPayments";
import ShipperPayments from "./pages/Payments/ShipperPayments";
import Services from "./pages/Services/Services";
import ShipperLevels from "./pages/ShipperLevel/ShipperLevels";
import Subscription from "./pages/Subscription/Subscription";
import PaymentsSettings from "./pages/Settings/Payments/PaymentsSettings";
import CustomDeclaration from "./pages/Order/CustomDeclaration";
import ShipperWallet from "./pages/Payments/Wallet/ShipperWallet";
import AdminWallet from "./pages/Payments/Wallet/AdminWallet";
import StripeConnect from "./pages/Payments/Stripe/StripeConnect";
import ShopperCustomDeclaration from "./pages/Requests/ShopperCustomDeclaration";
import ShipperMessages from "./pages/Shipper/ShipperMessages";
import RoleRedirect from "./context/RoleRedirect";
import ManageMultipleLocations from "./pages/Shipper/ManageLocations/ManageMultipleLocations";
import ShopperMessages from "./pages/Shopper/ShopperMessages";
import Blogs from "./pages/Admin/Blogs";
import CreateBlogs from "./pages/Admin/CreateBlogs";
import EditBlogs from "./pages/Admin/EditBlogs";
import ManageRequest from "./pages/Requests/ManageRequest";
import TrackOrder from "./pages/Order/TrackOrder";
import ShopperTrackOrder from "./pages/Shopper/ShopperTrackOrder";
import ShopperGuideLine from "./pages/Shopper/ShopperGuideLine";
import ShipperGuideLine from "./pages/Shipper/ShipperGuideLine";
import ShopperAllCustomDeclaration from "./pages/Requests/ShopperAllCustomDeclaration";
import ShipperSignUp from "./pages/AuthPages/ShipperSignUp";
import Shippers from "./pages/Admin/Users/Shippers";
import Shoppers from "./pages/Admin/Users/Shoppers";
import SendOffer from "./pages/Shipper/SendOffer";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/shipper/signup" element={<ShipperSignUp />} />
          <Route path="/verify" element={<VerifyOtp />} />

          {/* Dashboard Layout */}

          <Route
            path="/"
            element={
              <RoleRedirect />
            }
          />

          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <Home />
              }
            />
            <Route index path="/roles" element={<Roles />} />
            <Route index path="/permissions" element={<Permissions />} />
            <Route index path="/shoppers" element={<Shoppers />} />
            <Route index path="/shippers" element={<Shippers />} />
            <Route path="/view/requests" element={<ViewAllRequests />} />
            <Route path="/admin/track-order" element={<TrackOrder />} />
            <Route path="/payments" element={<AllPayments />} />
            <Route path="/admin/wallet" element={<AdminWallet />} />
            <Route path="/services" element={<Services />} />
            <Route path="/shipper/levels" element={<ShipperLevels />} />
            <Route path="/payment/setting" element={<PaymentsSettings />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/create" element={<CreateBlogs />} />
            <Route path="/blogs/edit" element={<EditBlogs />} />

            {/* Shopper Routes */}
            <Route index path="/shopper/dashboard" element={<ShopperDashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/shopper/request" element={<Order />} />
            <Route path="/shopper/messages" element={<ShopperMessages />} />
            <Route path="/shopper/view/request" element={<ViewOrder />} />
            <Route path="/shopper/track/order" element={<ShopperTrackOrder />} />
            <Route path="/shopper/payment" element={<ShopperPayments />} />
            <Route path="/shopper/guideline" element={<ShopperGuideLine />} />
            <Route path="/custom/declaration" element={<CustomDeclaration />} />

            {/* Shipper Routes */}
            <Route index path="/shipper/dashboard" element={<ShipperDashboard />} />
            <Route index path="/shipper/send-offer" element={<SendOffer />} />
            <Route path="/shipper/requests" element={<ShopperRequests />} />
            <Route path="shipper/manage-request" element={<ManageRequest />} />
            <Route path="/shipper/messages" element={<ShipperMessages />} />
            <Route path="/shipper/guideline" element={<ShipperGuideLine />} />
            <Route path="/shipper/all/custom-declarations" element={<ShopperAllCustomDeclaration />} />
            <Route path="/custom-declaration" element={<ShopperCustomDeclaration />} />
            <Route path="/shipper/subscription" element={<Subscription />} />
            <Route path="/shipper/service-areas" element={<ManageMultipleLocations />} />
            <Route path="/shipper/payment" element={<ShipperPayments />} />
            <Route path="shipper/wallet" element={<ShipperWallet />} />
            <Route path="/shipper/stripe-connect" element={<StripeConnect />} />

            {/* Common Routes */}
            <Route path="/profile" element={<UserProfiles />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        gutter={8} 
        containerStyle={{
          zIndex: 999999,   
          top: 80,         
        }}
        toastOptions={{
          duration: 3000,
         
        }}
      />

    </>
  );
}
