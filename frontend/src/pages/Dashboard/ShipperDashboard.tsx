import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchRequests } from "../../slices/shopperRequestSlice";
import { fetchNewOffers } from "../../slices/shipperNewOffersSlice";
import { fetchLatestMessages } from "../../slices/latestChatsSlice";
import { fetchOrderStatus } from "../../slices/orderStatusSlice";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Modal } from "../../components/ui/modal";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import Input from "../../components/form/input/InputField";

interface Notification {
  id: number;
  name: string;
  ship_from_country: string;
  ship_from_state: string;
  ship_from_city: string;
  ship_to_country: string;
  ship_to_state: string;
  ship_to_city: string;
  service_type: string;
  total_aprox_weight: number;
  total_price: number;
  order_details: any;
  order_services: any;
  total_deductions: any;
  remening_earning: any;
  payment_setting: any;
  user: any;
}

export default function ShipperDashboard() {
  const [ordersData, setOrdersData] = useState<{
    accepted_orders: number;
  }>({
    accepted_orders: 0,
  });

  const [customDeclState, setCustomDeclState] = useState({
    data: [],
    meta: null,
    page: 1,
    loading: false,
  });

  const [balance, setBalance] = useState<{
    total_credit: number;
    total_debit: number;
    balance: number;
  }>({
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  });
  const [offerStats, setOfferStats] = useState<{
    accepted: number;
    inprogress: number;
  }>({
    accepted: 0,
    inprogress: 0,
  });
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, } = useSelector((state: any) => state.shopperRequest);
  const { data: newOffers, loading: loadingOffers, meta, perPage } = useSelector((state: any) => state.shipperNewOffers);
  const { data: latestChats, loading: latestChatLoading } = useSelector((state: any) => state.latestChats);
  const { orderStatus } = useSelector((state: any) => state.orderStatus);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Notification | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "inprogress" | "cancelled" | null;
  }>({ open: false, id: null, status: null });
  const [offerPrice, setOfferPrice] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [priceRows, setPriceRows] = useState([
    { id: Date.now(), title: "", price: "" },
  ]);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [trackingLinks, setTrackingLinks] = useState<Record<number, string>>({});
  const [attachingId, setAttachingId] = useState<number | null>(null);

  const formattedAdditionalPrices = priceRows
    .filter(
      (row) =>
        row.title &&
        row.price &&
        Number(row.price) > 0
    )
    .map((row) => ({
      title: row.title,
      price: Number(row.price),
    }));

  const confirmRequest = async (id: number, status: "inprogress" | "cancelled") => {
    try {
      const payload: any = {
        id,
        status,
        offerPrice: Number(offerPrice),
      };
      if (formattedAdditionalPrices.length > 0) {
        payload.additional_prices = formattedAdditionalPrices;
      }
      const response = await ApiHelper("POST", "/shipper/confirm/request", payload);

      if (response.status === 200) {
        dispatch(fetchRequests());
        toast.success(response.data.message, {
          duration: 3000,
          position: "top-right",
          // style: {
          //   background: "#4caf50",
          //   color: "#fff",
          //   fontWeight: "bold",
          // },
          icon: "🎉",
        });
        setConfirmModal({ open: false, id: null, status: null });
      } else {
        toast.error(response.data.message);
        setConfirmModal({ open: false, id: null, status: null });
      }
    } catch (error) {
      setConfirmModal({ open: false, id: null, status: null });
      console.error(error);
    }
  };

  const handleConfirm = () => {
    if (confirmModal.status == "inprogress" && offerPrice == "") {
      setError("Price is required");
      return;
    }
    setError("");
    if (confirmModal.id && confirmModal.status) {
      confirmRequest(confirmModal.id, confirmModal.status);
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedOrder(notification);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchOrdersStats();
    fetchBalanceStats();
    fetchOfferStats();
    getCustomDecleration();
  }, []);

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchLatestMessages());
    dispatch(fetchOrderStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchNewOffers({ page, perPage: 12, status: filterStatus }));
  }, [dispatch, page, perPage, filterStatus]);


  const fetchOrdersStats = async () => {

    try {
      const res = await ApiHelper("GET", "/shipper/dashboard/orders");

      if (res.status === 200 && res.data.success) {
        setOrdersData(res.data.data);
      } else {
        setOrdersData({
          accepted_orders: 0,
        });
      }
    } catch (err: any) {
    } finally {

    }
  };

  const getCustomDecleration = async (pageNumber = 1) => {
    setCustomDeclState(prev => ({ ...prev, loading: true }));

    try {
      const res = await ApiHelper("GET", `/shipper/dashboard/get-custom-declarations?page=${pageNumber}&per_page=10`);

      if (res.status === 200 && res.data.success) {
        setCustomDeclState({
          data: res.data.data,
          meta: res.data.meta,
          page: pageNumber,
          loading: false,
        });
      } else {
        setCustomDeclState(prev => ({ ...prev, data: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      setCustomDeclState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchOfferStats = async () => {

    try {
      const res = await ApiHelper("GET", "/shipper/dashboard/offers");

      if (res.status === 200 && res.data.success) {
        setOfferStats({
          accepted: res.data.data.accepted ?? 0,
          inprogress: res.data.data.inprogress ?? 0,
        });
      } else {
        setOfferStats({ accepted: 0, inprogress: 0 });
      }
    } catch (err: any) {
      console.error(err);
      setOfferStats({ accepted: 0, inprogress: 0 });
    } finally {

    }
  };

  const fetchBalanceStats = async () => {

    try {
      const res = await ApiHelper("GET", "/shipper/dashboard/balance");

      if (res.status === 200 && res.data.success) {
        setBalance(res.data.data);
      } else {
        setBalance({
          total_credit: 0,
          total_debit: 0,
          balance: 0,
        });
      }
    } catch (err: any) {
    } finally {

    }
  };

  const notification: Notification[] = useMemo(() => {
    if (!requests) return [];

    return requests.map((item: any) => ({
      id: Number(item.id),

      // user
      name: item.user?.name || "Unknown",
      email: item.user?.email || "",

      // location
      ship_from_country: item.ship_from_country,
      ship_from_state: item.ship_from_state,
      ship_from_city: item.ship_from_city,
      ship_to_country: item.ship_to_country,
      ship_to_state: item.ship_to_state,
      ship_to_city: item.ship_to_city,

      // order
      service_type: item.service_type,
      total_aprox_weight: Number(item.total_aprox_weight),
      total_price: Number(item.total_price),

      // ✅ earnings (IMPORTANT)
      total_deductions: Number(item.total_deductions ?? 0),
      remening_earning: Number(item.remening_earning ?? 0),

      // extra
      tracking_number: item.tracking_number,
      request_number: item.request_number,
      status: item.status,

      // nested
      order_details: item.order_details || [],
      order_services: item.order_services || [],
      payment_setting: item.payment_setting || [],
    }));
  }, [requests]);

  const handleAttachTrackingLink = async (orderId: number) => {
    const trackingLink = trackingLinks[orderId]?.trim();

    // Validation
    if (!trackingLink) {
      toast.error("Tracking link is required.");
      return;
    }

    const urlPattern = /^(https?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=%]+$/;
    if (!urlPattern.test(trackingLink)) {
      toast.error("Please enter a valid URL (must start with http:// or https://).");
      return;
    }

    try {
      setAttachingId(orderId);

      const response = await ApiHelper("POST", `/shipper/order/${orderId}/tracking-link`, {
        tracking_link: trackingLink,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Tracking link attached successfully!");
        setTrackingLinks((prev) => ({ ...prev, [orderId]: "" }));
        getCustomDecleration()
      } else {
        toast.error(response.data?.message || "Failed to attach tracking link.");
      }

    } catch (error: any) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAttachingId(null);
    }
  };

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="International Package and mail Forwarding Services"
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 h-40 rounded-b-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2 pt-4">
              Welcome to your dashboard!
              <InfoIcon className="w-5 h-5 text-white" />
            </h1>
          </div>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 pt-5 -mt-25">
            {/* Total Orders */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-blue-600 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : ordersData.accepted_orders}</p>
                  <p className="text-gray-600">Total Orders</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
              </div>
              <div className="flex justify-end mt-4">
                <Link
                  to="/shipper/requests"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>


            {/* Pickup Soon */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-yellow-400">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Your Offers</p>

                  <div className="flex gap-4">
                    <span className="text-green-600 text-sm font-medium">
                      Accepted: {loading ? "--" : offerStats.accepted}
                    </span>

                    <span className="text-blue-600 text-sm font-medium">
                      In Progress: {loading ? "--" : offerStats.inprogress}
                    </span>
                  </div>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>

              <div className="flex justify-end mt-3">
                <a
                  href="/shipper/requests"
                  className="text-blue-600 font-medium text-sm hover:underline"
                >
                  See all
                </a>
              </div>
            </div>


            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-green-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">€{balance.balance}</p>
                  <p className="text-gray-600">Your current balance</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                {/* <a href="#" className="text-blue-600 font-medium text-sm">
                  See all
                </a> */}
              </div>
            </div>
          </div>
        </div>
        {/* <div className="col-span-4">
          {
            notification.length > 0 &&
            <Card notifications={notification} />
          }
        </div> */}
      </div>
      {/* Custom Declaration */}
      <div className="mt-6 bg-white rounded-3xl shadow-md p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Shipment Tracking (Custom Declarations)
          </h2>

          <Link to="/shipper/all/custom-declarations" className="text-sm text-blue-600 font-medium hover:underline">
            See all
          </Link>
        </div>

        {/* List */}
        <div className="space-y-4">

          {customDeclState.data.map((item: any) => (
            <div
              key={item.id}
              className="border rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-sm transition"
            >

              {/* LEFT SIDE */}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-800">
                  Request #{item.order?.request_number}
                </p>

                <p className="text-xs text-gray-500">
                  To: {item.to_street},
                  {item.to_city?.name || "N/A"}, {item.to_state?.name || "N/A"}, {item.to_country?.name || "N/A"}, {item.to_postcode}
                </p>

                <p className="text-xs text-gray-500">
                  Declared Value: ${item.total_declared_value} | Weight: {item.total_weight || "N/A"} kg
                </p>
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {item.status === "approved" ? "Approved" : "Pending"}
                </span>
              </div>

              {/* RIGHT SIDE ACTION */}
              <div className="flex items-center gap-2">
                {item.order?.tracking_link ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 max-w-xs">
                      <a
                        href={item.order.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.order.tracking_link}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition min-w-0 group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="truncate underline underline-offset-2 group-hover:no-underline">
                          {item.order.tracking_link}
                        </span>
                      </a>

                      {/* Copy Button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.order.tracking_link);
                          toast.success("Link copied!");
                        }}
                        title="Copy link"
                        className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
                      ✓ Link Attached
                    </span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter tracking link..."
                      value={trackingLinks[item.order?.id] || ""}
                      onChange={(e) =>
                        setTrackingLinks((prev) => ({
                          ...prev,
                          [item.order?.id]: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAttachTrackingLink(item.order?.id)}
                      disabled={attachingId === item.order?.id}
                      className="px-4 py-2 text-sm text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {attachingId === item.order?.id ? "Attaching..." : "Attach"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
      {/* 🔥 Messages + Requests Grid Container */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* LEFT: Latest Chats */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-3">Latest Chats</h2>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {latestChatLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : latestChats && latestChats.length > 0 ? (
              latestChats.map((chat: any) => {
                const initials = chat.username
                  ? chat.username
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                  : "";

                return (
                  <div
                    key={chat.order_id}
                    onClick={() =>
                      navigate("/shipper/messages", {
                        state: { orderId: chat.order_id },
                      })
                    }
                    className={`flex items-center justify-between p-3 rounded-xl border transition
                      ${chat.unread_count > 0
                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${chat.unread_count > 0
                            ? "bg-blue-500 text-white"
                            : "bg-gray-400 text-white"
                          }`}
                      >
                        {initials}
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">{chat.username}</p>
                        <p className="text-xs text-gray-500">
                          {chat.message_text || "No messages yet"}
                        </p>
                      </div>
                    </div>

                    {chat.unread_count > 0 ? (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        {chat.unread_count}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {chat.last_message_time}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                No recent chats
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: New Requests */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-3">New Requests</h2>

          {/* Scrollable Area */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {loadingOffers && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {notification?.map((order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 shadow-md border transition hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {order.user?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {order.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    NEW
                  </span>
                </div>

                {/* Route */}
                <div className="mt-3 text-sm text-gray-600">
                  <b>From:</b> {order.ship_from_country}, {order.ship_from_state}, {order.ship_from_city}
                  <br />
                  <b>To:</b> {order.ship_to_country}, {order.ship_to_state}, {order.ship_to_city}
                </div>

                {/* Price Breakdown */}
                <div className="mt-4 bg-gray-50 rounded-2xl p-3 space-y-2">

                  {/* Price + Weight + View Details */}
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <p className="text-blue-600 font-semibold">${Number(order.total_price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Weight: {order.total_aprox_weight} kg</p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-sm text-blue-600 font-medium underline hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200" />

                  {/* Each Fee */}
                  {order.payment_setting?.map((fee: any) => (
                    <div key={fee.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">{fee.title}</span>
                        <span className="text-xs text-gray-400">
                          ({fee.type === "percent" ? `${fee.amount}%` : "fixed"})
                        </span>
                      </div>
                      <span className="text-red-500 font-medium">
                        -${Number(fee.deducted_amount).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {/* Divider */}
                  <div className="border-t border-gray-200" />

                  {/* Total Deductions */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Deductions</span>
                    <span className="text-red-600 font-semibold">
                      -${Number(order.total_deductions).toFixed(2)}
                    </span>
                  </div>

                  {/* Shipper Earning */}
                  <div className="flex justify-between items-center text-sm bg-blue-50 rounded-xl px-3 py-2">
                    <span className="text-blue-700 font-medium">Remaning Amount</span>
                    <span className="text-blue-700 font-bold text-base">
                      ${Number(order.remening_earning).toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* Weight */}
                <p className="text-xs text-gray-400 mt-2">
                  Weight: {order.total_aprox_weight} kg
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      setConfirmModal({ open: true, id: order.id, status: "cancelled" })
                    }
                    className="w-1/2 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() =>
                      setConfirmModal({ open: true, id: order.id, status: "inprogress" })
                    }
                    style={{
                      backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                    }}
                    className="w-1/2 py-2.5 rounded-full text-white text-sm font-medium shadow-md"
                  >
                    Send Offer
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>


      </div>
      <div className="mt-3 min-h-screen">
        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-lg border overflow-x-auto p-6">
          {/* Heading */}
          <div className="flex items-center justify-between mb-6">
            {/* Heading */}
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Offers
            </h2>

            {/* Filter */}
            <div className="w-64">
              <label className="sr-only">Filter by Status</label> {/* for accessibility */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
              >
                <option value="">Select status</option>
                {orderStatus?.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name.charAt(0).toUpperCase() + st.name.slice(1)}
                  </option>
                ))}
              </select>

            </div>
          </div>



          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs tracking-wide">
                <th className="px-5 py-4 text-left">Request #</th>
                <th className="px-5 py-4 text-left">Service</th>
                <th className="px-5 py-4 text-left">Route</th>
                <th className="px-5 py-4 text-left">Weight</th>
                <th className="px-5 py-4 text-left">Price</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-center">Details</th>
              </tr>
            </thead>

            <tbody>
              {newOffers?.length > 0 ? (
                newOffers
                  .map((order: any) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-none hover:bg-blue-50/40 transition"
                    >
                      {/* Request */}
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {order.request_number}
                      </td>

                      {/* Service */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${order.service_type === "buy_for_me"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                            }`}
                        >
                          {order.service_type === "buy_for_me"
                            ? "Buy For Me"
                            : "Ship For Me"}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="px-5 py-4 text-gray-600">
                        <div className="leading-tight">
                          <p className="font-medium">
                            {order.ship_from_city} → {order.ship_to_city}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.ship_from_state}, {order.ship_to_state}
                          </p>
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="px-5 py-4">{order.total_aprox_weight} kg</td>

                      {/* Price */}
                      <td className="px-5 py-4 font-semibold text-blue-600">
                        ${order.total_price}
                      </td>

                      {/* Statuses */}
                      <td className="px-5 py-4 flex flex-wrap gap-1">
                        {(() => {
                          const rawStatus = order?.orderStatus?.name ?? "Pending";
                          const status = rawStatus.toLowerCase();

                          const statusColors: Record<string, string> = {
                            pending: "bg-yellow-100 text-yellow-800",

                            "offer placed": "bg-blue-100 text-blue-800",
                            "offer accepted": "bg-green-100 text-green-800",

                            "payment pending": "bg-orange-100 text-orange-800",

                            inprogress: "bg-purple-100 text-purple-800",
                            processed: "bg-indigo-100 text-indigo-800",

                            forwarded: "bg-cyan-100 text-cyan-800",
                            received: "bg-teal-100 text-teal-800",

                            completed: "bg-green-200 text-green-900",
                          };

                          return (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {rawStatus}
                            </span>
                          );
                        })()}
                      </td>

                      {/* View */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No new requests available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="flex items-center justify-between mt-6 px-2">
              {/* Info */}
              <p className="text-sm text-gray-600">
                Page <span className="font-medium">{meta.current_page}</span> of{" "}
                <span className="font-medium">{meta.last_page}</span> — Total{" "}
                <span className="font-medium">{meta.total}</span> records
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={!meta.prev_page_url || loading}
                  onClick={() => setPage(meta.current_page - 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
          ${meta.prev_page_url
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Previous
                </button>

                <button
                  disabled={!meta.next_page_url || loading}
                  onClick={() => setPage(meta.current_page + 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
          ${meta.next_page_url
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-100 text-blue-300 cursor-not-allowed"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Send offer modal  */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => {
          setConfirmModal({ open: false, id: null, status: null });
          setOfferPrice("");
          setPriceRows([]);
          setError("");
        }}
        className="max-w-xl w-full m-4"
      >
        <div className="bg-white p-6 rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto">

          {/* Header */}
          <h3 className="text-xl font-semibold mb-1 text-gray-900">
            {confirmModal.status === "inprogress"
              ? "Send Your Offer"
              : "Cancel This Offer"}
          </h3>

          <p className="text-gray-500 mb-6 text-sm">
            {confirmModal.status === "inprogress"
              ? "Enter your offer price and optionally add more price details."
              : "Are you sure you want to cancel this offer?"}
          </p>

          {confirmModal.status === "inprogress" && (
            <>
              {/* MAIN PRICE */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Offer Price ($)
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter main price"
                  className={`!h-11 ${error ? "!border-red-500 focus:!border-red-500" : ""
                    }`}
                  value={offerPrice}
                  onChange={(e) => {
                    setOfferPrice(e.target.value);
                    if (error) setError("");
                  }}
                />

                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>

              {/* ADD MORE PRICE BUTTON (Always Visible) */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Additional Prices
                </h4>

                <button
                  type="button"
                  onClick={() =>
                    setPriceRows([
                      ...priceRows,
                      { id: Date.now(), title: "", price: "" },
                    ])
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  + Add More
                </button>
              </div>

              {/* ADDITIONAL ROWS */}
              {priceRows.length > 0 && (
                <div className="space-y-3 mb-6">
                  {priceRows.map((row) => (
                    <div key={row.id}>

                      <div
                        className={`flex gap-3 items-center p-3 rounded-lg border ${rowErrors[row.id]
                          ? "border-red-400 bg-red-50"
                          : "bg-gray-50"
                          }`}
                      >
                        {/* Title */}
                        <Input
                          placeholder="Title"
                          className={`flex-1 !h-10 text-sm ${rowErrors[row.id] ? "!border-red-500" : ""
                            }`}
                          value={row.title}
                          onChange={(e) => {
                            setPriceRows(
                              priceRows.map((item) =>
                                item.id === row.id
                                  ? { ...item, title: e.target.value }
                                  : item
                              )
                            );

                            // remove error on typing
                            if (rowErrors[row.id]) {
                              const updated = { ...rowErrors };
                              delete updated[row.id];
                              setRowErrors(updated);
                            }
                          }}
                        />

                        {/* Price */}
                        <Input
                          type="number"
                          placeholder="Price"
                          className={`w-28 !h-10 text-sm ${rowErrors[row.id] ? "!border-red-500" : ""
                            }`}
                          value={row.price}
                          onChange={(e) => {
                            setPriceRows(
                              priceRows.map((item) =>
                                item.id === row.id
                                  ? { ...item, price: e.target.value }
                                  : item
                              )
                            );

                            if (rowErrors[row.id]) {
                              const updated = { ...rowErrors };
                              delete updated[row.id];
                              setRowErrors(updated);
                            }
                          }}
                        />

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            setPriceRows(
                              priceRows.filter((item) => item.id !== row.id)
                            );

                            const updated = { ...rowErrors };
                            delete updated[row.id];
                            setRowErrors(updated);
                          }}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Error Message */}
                      {rowErrors[row.id] && (
                        <p className="text-red-500 text-xs mt-1">
                          {rowErrors[row.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() =>
                setConfirmModal({ open: false, id: null, status: null })
              }
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                if (confirmModal.status === "inprogress") {

                  // Main Price Validation
                  if (!offerPrice || Number(offerPrice) <= 0) {
                    setError("Offer price is required");
                    return;
                  }

                  // Additional Rows Validation (Only if rows exist)
                  if (priceRows.length > 0) {
                    const newErrors: Record<number, string> = {};

                    priceRows.forEach((row) => {
                      if (!row.title || !row.price || Number(row.price) <= 0) {
                        newErrors[row.id] = "Title and price is required";
                      }
                    });

                    if (Object.keys(newErrors).length > 0) {
                      setRowErrors(newErrors);
                      return;
                    }
                  }
                }

                setError("");
                setRowErrors({});
                handleConfirm();
              }}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              {confirmModal.status === "inprogress"
                ? "Send Offer"
                : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
      {/* Order detail modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        className="max-w-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        {selectedOrder && (
          <div className="space-y-6">

            {/* Header */}
            <div className="relative border-b pb-4 pr-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-sm text-gray-500">Complete information about this order</p>
                </div>
                <span
                  className={`inline-block px-4 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${selectedOrder.service_type === "buy_for_me"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-indigo-100 text-indigo-700"
                    }`}
                >
                  {selectedOrder.service_type === "buy_for_me" ? "Buy For Me" : "Ship For Me"}
                </span>
              </div>
            </div>

            {/* Route Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-4">Shipping Route</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-800">From</p>
                  <p>{selectedOrder.ship_from_country}, {selectedOrder.ship_from_state}, {selectedOrder.ship_from_city}</p>
                </div>
                <div className="text-gray-400 text-xl">→</div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">To</p>
                  <p>{selectedOrder.ship_to_country}, {selectedOrder.ship_to_state}, {selectedOrder.ship_to_city}</p>
                </div>
              </div>
            </div>

            {/* Products Section */}
            {selectedOrder.order_details && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Products</h3>
                <div className="space-y-4">
                  {selectedOrder.order_details.map((product: any, index: number) => {
                    const price = Number(product.product.price);
                    const qty = Number(product.product.quantity);
                    const total = price * qty;

                    return (
                <div
                  key={index}
                  className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{product.product.title}</p>
                      {product.product.description && (
                        <p className="text-sm text-gray-500 mt-1">{product.product.description}</p>
                      )}
                    </div>
                    <a
                      href={product.product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      View Product
                    </a>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-medium">${price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium">{qty}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Weight</p>
                      <p className="font-medium">{product.product.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold text-green-600">${total}</p>
                    </div>
                  </div>
                </div>
                );
            })}
              </div>
        </div>
        )}

        {/* Services & Summary */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Extra Services */}
          {selectedOrder.order_services && selectedOrder.order_services.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">Additional Services</h4>
              <div className="space-y-2 text-sm">
                {selectedOrder.order_services.map((services: any, index: number) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <span>{services.service.title}</span>
                    <span className="font-medium">${services.service.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-black text-white rounded-2xl p-6 shadow-lg">
            <h4 className="font-semibold mb-4">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Total</span>
                <span className="font-semibold text-lg">
                  ${Number(selectedOrder.total_price).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customer</span>
                <span className="font-medium">
                  {selectedOrder?.user?.name || selectedOrder?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown Section */}
        {selectedOrder.payment_setting && selectedOrder.payment_setting.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-4">Payment Breakdown</h4>

            <div className="space-y-3">

              {/* Original Total */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Order Total</span>
                <span className="font-semibold text-gray-800">
                  ${Number(selectedOrder.total_price).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200" />

              {/* Each Fee */}
              {selectedOrder.payment_setting.map((fee: any) => (
                <div key={fee.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">{fee.title}</span>
                    <span className="text-xs text-gray-400">
                      ({fee.type === "percent" ? `${fee.amount}%` : "fixed"})
                    </span>
                  </div>
                  <span className="text-red-500 font-medium">
                    -${Number(fee.deducted_amount).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200" />

              {/* Total Deductions */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Total Deductions</span>
                <span className="text-red-600 font-semibold">
                  -${Number(selectedOrder.total_deductions).toFixed(2)}
                </span>
              </div>

              {/* You Earn */}
              <div className="flex justify-between items-center bg-blue-600 text-white rounded-xl px-4 py-3 mt-1">
                <span className="font-medium text-sm">Remening Amount</span>
                <span className="font-bold text-lg">
                  ${Number(selectedOrder.remening_earning).toFixed(2)}
                </span>
              </div>

            </div>
          </div>
        )}

      </div>
  )}
    </Modal >

    </>
  );
}
