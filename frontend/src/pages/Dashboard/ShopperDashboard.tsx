import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";
import { ApiHelper } from "../../utils/ApiHelper";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopperLatestMessages } from "../../slices/shopper/shopperLatestChatsSlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import toast from "react-hot-toast";


export default function ShopperDashboard() {

  const [ordersData, setOrdersData] = useState<{
    total_orders: number;
    ship_for_me: number;
    buy_for_me: number;
  }>({
    total_orders: 0,
    ship_for_me: 0,
    buy_for_me: 0,
  });
  const [offerStats, setOfferStats] = useState<{
    accepted_offers: number;
    inprogress_offers: number;
  }>({
    accepted_offers: 0,
    inprogress_offers: 0,
  });

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "rejected" | "accepted" | null;
  }>({ open: false, id: null, status: null });

  const [loading, setLoading] = useState(false);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [shipmentsState, setShipmentsState] = useState({
    data: [],
    meta: null,
    page: 1,
    loading: false,
  });

  const [confirmShipmentModal, setConfirmShipmentModal] = useState<{
    open: boolean;
    orderId: number | null;
    loading: boolean;
  }>({ open: false, orderId: null, loading: false });

  const { data: shopperLatestChats, loading: latestChatLoading } = useSelector((state: any) => state.shopperLatestChats);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [viewModal, setViewModal] = useState({
    open: false,
    data: null as any,
  });

  useEffect(() => {
    fetchOffersCount();
    fetchPendingOffers();
    fetchOrdersStats();
    fetchCompleteOrders();
  }, []);

  useEffect(() => {
    dispatch(fetchShopperLatestMessages());
  }, [dispatch]);

  const fetchOrdersStats = async () => {
    setLoading(true);
    try {
      const res = await ApiHelper("GET", "/shopper/dashboard/orders");

      if (res.status === 200 && res.data.success) {
        setOrdersData(res.data.data);
      } else {
        setOrdersData({
          total_orders: 0,
          ship_for_me: 0,
          buy_for_me: 0,
        });
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOffers = async () => {
    setLoading(true);
    try {
      const res = await ApiHelper("GET", "/shopper/dashboard/pending/offers");

      if (res.status === 200 && res.data.success) {
        setPendingOffers(res.data.data);
      } else {
        setPendingOffers([]);
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };
  const fetchCompleteOrders = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await ApiHelper("GET", "/shopper/dashboard/get/complete-orders");

      if (res.status === 200 && res.data.success) {
        setShipmentsState({
          data: res.data.data,
          meta: res.data.meta,
          page: pageNumber,
          loading: false,
        });
      } else {
        setShipmentsState((prev) => ({ ...prev, data: [], loading: false }));
      }
    } catch (err: any) {

      setShipmentsState((prev) => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersCount = async () => {
    setLoading(true);
    try {
      const res = await ApiHelper("GET", "/shopper/dashboard/offers");

      if (res.status === 200 && res.data.success) {
        setOfferStats({
          accepted_offers: Number(res.data.data.accepted_offers),
          inprogress_offers: Number(res.data.data.inprogress_offers),
        });
      } else {
        setOfferStats({
          accepted_offers: 0,
          inprogress_offers: 0,
        });
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    console.log(confirmModal)
    if (confirmModal.id && confirmModal.status) {
      handleOfferAction(confirmModal.id, confirmModal.status);
    }
    setConfirmModal({ open: false, id: null, status: null });
  };

  const handleOfferAction = async (offerId: number, status: "accepted" | "rejected") => {

    try {
      const res = await ApiHelper("POST", `/order/offer/${offerId}/status`, { status });

      if (res.status === 200) {
        toast.success(res.data.message || `Offer ${status}`, {
          duration: 3000,
          position: "top-right",
          style: {
            background: status === "accepted" ? "#4caf50" : "#ff9800",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: status === "accepted" ? "✅" : "❌",
        });

        fetchPendingOffers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} ❌`, {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: "⚠️",
      });
    } finally {
    }
  };

  const handleConfirmReceived = async () => {
    if (!confirmShipmentModal.orderId) return;

    setConfirmShipmentModal((prev) => ({ ...prev, loading: true }));

    try {
      const response = await ApiHelper("POST",`/shopper/order/${confirmShipmentModal.orderId}/mark-completed`);

      if (response.status === 200 || response.status === 201) {
        toast.success("Order marked as completed!");
        setConfirmShipmentModal({ open: false, orderId: null, loading: false });
        fetchCompleteOrders(shipmentsState.page);
      } else {
        toast.error(response.data?.message || "Failed to mark order as completed.");
        setConfirmShipmentModal((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setConfirmShipmentModal((prev) => ({ ...prev, loading: false }));
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
                  <p className="text-2xl font-bold">
                    {loading ? "..." : ordersData.total_orders}
                  </p>
                  <p className="text-gray-600 mb-2">Total Orders</p>
                  <div className="text-sm text-gray-500 flex gap-4">
                    <span>Ship For Me: {ordersData.ship_for_me}</span>
                    <span>Buy For Me: {ordersData.buy_for_me}</span>
                  </div>
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
                  to="/shopper/view/requests"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>

            {/* Pickup Soon */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-yellow-400 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">{offerStats.accepted_offers}</p>
                  <p className="text-gray-600">Accepted Offers</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <Link
                  to="/shopper/view/requests"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-green-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">{offerStats.inprogress_offers}</p>
                  <p className="text-gray-600">Inprogress Offers</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <Link
                  to="/shopper/view/requests"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>
          </div>
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
            ) : shopperLatestChats && shopperLatestChats.length > 0 ? (
              shopperLatestChats.map((chat: any) => {
                const initials = chat.shipper_name
                  ? chat.shipper_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                  : "";

                return (
                  <div
                    key={chat.order_id}
                    onClick={() =>
                      navigate("/shopper/messages", {
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
                        <p className="font-medium text-gray-800">{chat.shipper_name}</p>
                        <p className="text-xs text-gray-500">
                          {chat.latest_message || "No messages yet"}
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

        {/* RIGHT: Pending Offers */}
        <div className="bg-white shadow-md rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-4">Pending Offers</h2>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">

            {pendingOffers.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-10">
                No pending offers available.
              </div>
            ) : (
              pendingOffers.map((offer: any) => (
                <div
                  key={offer.order_id}
                  className="border rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        #{offer.request_number}
                      </p>

                      {/* Service Type Tag */}
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full font-semibold
                        ${offer.service_type === "buy_for_me"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-indigo-100 text-indigo-700"
                          }`}
                      >
                        {offer.service_type === "buy_for_me"
                          ? "Buy For Me"
                          : "Ship For Me"}
                      </span>
                    </div>

                    {/* Status Tag */}
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold
                      ${offer.offer_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {offer.offer_status}
                    </span>
                  </div>

                  {/* Middle Info as Tags */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">

                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      👤 {offer.shipper_name}
                    </span>

                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      💵 Order: ${offer.order_total}
                    </span>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      Offered: ${offer.offer_price}
                    </span>

                  </div>

                  {/* Footer */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-3">
                      {offer.created_at}
                    </p>

                    <div className="flex gap-2">

                      {/* Reject */}
                      <button
                        onClick={() =>
                          setConfirmModal({ open: true, id: offer.offer_id, status: "rejected" })
                        }
                        className="flex-1 py-2 text-xs rounded-xl bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
                      >
                        Reject
                      </button>

                      {/* Accept */}
                      <button
                        onClick={() =>
                          setConfirmModal({ open: true, id: offer.offer_id, status: "accepted" })
                        }
                        className="flex-1 py-2 text-xs rounded-xl bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition"
                      >
                        Accept
                      </button>

                      {/* View */}
                      <button
                        onClick={() => setViewModal({ open: true, data: offer })}
                        className="flex-1 py-2 text-xs rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition"
                      >
                        View
                      </button>

                    </div>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>


        {/* Confirm Modal */}
        <Modal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, id: null, status: null })}
          className="max-w-md m-4"
        >
          <div className="bg-white p-6 rounded-2xl text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Action</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to{" "}
              <strong className="capitalize">{confirmModal.status}</strong> this request?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmModal({ open: false, id: null, status: null })}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white transition ${confirmModal.status === "accepted"
                  ? "bg-green-500 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>

        {/* View Offer Details */}
        <Modal
          isOpen={viewModal.open}
          onClose={() => setViewModal({ open: false, data: null })}
          className="max-w-xl p-0 overflow-hidden"
        >
          {viewModal.data && (
            <div className="bg-white rounded-3xl">

              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex justify-between items-start">

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Request # {viewModal.data.request_number}
                    </h2>

                    {/* Status Badge */}
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold
              ${viewModal.data.offer_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : viewModal.data.offer_status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : viewModal.data.offer_status === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {viewModal.data.offer_status}
                    </span>

                  </div>


                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">

                {/* Service + Shipper */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                    {viewModal.data.service_type === "buy_for_me"
                      ? "Buy For Me"
                      : "Ship For Me"}
                  </span>

                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    👤 {viewModal.data.shipper_name}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">

                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total</span>
                    <span className="font-medium">
                      ${viewModal.data.order_total}
                    </span>
                  </div>

                  {/* Additional Prices */}
                  {viewModal.data.additionalPrices &&
                    viewModal.data.additionalPrices.length > 0 &&
                    viewModal.data.additionalPrices.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-gray-600"
                      >
                        <span>{item.title}</span>
                        <span>${item.price}</span>
                      </div>
                    ))}

                  <div className="border-t pt-3 flex justify-between font-semibold text-green-600">
                    <span>Offered Price</span>
                    <span>${viewModal.data.offer_price}</span>
                  </div>
                </div>

                {/* Message */}
                {viewModal.data.offer_message && (
                  <div className="bg-blue-50 p-4 rounded-2xl text-sm text-gray-700">
                    <p className="font-medium mb-1">Message</p>
                    <p>{viewModal.data.offer_message}</p>
                  </div>
                )}

                {/* Created At */}
                <p className="text-xs text-gray-400">
                  Created {viewModal.data.created_at}
                </p>

              </div>

            </div>
          )}
        </Modal>

      </div>
      {/* 📦 My Shipments (Compact List) */}
      <div className="pt-4 space-y-4">
        {shipmentsState.loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shipmentsState.data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">No shipments found.</p>
          </div>
        ) : (
          shipmentsState.data.map((item: any) => {
            const isCompleted = item.order_status?.name === "Received" || item.order_status?.name === "Completed";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition p-5 space-y-4"
              >
                {/* TOP ROW */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Request Number</p>
                    <p className="text-sm font-bold text-gray-800">
                      {item.request_number}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {item.order_status?.name || "In Transit"}
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${item.service_type === "buy_for_me"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {item.service_type === "buy_for_me" ? "Buy For Me" : "Ship For Me"}
                    </span>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Products</p>
                  <div className="divide-y rounded-xl border overflow-hidden">
                    {item.order_details?.map((od: any) => (
                      <div
                        key={od.id}
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {od.product?.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            Qty: {od.quantity} · Weight: {od.weight} kg · ${od.price}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            HS: {od.product?.custom_decleration_product?.hs_code || "—"}
                          </span>
                          <br />
                          <span className="text-xs text-gray-400">
                            {od.product?.custom_decleration_product?.origin_country || ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">

                  {/* Tracking Link */}
                  {item.tracking_link ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <a
                        href={item.tracking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.tracking_link}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition min-w-0 group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="truncate underline underline-offset-2 group-hover:no-underline max-w-[220px]">
                          {item.tracking_link}
                        </span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.tracking_link);
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
                  ) : (
                    <span className="text-xs text-gray-400 italic">No tracking link available</span>
                  )}

                  {/* Summary + Action */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {item.total_aprox_weight} kg · ${item.total_price}
                    </span>

                    {!isCompleted && (
                      <button
                        onClick={() =>
                          setConfirmShipmentModal({ open: true, orderId: item.id, loading: false })
                        }
                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                      >
                        Mark as Received
                      </button>
                    )}

                    {isCompleted && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✓ Received
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {shipmentsState.meta && (shipmentsState.meta as any).last_page > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Page {shipmentsState.page} of {(shipmentsState.meta as any).last_page}
            </p>
            <div className="flex gap-2">
              <button
                disabled={shipmentsState.page === 1}
                onClick={() => fetchCompleteOrders(shipmentsState.page - 1)}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={shipmentsState.page === (shipmentsState.meta as any).last_page}
                onClick={() => fetchCompleteOrders(shipmentsState.page - 1)}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div >
      {/* Confirm Modal */}
      <Modal
        isOpen={confirmShipmentModal.open}
        onClose={() => !confirmShipmentModal.loading && setConfirmShipmentModal({ open: false, orderId: null, loading: false })}
        className="max-w-md w-full m-4"
        closeOnOutsideClick={!confirmShipmentModal.loading}
      >
        <div className="bg-white p-6 rounded-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
            Confirm Order Received
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            By confirming, you acknowledge that you have received your order and are satisfied. This will close the order.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setConfirmShipmentModal({ open: false, orderId: null, loading: false })}

              disabled={confirmShipmentModal.loading}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReceived}
              disabled={confirmShipmentModal.loading}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {confirmShipmentModal.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Confirming...
                </span>
              ) : (
                "Yes, I Received It"
              )}
            </button>
          </div>
        </div>
      </Modal >
    </>
  );
}
