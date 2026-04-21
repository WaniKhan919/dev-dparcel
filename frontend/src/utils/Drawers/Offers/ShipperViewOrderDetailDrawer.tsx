import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";

interface ViewOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

interface OrderData {
  id: string;
  request_number: string;
  order_status: string;
  total_aprox_weight: string;

  shipping_type: string;
  shipping_type_slug: string;

  ship_from_country: string;
  ship_from_state: string;
  ship_from_city: string;

  ship_to_country: string;
  ship_to_state: string;
  ship_to_city: string;

  price_breakdown: {
    initial_price: number;
    offer_price: number;
    services_total: number;
    stripe_fee: number;
    service_fee: number;
    grand_total: number;
    total_payable: number;
  };

  my_offer?: {
    services: {
      id: number;
      title: string;
      price: number;
    }[];
    total: number;
  };

  order_details: any[];
  order_services: any[];
}

export default function ShipperViewOrderDetailDrawer({
  isOpen,
  onClose,
  orderId,
}: ViewOrderDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await ApiHelper(
        "GET",
        `/shipper/order/${orderId}/shipper-detail`
      );

      if (res.status === 200 && res.data.success) {
        setOrderData(res.data.data);
      } else {
        setOrderData(null);
      }
    } catch (err) {
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative bg-white shadow-xl h-full w-full sm:w-5/6 md:w-2/3 lg:w-1/2 rounded-l-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            Order Details
          </h2>

          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-6">

          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && orderData && (
            <div className="space-y-6">

              {/* ORDER SUMMARY */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-6 shadow-lg">

                <div className="flex justify-between">
                  <div>
                    <p className="text-xs opacity-80">Request Number</p>
                    <h3 className="text-xl font-bold">
                      {orderData.request_number}
                    </h3>
                  </div>

                  <span className="bg-white/20 px-3 py-3 rounded-full text-xs">
                    {orderData.order_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-5 text-sm mt-6">

                  <div>
                    <p className="opacity-80 text-xs">Service Type</p>
                    <p>{orderData.shipping_type}</p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Weight</p>
                    <p>{orderData.total_aprox_weight} g</p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Ship From</p>
                    <p>
                      {orderData.ship_from_city}, {orderData.ship_from_state},{" "}
                      {orderData.ship_from_country}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Ship To</p>
                    <p>
                      {orderData.ship_to_city}, {orderData.ship_to_state},{" "}
                      {orderData.ship_to_country}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Total</p>
                    <p className="text-lg font-semibold">
                      ${orderData.price_breakdown.total_payable}
                    </p>
                  </div>

                </div>
              </div>

              {/* PRODUCTS */}
              {orderData.order_details?.length > 0 && (
                <div className="bg-white border rounded-2xl p-6">
                  <h4 className="font-semibold mb-4">Products</h4>

                  {orderData.order_details.map((item: any) => (
                    <div key={item.id} className="flex justify-between border-b py-2">
                      <div>
                        <p>{item.product?.title}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right text-sm">
                        <p>${item.price}</p>
                        <p>{item.weight}g</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MY OFFER AGAINST SERVICES*/}
              {orderData?.my_offer?.services?.length ? (
                <div className="bg-white border rounded-2xl p-6">
                  <h4 className="font-semibold mb-4">My Offer</h4>

                  {orderData.my_offer.services.map((srv) => (
                    <div key={srv.id} className="flex justify-between py-2">
                      <span>{srv.title}</span>
                      <span>${srv.price}</span>
                    </div>
                  ))}

                  <div className="flex justify-between font-semibold mt-3">
                    <span>Total</span>
                    <span>${orderData.price_breakdown.services_total}</span>

                  </div>
                </div>
              ) : null}

              {/* PAYMENT */}
              <div className="bg-white border rounded-2xl p-6">
                <h4 className="font-semibold mb-4">Payment Breakdown</h4>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span>Products</span>
                    <span>${orderData.price_breakdown.initial_price}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Offer</span>
                    <span>${orderData.price_breakdown.offer_price}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Services</span>
                    <span>${orderData.price_breakdown.services_total}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Stripe Fee</span>
                    <span>{orderData.price_breakdown.stripe_fee}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>{orderData.price_breakdown.service_fee}%</span>
                  </div>

                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      ${orderData.price_breakdown.total_payable}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}