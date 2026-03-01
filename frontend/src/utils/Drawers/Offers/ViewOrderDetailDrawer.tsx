import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";

interface ViewOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

export default function ViewOrderDetailDrawer({
  isOpen,
  onClose,
  orderId,
}: ViewOrderDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await ApiHelper("GET", `/order/get-order-detail/${orderId}`);
        setOrderData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`relative bg-white shadow-xl h-full w-full sm:w-5/6 md:w-2/3 lg:w-1/2 rounded-l-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          {loading && <div className="text-center text-gray-500">Loading...</div>}

          {!loading && orderData && (
            <div className="space-y-6">

              {/* ================= ORDER SUMMARY ================= */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-6 shadow-lg">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="text-xs opacity-80">Request Number</p>
                    <h3 className="text-xl font-bold tracking-wide">
                      {orderData.request_number}
                    </h3>
                  </div>

                  <span className="mt-3 sm:mt-0 bg-white/20 px-4 py-1 rounded-full text-xs font-semibold backdrop-blur">
                    {orderData.order_trackings?.[0]?.status?.name ?? "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm mt-6">

                  <div>
                    <p className="opacity-80 text-xs">Service Type</p>
                    <p className="capitalize font-medium">
                      {orderData.service_type.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Ship From</p>
                    <p>
                      {orderData.ship_from_city?.name},{" "}
                      {orderData.ship_from_state?.name},{" "}
                      {orderData.ship_from_country?.name}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Ship To</p>
                    <p>
                      {orderData.ship_to_city?.name},{" "}
                      {orderData.ship_to_state?.name},{" "}
                      {orderData.ship_to_country?.name}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Weight</p>
                    <p>{orderData.total_aprox_weight} g</p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Total Price</p>
                    <p className="font-semibold text-lg">
                      ${orderData.total_price}
                    </p>
                  </div>

                </div>
              </div>

              {/* ================= PRODUCT DETAILS ================= */}
              {orderData.order_details?.length > 0 && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-5 text-gray-800">
                    Product Details
                  </h4>

                  <div className="space-y-5">
                    {orderData.order_details.map((detail: any) => {

                      const title = detail.product?.title ?? "Product";
                      const initials = title
                        .split(" ")
                        .slice(0, 2)
                        .map((w: string) => w[0])
                        .join("")
                        .toUpperCase();

                      return (
                        <div
                          key={detail.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex gap-4 items-start w-full">

                            {/* Product Image or Initial Avatar */}
                            {detail.product?.image ? (
                              <img
                                src={detail.product.image}
                                alt={title}
                                className="w-16 h-16 rounded-xl object-cover border"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                {initials}
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                  #{detail.request_details_number}
                                </span>
                              </div>

                              <p className="font-medium text-gray-800">
                                {title}
                              </p>

                              {detail.product?.description && (
                                <p className="text-gray-600 text-sm line-clamp-2">
                                  {detail.product.description}
                                </p>
                              )}

                              {detail.product?.product_url && (
                                <a
                                  href={detail.product.product_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 text-xs hover:underline mt-1 inline-block"
                                >
                                  View Product
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="text-sm text-right sm:text-left w-full sm:w-auto space-y-1">
                            <p>Qty: {detail.quantity}</p>
                            <p>Price: ${detail.price}</p>
                            <p>Weight: {detail.weight}g</p>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= SELECTED SERVICES ================= */}
              {orderData.order_services?.length > 0 && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-5 text-gray-800">
                    Selected Services
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {orderData.order_services.map((srv: any) => (
                      <div
                        key={srv.id}
                        className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-3 hover:shadow transition"
                      >
                        <span className="font-medium text-gray-700">
                          {srv.service?.title}
                        </span>

                        <span className="font-semibold text-indigo-600">
                          ${srv.service?.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
