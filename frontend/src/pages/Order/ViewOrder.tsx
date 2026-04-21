import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOrders } from "../../slices/orderSlice";
import ViewOffersDrawer from "../../utils/Drawers/Offers/ViewOffersDrawer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentModal from "../../utils/PaymentModal";
import TrackOrderDrawer from "../../utils/Drawers/Order/TrackOrderDrawer";
import ViewOrderDetailDrawer from "../../utils/Drawers/Offers/ViewOrderDetailDrawer";
import { useNavigate } from "react-router";
import {
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EyeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "../../components/ui/tooltip/Tooltip";

// Stripe 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY!);

// Types 

interface LocationRef {
  country: string;
  state: string;
  city: string;
}

interface Product {
  id: number;
  title: string;
  description: string | null;
  product_url: string;
  quantity: number;
  price: string;
  weight: string;
}

interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  weight: string;
  request_details_number: string;
  status: string;
  product: Product;
}

interface AcceptedOffer {
  id: number;
  order_id: number;
  user_id: number;
  status: string;
}

interface OrderPayment {
  id: number;
  order_id: number;
  amount: string;
  status: string;
}

interface OrderStatus {
  id: number;
  name: string;
  description: string | null;
}

interface Order {
  id: string;
  user_id: number;
  service_type: string;
  total_aprox_weight: string;
  total_price: string;
  tracking_number: string;
  request_number: string;
  tracking_link: string | null;
  status: number;
  order_details: OrderDetail[];
  accepted_offer: AcceptedOffer | null;
  order_payment: OrderPayment | null;
  status_title: string;
  ship_from: LocationRef;
  ship_to: LocationRef;
  shipping_type?: {
    id: number;
    title: string;
    slug: string;
  };
  price_breakdown?: {
    initial_price: number;
    offer_price: number;
    stripe_fee: number;
    service_fee: number;
    grand_total: number;
    selected_services: number;
    additional_services: number;
    total_payable: number;
  };
}

// Status Config 

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Offer Placed": "bg-blue-100 text-blue-800",
  "Offer Accepted": "bg-green-100 text-green-800",
  "Payment Pending": "bg-orange-100 text-orange-800",
  Inprogress: "bg-purple-100 text-purple-800",
  Processed: "bg-indigo-100 text-indigo-800",
  Forwarded: "bg-cyan-100 text-cyan-800",
  Received: "bg-teal-100 text-teal-800",
  Completed: "bg-green-200 text-green-900",
};

// Helpers ─

const formatServiceType = (type: string): string => {
  const map: Record<string, string> = {
    ship_for_me: "Ship For Me",
    buy_for_me: "Buy For Me",
    shop_for_me: "Shop For Me",
  };
  return map[type] ?? type;
};

// Component 

