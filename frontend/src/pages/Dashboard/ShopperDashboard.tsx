import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";
import { ApiHelper } from "../../utils/ApiHelper";
import { Link, useNavigate } from "react-router";
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

  const { data: shopperLatestChats, loading: latestChatLoading } = useSelector((state: any) => state.shopperLatestChats);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    fetchOffersCount();
    fetchPendingOffers();
    fetchOrdersStats();
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
                  className="border rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        {offer.request_number}
                      </p>
                      <p className="font-semibold text-gray-800">
                        {offer.service_type === "buy_for_me"
                          ? "Buy For Me"
                          : "Ship For Me"}
                      </p>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-medium
                      ${offer.offer_status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"}`}>
                      {offer.offer_status}
                    </span>
                  </div>

                  {/* Middle Info */}
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-800">Shipper:</span>{" "}
                      {offer.shipper_name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Order Total:</span>{" "}
                      ${offer.order_total}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Offered Price:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        ${offer.offer_price}
                      </span>
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-3">
                      {offer.created_at}
                    </p>

                    <div className="flex gap-3">
                      {/* Reject Button */}
                      <button
                        onClick={() =>
                          setConfirmModal({ open: true, id: offer.id, status: "rejected" })
                        }
                        className="w-1/2 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                      >
                        Reject
                      </button>

                      {/* Accept Button */}
                      <button
                        onClick={() =>
                          setConfirmModal({ open: true, id: offer.id, status: "accepted" })
                        }
                        style={{
                          backgroundImage:
                            "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                        }}
                        className="w-1/2 py-2 rounded-lg text-white font-medium shadow-md hover:opacity-90 transition"
                      >
                        Accept
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

      </div>
    </>
  );
}
