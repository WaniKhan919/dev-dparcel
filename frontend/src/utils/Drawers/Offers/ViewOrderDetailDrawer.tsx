import useOrderDetail from "../../../hooks/useOrderDetail";

interface ViewOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function ViewOrderDetailDrawer({
  isOpen,
  onClose,
  orderId,
}: ViewOrderDetailDrawerProps) {
  const { order: orderData, loading, error } = useOrderDetail(orderId);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative bg-white shadow-xl h-full w-full sm:w-5/6 md:w-2/3 lg:w-1/2 rounded-l-2xl transition-transform duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">

          {/* Left Title */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Order Details
            </h2>

            {/* Step Indicator */}
            {
              orderData &&
              <div className="mt-1">
                {orderData.status == 3 ? (
                  <p className="text-sm text-orange-600 font-medium">
                    ⚠ Payment Pending — Next step: Complete Payment
                  </p>
                ) : orderData.status > 4 ? (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Payment Completed — Order in {orderData.status_title}
                  </p>
                ) : ''}
              </div>
            }
          </div>

          {/* Close Button */}
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
                    {orderData.status_title}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm mt-6">

                  <div>
                    <p className="opacity-80 text-xs">Service Type</p>
                    <p className="capitalize font-medium">
                      {orderData.service_type?.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Ship From</p>
                    <p>
                      {orderData.ship_from?.city},{" "}
                      {orderData.ship_from?.state},{" "}
                      {orderData.ship_from?.country}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Ship To</p>
                    <p>
                      {orderData.ship_to?.city},{" "}
                      {orderData.ship_to?.state},{" "}
                      {orderData.ship_to?.country}
                    </p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Weight</p>
                    <p>{orderData.total_aprox_weight} g</p>
                  </div>

                  <div>
                    <p className="opacity-80 text-xs">Total Price</p>
                    <p className="font-semibold text-lg">
                      ${orderData.price_breakdown?.grand_total}
                    </p>
                  </div>

                </div>
              </div>

              {/* ================= PRODUCT DETAILS ================= */}
              {orderData.products?.length > 0 && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-5 text-gray-800">
                    Product Details
                  </h4>

                  <div className="space-y-5">
                    {orderData.products.map((detail: any) => {

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

                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                              {initials}
                            </div>

                            <div className="flex-1">
                              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                #{detail.product_request_number}
                              </span>

                              <p className="font-medium text-gray-800 mt-1">
                                {title}
                              </p>

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

              {/* ================= SERVICES ================= */}
              {orderData.services?.length > 0 && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-5 text-gray-800">
                    Selected Services
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {orderData.services.map((srv: any) => (
                      <div
                        key={srv.service_id}
                        className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-3 hover:shadow transition"
                      >
                        <span className="font-medium text-gray-700">
                          {srv.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= PAYMENT BREAKDOWN ================= */}
              {orderData.price_breakdown && (
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-5 text-gray-800">
                    Payment Breakdown
                  </h4>

                  <div className="space-y-3 text-sm">

                    {/* Initial Price — Buy For Me only */}
                    {orderData.shipping_type?.slug === "buy_for_me" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Products Subtotal</span>
                        <span className="font-medium">
                          ${orderData.price_breakdown.initial_price}
                        </span>
                      </div>
                    )}

                    {/* Shipper Offer Price — agar offer accepted hai */}
                    {orderData.price_breakdown.offer_price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipper Offer</span>
                        <span className="font-medium">
                          ${orderData.price_breakdown.offer_price}
                        </span>
                      </div>
                    )}

                    <div className="border-t my-2"></div>

                    {/* Stripe Fee */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stripe Fee (4.2%)</span>
                      <span className="font-medium text-orange-500">
                        ${orderData.price_breakdown.stripe_fee}
                      </span>
                    </div>

                    {/* Service Fee */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee (10%)</span>
                      <span className="font-medium text-orange-500">
                        ${orderData.price_breakdown.service_fee}
                      </span>
                    </div>

                    {orderData.price_breakdown.selected_services > 0 &&
                    <>
                      <div className="border-t my-3"></div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selected Service Fee</span>
                        <span className="font-medium text-orange-500">
                          ${orderData.price_breakdown.selected_services}
                        </span>
                      </div>
                    </>
                    
                    }
                    {orderData.price_breakdown.additional_services > 0 &&
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aditional Service Fee</span>
                        <span className="font-medium text-orange-500">
                          ${orderData.price_breakdown.additional_services}
                        </span>
                      </div>
                    </>
                    }

                    <div className="border-t my-3"></div>

                    {/* Grand Total */}
                    <div className="flex justify-between items-center text-base font-semibold">
                      <span>Total Payable</span>
                      <span className="text-green-600 text-lg">
                        ${orderData.price_breakdown.total_payable > 0 ? orderData.price_breakdown.total_payable: orderData.price_breakdown.grand_total}
                      </span>
                    </div>

                  </div>
                </div>
              )}
              {orderData.acceptedOffer?.additional_prices?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {orderData.acceptedOffer.additional_prices.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs text-gray-500"
                    >
                      <span>{item.title}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}