export default function ViewOrder() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error, meta } = useSelector(
    (state: RootState) => state.order
  );

  // Drawer / Modal State 

  const [openOrderDetailDrawer, setOpenOrderDetailDrawer] = useState(false);
  const [openOfferDrawer, setOpenOfferDrawer] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Initial Fetch 

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, per_page: 12 }));
  }, [dispatch]);

  // Handlers 

  const handleViewDetails = useCallback((id: string) => {
    setSelectedOrderId(id);
    setOpenOrderDetailDrawer(true);
  }, []);

  const handleViewOffers = useCallback((record: Order) => {
    setSelectedOrder(record);
    setOpenOfferDrawer(true);
  }, []);

  const handleOpenPayment = useCallback((record: Order) => {
    setSelectedOrder(record);
    setIsPaymentOpen(true);
  }, []);

  const handleTrackOrder = useCallback(
    (order_id: string) => {
      navigate("/shopper/track/order", { state: { orderId: order_id } });
    },
    [navigate]
  );

  const handleMessage = useCallback(
    (orderId: string) => {
      navigate("/shopper/messages", { state: { orderId } });
    },
    [navigate]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(fetchOrders({ page, per_page: 12 }));
    },
    [dispatch]
  );

  const closeOrderDetailDrawer = useCallback(
    () => setOpenOrderDetailDrawer(false),
    []
  );
  const closeOfferDrawer = useCallback(() => setOpenOfferDrawer(false), []);

  // Columns ─

  const columns = useMemo(
    () => [
      {
        key: "request_number",
        header: "Request #",
        render: (record: Order) => (
          <span className="text-xs font-mono text-gray-600">
            {record.request_number}
          </span>
        ),
      },
      {
        key: "service_type",
        header: "Ship Type",
        render: (record: Order) => (
          <span className="text-sm font-medium">
            {record.shipping_type?.title ?? "-"}
          </span>
        ),
      },
      {
        key: "ship_from",
        header: "Ship From / To",
        render: (record: Order) => (
          <div className="flex flex-col text-sm space-y-1">
            <span>
              <b className="text-blue-600">From: </b>
              {`${record.ship_from.city}, ${record.ship_from.state}, ${record.ship_from.country}`}
            </span>
            <span>
              <b className="text-green-600">To: </b>
              {`${record.ship_to.city}, ${record.ship_to.state}, ${record.ship_to.country}`}
            </span>
          </div>
        ),
      },
      {
        key: "price",
        header: "Price",
        render: (record: Order) => {
          const breakdown = record.price_breakdown;
          const isShipForMe = record.shipping_type?.slug === "ship_for_me";

          return (
            <Tooltip
              text={
                breakdown
                  ? `Initial: $${breakdown.initial_price}\nOffer: $${breakdown.offer_price}\nStripe Fee: $${breakdown.stripe_fee}\nService Fee: $${breakdown.service_fee}\nGrand Total: $${breakdown.grand_total}`
                  : "Price details"
              }
            >
              <div className="text-sm space-y-1 cursor-pointer">

                {/* Initial Price — only Buy For Me */}
                {!isShipForMe && breakdown && (
                  <div className="text-gray-500 text-xs">
                    Products: ${breakdown.initial_price}
                  </div>
                )}

                {/* Fees — sirf tab show karo jab grand_total > 0 */}
                {breakdown && breakdown.grand_total > 0 && (
                  <>
                    <div className="text-orange-500 text-xs">
                      Stripe Fee: ${breakdown.stripe_fee}
                    </div>
                    <div className="text-orange-500 text-xs">
                      Service Fee: ${breakdown.service_fee}
                    </div>
                  </>
                )}

                {/* Grand Total */}
                <div className="text-black-500 text-xs">
                  Grand Total: ${breakdown?.grand_total}
                </div>
                

                {/* Offer Price — agar accepted offer hai */}
                {breakdown && breakdown.offer_price > 0 && (
                  <div className="text-blue-600 text-xs">
                    Shipper Offer: ${breakdown.offer_price}
                  </div>
                )}
                {
                  breakdown && breakdown.selected_services >0 &&
                  <div className="text-orange-500 text-xs">
                    Selected Services: ${breakdown?.selected_services}
                  </div>
                }
                {
                  breakdown && breakdown.additional_services >0 &&
                  <div className="text-orange-500 text-xs">
                    Aditional Services: ${breakdown?.additional_services}
                  </div>
                }
                {
                  breakdown && breakdown.total_payable > 0 &&
                  <div className="font-bold text-green-700 text-base">
                    Total Payable: ${breakdown?.total_payable}
                  </div>
                }

              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (record: Order) => {
          const statusName = record.status_title ?? "pending";

          const colorClass =
            STATUS_COLORS[statusName] ?? "bg-gray-100 text-gray-800";

          const isOfferAccepted = record.status === 3 || statusName === "offer accepted";

          return (
            <div className="flex flex-col gap-1">

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${colorClass}`}
              >
                {record.status_title ?? "Pending"}
              </span>

              {/* Payment Pending Hint */}
              {isOfferAccepted && !record.order_payment && (
                <span className="text-[11px] text-orange-600 font-medium flex items-center gap-1">
                  ⚠ Payment Pending – Next step required
                </span>
              )}

              {/* Optional: Paid State */}
              {record.order_payment && (
                <span className="text-[11px] text-green-600 font-medium">
                  ✓ Payment Completed
                </span>
              )}

            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (record: Order) => (
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Details */}
            <Tooltip text="View Details">
              <button
                onClick={() => handleViewDetails(record.id)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="View details"
              >
                <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
              </button>
            </Tooltip>

            {/* View Offers */}
            <Tooltip text="View Offers">
              <button
                onClick={() => handleViewOffers(record)}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                aria-label="View offers"
              >
                <DocumentTextIcon className="h-5 w-5 text-blue-700" />
              </button>
            </Tooltip>

            {/* Track Order */}
            <Tooltip text="Track Order">
              <button
                onClick={() => handleTrackOrder(record.id)}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                aria-label="Track order"
              >
                <MapPinIcon className="h-5 w-5 text-purple-700" />
              </button>
            </Tooltip>

            {/* Payment — only if offer accepted but payment not done */}
            {record.accepted_offer && !record.order_payment && (
              <Tooltip text="Make Payment">
                <button
                  onClick={() => handleOpenPayment(record)}
                  className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                  aria-label="Make payment"
                >
                  <CreditCardIcon className="h-5 w-5 text-green-700" />
                </button>
              </Tooltip>
            )}

            {/* Messages — only if offer accepted */}
            {record.accepted_offer && (
              <Tooltip text="Messages">
                <button
                  onClick={() => handleMessage(record.id)}
                  className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  aria-label="Messages"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-700" />
                </button>
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    [
      handleViewDetails,
      handleViewOffers,
      handleTrackOrder,
      handleOpenPayment,
      handleMessage,
    ]
  );

  // Render 

  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />

      <div className="space-y-6">
        <ComponentCard title="Requests">

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-red-500 font-medium">Something went wrong.</p>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && data?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm mt-1">You haven't placed any orders yet.</p>
            </div>
          )}

          {/* Table */}
          <DParcelTable
            columns={columns}
            data={data ?? []}
            loading={loading}
            rowsPerPage={12}
            meta={meta}
            onPageChange={handlePageChange}
          />

          {/* Order Detail Drawer */}
          {openOrderDetailDrawer && selectedOrderId !== null && (
            <ViewOrderDetailDrawer
              isOpen={openOrderDetailDrawer}
              onClose={closeOrderDetailDrawer}
              orderId={selectedOrderId}
            />
          )}

          {/* View Offers Drawer */}
          {openOfferDrawer && selectedOrder !== null && (
            <ViewOffersDrawer
              isOpen={openOfferDrawer}
              onClose={closeOfferDrawer}
              orderData={selectedOrder}
            />
          )}

          {/* Payment Modal */}
          {isPaymentOpen && selectedOrder && (
            <Elements stripe={stripePromise}>
              <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                orderId={selectedOrder.id}
                shipperId={selectedOrder.accepted_offer?.user_id ?? 0}
                amount={
                  selectedOrder.price_breakdown?.total_payable
                    ? parseFloat(String(selectedOrder.price_breakdown.total_payable))
                    : parseFloat(String(selectedOrder.price_breakdown?.grand_total))
                }
              />
            </Elements>
          )}
        </ComponentCard>
      </div>
    </>
  );
}