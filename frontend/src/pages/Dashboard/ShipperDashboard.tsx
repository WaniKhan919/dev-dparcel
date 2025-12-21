import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";
import Card from "../Products/Card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchRequests } from "../../slices/shopperRequestSlice";
import { fetchNewOffers } from "../../slices/shipperNewOffersSlice";
import { fetchLatestMessages } from "../../slices/latestChatsSlice";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Modal } from "../../components/ui/modal";

interface Notification {
  id: number;
  name: string;
  ship_to: string;
  ship_from: string;
  service_type: string;
  total_aprox_weight: number;
  total_price: number;
}

export default function ShipperDashboard() {

  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, error } = useSelector((state: any) => state.shopperRequest);
  const { data:newOffers, loading:loadingOffers, errorOffers } = useSelector((state: any) => state.shipperNewOffers);
  const { data: latestChats, loading:latestChatLoading } = useSelector((state: any) => state.latestChats);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchNewOffers());
    dispatch(fetchLatestMessages());
  }, [dispatch]);

  const notification: Notification[] = useMemo(() => {
    if (!requests) return [];
    return requests.map((item: any) => ({
      id: Number(item.id),
      name: item.user?.name || "Unknown",
      ship_from_country: item.ship_from_country,
      ship_from_state: item.ship_from_state,
      ship_from_city: item.ship_from_city,
      ship_to_country: item.ship_to_country,
      ship_to_state: item.ship_to_state,
      ship_to_city: item.ship_to_city,
      service_type: item.service_type,
      total_aprox_weight: Number(item.total_aprox_weight),
      total_price: Number(item.total_price),
    }));
  }, [requests]);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 -mt-25">
            {/* Total Orders */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-blue-600 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-gray-600">Total orders</p>
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
                <a href="#" className="text-blue-600 font-medium text-sm">
                  See all
                </a>
              </div>
            </div>


            {/* Pickup Soon */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-yellow-400 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-gray-600">Pickup soon</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <a href="#" className="text-blue-600 font-medium text-sm">
                  See all
                </a>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-green-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">€0.00</p>
                  <p className="text-gray-600">Your current balance</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <a href="#" className="text-blue-600 font-medium text-sm">
                  See all
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          {
            notification.length > 0 &&
            <Card notifications={notification} />
          }
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
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={chat.order_id}
                    onClick={() =>
                      navigate("/shipper/messages", {
                        state: { orderId: chat.order_id },
                      })
                    }
                    className={`flex items-center justify-between p-3 rounded-xl border transition
                      ${
                        chat.unread_count > 0
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${
                            chat.unread_count > 0
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

            {newOffers?.map((order: any) => (
                <div
                  key={order.id}
                  className="border rounded-xl p-4 bg-green-50 border-green-300 hover:bg-green-100 transition"
                >
                  <div className="flex justify-between">
                    <p className="font-bold text-gray-800 text-sm">
                      From {order.ship_from_country}, {order.ship_from_state},{" "}
                      {order.ship_from_city}
                      {" "}→{" "}
                      {order.ship_to_country}, {order.ship_to_state},{" "}
                      {order.ship_to_city}
                    </p>

                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full h-fit">
                      NEW
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    Shipping Type:{" "}
                    {order.service_type === "buy_for_me"
                      ? "Buy For Me"
                      : "Ship For Me"}{" "}
                    | Weight: {order.total_aprox_weight}kg
                  </p>

                  <div className="flex justify-between mt-2">
                    <p className="text-gray-700 font-medium">
                      ${order.total_price}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      View details
                    </button>

                  </div>
                </div>
              ))}
          </div>
        </div>


      </div>
      {
        isModalOpen &&
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          className="max-w-2xl p-6"
        >
          {selectedOrder && (
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Order Details
                </h2>
                <p className="text-sm text-gray-500">
                  Request #: {selectedOrder.request_number}
                </p>
              </div>

              {/* From → To */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="font-medium text-gray-700 mb-1">Route</p>
                <p className="text-sm text-gray-600">
                  <strong>From:</strong>{" "}
                  {selectedOrder.ship_from_country},{" "}
                  {selectedOrder.ship_from_state},{" "}
                  {selectedOrder.ship_from_city}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>To:</strong>{" "}
                  {selectedOrder.ship_to_country},{" "}
                  {selectedOrder.ship_to_state},{" "}
                  {selectedOrder.ship_to_city}
                </p>
              </div>

              {/* Service Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Shipping Type</p>
                  <p className="font-medium">
                    {selectedOrder.service_type === "buy_for_me"
                      ? "Buy For Me"
                      : "Ship For Me"}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">
                    {selectedOrder.total_aprox_weight} kg
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium">
                    ${selectedOrder.total_price}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Shopper</p>
                  <p className="font-medium">
                    {selectedOrder.user.name}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="border rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-2">
                  Order Items
                </p>

                <div className="space-y-2">
                  {selectedOrder.order_details.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">
                          {item.product.title}
                        </p>
                        <p className="text-gray-500">
                          Qty: {item.quantity} | Weight: {item.weight}kg
                        </p>
                      </div>

                      <p className="font-medium">
                        €{item.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      }

    </>
  );
}
