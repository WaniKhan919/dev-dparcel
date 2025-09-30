import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function TrackOrderDrawer({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [orderTracking, setOrderTrackingData] = useState<any>([]);

  const getOrderTrackingData = async () => {
    setIsLoading(true);
    try {
      const res = await ApiHelper("GET", `/order/get-order-tracking/${orderData.id}`);
      if (res.status === 200) {
        const trackingArray = res.data.data; // assume this is an array
        const historyData = trackingArray.map((tracking: any) => ({
          id: tracking.id,
          status: tracking.status?.name
            ? "Order " + tracking.status.name.charAt(0).toUpperCase() + tracking.status.name.slice(1)
            : "Unknown",
          time: new Date(tracking.created_at).toLocaleString(), // format timestamp
          remarks: tracking.remarks || null,
        }));

        setOrderTrackingData(historyData);

      } else {
        setOrderTrackingData([]);
      }
    } catch {
      toast.error("Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderData.id) {
      getOrderTrackingData();
    }
  }, [orderData]);

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Order – #{orderData?.tracking_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          {/* Order History */}
          <div>
            <h3 className="text-md font-semibold mb-3">Order History</h3>
            <ol className="relative border-l border-gray-300">
              {orderTracking.map((item: any) => (
                <li key={item.id} className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 border border-white"></div>

                  <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                    {item.time}
                  </time>

                  <p className="text-base font-medium text-gray-800">
                    {item.status}
                  </p>

                  {item.remarks && (
                    <p className="text-sm text-gray-600 italic mt-1">
                      {item.remarks}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
