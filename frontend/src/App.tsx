import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
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
import FormWizard from "./components/common/FormWizard";
import ViewOrder from "./pages/Order/ViewOrder";
import ShopperDashboard from "./pages/Dashboard/ShopperDashboard";
import ShopperRequests from "./pages/Requests/ShopperRequests";
import ViewAllRequests from "./pages/Order/ViewAllRequests";
import ShipperDashboard from "./pages/Dashboard/ShipperDashboard";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify" element={<VerifyOtp />} />

          {/* Dashboard Layout */}
          <Route 
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index path="/" element={<Home />} />
            <Route index path="/shopper/dashboard" element={<ShopperDashboard />} />
            <Route index path="/shipper/dashboard" element={<ShipperDashboard />} />
            <Route index path="/roles" element={<Roles />} />
            <Route index path="/permissions" element={<Permissions />} />
            <Route path="/view/requests" element={<ViewAllRequests />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/products" element={<Products />} />
            <Route path="/request" element={<Order />} />
            <Route path="/view/request" element={<ViewOrder />} />
            <Route path="/shopper/requests" element={<ShopperRequests />} />

            {/* Others Page
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            <Route path="/form-elements" element={<FormElements />} />

            <Route path="/basic-tables" element={<BasicTables />} />

            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} /> */}
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" reverseOrder={false}  />
    </>
  );
}
