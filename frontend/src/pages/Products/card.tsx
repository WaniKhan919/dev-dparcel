import React, { useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
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

interface CardToastProps {
  notifications: Notification[];
}

export default function CardToast({ notifications }: CardToastProps) {
  const [visibleIds, setVisibleIds] = useState<number[]>(notifications.map(d => d.id));
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "inprogress" | "cancelled" | null;
  }>({ open: false, id: null, status: null });

  const confirmRequest = async (id: number, status: "inprogress" | "cancelled") => {
    try {
      const response = await ApiHelper("POST", "/shipper/confirm/request", { id, status });

      if (response.status === 200) {
        setVisibleIds(prev => prev.filter(d => d !== id));
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
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("API Error!");
    }
  };

  const handleConfirm = () => {
    if (confirmModal.id && confirmModal.status) {
      confirmRequest(confirmModal.id, confirmModal.status);
    }
    setConfirmModal({ open: false, id: null, status: null });
  };
  const handleViewDetails = (id:any) => {
    
  };

  return (
    <>
      {/* Toast Cards */}
      <div className="fixed bottom-4 right-4 z-[100000] flex flex-col gap-3 max-h-[100vh] overflow-y-auto scroll-hidden">
        {notifications
          .filter(notification => visibleIds.includes(notification.id))
          .map((notification, index) => (
            <div
              key={notification.id}
              className="w-80 bg-white rounded-3xl p-4 shadow-lg animate-slide-up animate-toast-pop"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex justify-between items-center">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {notification.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{notification.name}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="text-right text-sm font-semibold">
                  <div>{notification.total_aprox_weight} (g)</div>
                </div>
              </div>

              {/* Price */}
              <div className="flex">
                <span className="w-1/2 p-4">
                  <b>From: </b> {notification.ship_from}
                </span>
                <span className="w-1/2 p-4">
                  <b>To: </b> {notification.ship_to}
                </span>
              </div>
             <div className="flex items-center justify-between mt-4">
              <div className="text-xl font-semibold text-blue-600">
                {notification.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"} ${" "}
                {notification.total_price}
              </div>

              <button
                onClick={() => handleViewDetails(notification.id)}
                className="text-sm text-blue-600 font-medium underline hover:text-blue-800"
              >
                View Details
              </button>
            </div>


              {/* Buttons */}
              <div className="flex mt-3">
                <button
                  onClick={() =>
                    setConfirmModal({ open: true, id: notification.id, status: "cancelled" })
                  }
                  className="bg-gray-200 w-1/2 py-3 rounded-full mr-2"
                >
                  Cancelled
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({ open: true, id: notification.id, status: "inprogress" })
                  }
                  style={{
                    backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                  }}
                  className="w-1/2 py-3 rounded-full ml-2 text-white font-medium shadow-md"
                >
                  Send Offer
                </button>
              </div>
            </div>
          ))}
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
            <strong className="capitalize">{confirmModal.status=="inprogress"?'Offer':confirmModal.status}</strong> this request?
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
              className={`px-4 py-2 rounded-lg text-white transition ${
                confirmModal.status === "inprogress"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
