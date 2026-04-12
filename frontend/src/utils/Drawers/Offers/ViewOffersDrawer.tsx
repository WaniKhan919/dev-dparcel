import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";
import { Modal } from "../../../components/ui/modal";
import { fetchNotifications } from "../../../slices/notificationSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchOrders } from "../../../slices/orderSlice";

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function ViewOffersDrawer({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;

  const dispatch = useDispatch<AppDispatch>();
  const [offersData, setOffersData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "rejected" | "accepted" | null;
  }>({ open: false, id: null, status: null });

  const getOffers = async () => {
    try {
      const res = await ApiHelper(
        "GET",
        `/order/shipper/offers/${orderData.id}`
      );

      if (res.status === 200) {
        const data = res.data.data;

        const acceptedOffer = data.offers?.find(
          (offer: any) => offer.status === "accepted"
        );

        const filteredOffers = acceptedOffer
          ? [acceptedOffer]
          : data.offers;

        setOffersData({
          ...data,
          offers: filteredOffers,
        });
      }
    } catch (err) {
      setOffersData(null);
    }
  };

  const handleConfirm = () => {
    if (confirmModal.id && confirmModal.status) {
      handleOfferAction(confirmModal.id, confirmModal.status);
    }
    setConfirmModal({ open: false, id: null, status: null });
  };

  const handleOfferAction = async (
    offerId: number,
    status: "accepted" | "rejected"
  ) => {
    setActionLoading(true);
    try {
      const res = await ApiHelper(
        "POST",
        `/order/offer/${offerId}/status`,
        { status }
      );

      if (res.status === 200) {
        toast.success(res.data.message || `Offer ${status}`);
        dispatch(fetchOrders({ page: 1, per_page: 10 }));
        dispatch(fetchNotifications({ page: 1, type: "order" }));
        getOffers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (orderData?.id) {
      getOffers();
    }
  }, [orderData]);

  if (!offersData) return null;

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ===== HEADER + ORDER SUMMARY ===== */}
        <div className="bg-white border-b p-4 flex-shrink-0">
          <div className="flex justify-between items-start px-4 py-3 border-b bg-white z-10 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Order #{offersData.request_number}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black text-xl ml-2 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-gray-500">Service</p>
              <p className="font-semibold text-xs">
                {offersData.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-gray-500">Total Price</p>
              <p className="font-semibold text-blue-600 text-xs">
                ${offersData.total_price}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-gray-500">Approx Weight</p>
              <p className="font-semibold text-xs">
                {offersData.total_aprox_weight} g
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-gray-500">Status</p>
              <p className="font-semibold text-xs">
                {offersData.order_status?.name || "Pending"}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">From</p>
                <p className="font-medium text-sm">
                  {offersData.ship_from_city?.name}, {offersData.ship_from_state?.name}
                </p>
              </div>

              <div className="text-gray-400 text-lg font-bold mx-2">→</div>

              <div className="text-right">
                <p className="text-gray-500 text-xs">To</p>
                <p className="font-medium text-sm">
                  {offersData.ship_to_city?.name}, {offersData.ship_to_state?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== OFFERS LIST ===== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {offersData.offers?.length > 0 ? (
            offersData.offers.map((offer: any) => {
              const breakdown = offer.price_breakdown;
              const isAccepted = offer.status === "accepted";

              return (
                <div
                  key={offer.id}
                  className={`rounded-2xl p-5 shadow-md border transition ${isAccepted
                    ? "border-green-500 bg-green-50"
                    : "bg-white"
                    }`}
                >
                  {/* Shipper */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {offer.shipper?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {offer.shipper?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {offer.shipper?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {offer.shipper?.phone}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${offer.status === "accepted"
                        ? "bg-green-500 text-white"
                        : offer.status === "rejected"
                          ? "bg-red-500 text-white"
                          : offer.status === "inprogress"
                            ? "bg-blue-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-4 text-sm space-y-2">

                    {/* Offer Price */}
                    <div className="flex justify-between">
                      <span>Offer Price</span>
                      <span>${offer.price_breakdown?.offer_price}</span>
                    </div>

                    {/* Additional Charges */}
                    {offer.additional_prices?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-gray-600"
                      >
                        <span>{item.title}</span>
                        <span>${item.price}</span>
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="border-t pt-2"></div>

                    {/* Shipper Total */}
                    <div className="flex justify-between text-blue-600">
                      <span>Shipper Total</span>
                      <span className="font-semibold">
                        ${offer.price_breakdown?.shipper_total}
                      </span>
                    </div>

                    {/* FINAL TOTAL (MOST IMPORTANT 🔥) */}
                    <div className="flex justify-between font-bold text-green-600 text-base">
                      <span>Total Payable</span>
                      <span>
                        ${offer.price_breakdown?.total_payable}
                      </span>
                    </div>

                  </div>

                  {/* Buttons */}
                  {["pending", "inprogress"].includes(
                    offer.status
                  ) && (
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: offer.id,
                              status: "rejected",
                            })
                          }
                          className="w-1/2 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              id: offer.id,
                              status: "accepted",
                            })
                          }
                          className="w-1/2 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No offers available</p>
          )}
        </div>

        {/* Loading Overlay */}
        {actionLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() =>
          setConfirmModal({
            open: false,
            id: null,
            status: null,
          })
        }
        className="max-w-md"
      >
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">
            Confirm Action
          </h3>
          <p className="mb-6 text-gray-600">
            Are you sure you want to{" "}
            <strong>{confirmModal.status}</strong> this offer?
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() =>
                setConfirmModal({
                  open: false,
                  id: null,
                  status: null,
                })
              }
              className="px-4 py-2 rounded-lg bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-white ${confirmModal.status === "accepted"
                ? "bg-green-500"
                : "bg-red-600"
                }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}