import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOffers } from "../../slices/shipperOffersSlice";
import ViewShopperOffersDrawer from "../../utils/Drawers/Offers/ViewShopperOffersDrawer";
import { useNavigate } from "react-router";
import {
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "../../components/ui/tooltip/Tooltip";
import ViewOrderDetailDrawer from "../../utils/Drawers/Offers/ViewOrderDetailDrawer";

interface Product {
  id: number;
  title: string;
  weight?: string;
  price: string;
  product_url?: string;
}
interface PriceBrakdown {
  order_price: number;
  offer_price: number;
  additional_total: number;
  total_offer_price?: number;
  total_payable_price?: number;
}

interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  weight?: string;
  request_details_number: string;
  status: string;
  product: Product;
}
interface OrderStatus {
  id: number;
  name: string;
}

interface LocationRef {
  id: number;
  name: string;
}

interface OrderPayment {
  id: number;
  order_id: number;
  amount: string;
  status: string;
}

interface Order {
  id: number;
  user_id: number;
  service_type: string;
  total_aprox_weight: string;
  total_price: string;
  tracking_number: string;
  request_number: string;
  tracking_link: string | null;
  status: number;
  order_status: OrderStatus;
  ship_from_country: LocationRef;
  ship_from_state: LocationRef;
  ship_from_city: LocationRef;
  ship_to_country: LocationRef;
  ship_to_state: LocationRef;
  ship_to_city: LocationRef;
  order_details: OrderDetail[];
  order_payment: OrderPayment;
}

interface Offer {
  id: number;
  order_id: number;
  user_id: number;
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "inprogress";
  offer_price: string;
  order: Order;
  price_breakdown: PriceBrakdown;
}

interface MappedRequest {
  id: number;
  service_type: string;
  total_aprox_weight: string;
  total_price: string;
  status: "pending" | "accepted" | "rejected" | "inprogress";
  request_number: string;
  order_details: OrderDetail[];
  order_status: OrderStatus;
  order: Order;
  price_breakdown: PriceBrakdown;
  order_payment: OrderPayment;
}

export const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Offer Placed": "bg-indigo-100 text-indigo-800",
  "Offer Accepted": "bg-green-100 text-green-800",
  "Payment Pending": "bg-orange-100 text-orange-800",
  Inprogress: "bg-blue-100 text-blue-800",
  Processed: "bg-purple-100 text-purple-800",
  Forwarded: "bg-cyan-100 text-cyan-800",
  Received: "bg-teal-100 text-teal-800",
  Completed: "bg-green-200 text-green-900",
};

export const STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  "Offer Placed": "Offer Placed",
  "Offer Accepted": "Offer Accepted",
  "Payment Pending": "Payment Pending",
  Inprogress: "In Progress",
  Processed: "Processed",
  Forwarded: "Forwarded",
  Received: "Received",
  Completed: "Completed",
};

const formatLocation = (
  country?: LocationRef,
  state?: LocationRef,
  city?: LocationRef
): string => {
  return [country?.name, state?.name, city?.name]
    .filter(Boolean)
    .join(", ") || "-";
};

const formatServiceType = (type: string): string => {
  const map: Record<string, string> = {
    ship_for_me: "Ship For Me",
    buy_for_me: "Buy For Me",
    shop_for_me: "Shop For Me",
  };
  return map[type] ?? type;
};


export default function ShopperRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.shipperOffers
  );

  const [openOfferDrawer, setOpenOfferDrawer] = useState(false);
  const [openOrderDetailDrawer, setOpenOrderDetailDrawer] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState<MappedRequest | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchOffers({ page: 1, per_page: 10 }));
  }, [dispatch]);


  const requests: MappedRequest[] = useMemo(() => {
    if (!data?.length) return [];

    return data.map((offer: Offer) => ({
      id: offer.order_id,
      service_type: offer.order?.service_type ?? "",
      total_aprox_weight: offer.order?.total_aprox_weight ?? "",
      total_price: offer.order?.total_price ?? "",
      status: offer.status,
      request_number: offer.order?.request_number ?? "-",
      order_status: offer.order?.order_status ?? [],
      order_details: offer.order?.order_details ?? [],
      order: offer.order,
      price_breakdown: offer.price_breakdown,
      order_payment: offer.order.order_payment,
    }));
  }, [data]);


  const handleViewDetails = useCallback((id: number) => {
    setSelectedOrderId(id);
    setOpenOrderDetailDrawer(true);
  }, []);

  const handleViewOffers = useCallback((record: MappedRequest) => {
    setSelectedOrderData(record);
    setOpenOfferDrawer(true);
  }, []);

  const handleManageOrder = useCallback(
    (order_id: number) => {
      navigate("/shipper/manage-request", { state: { orderId: order_id } });
    },
    [navigate]
  );

  const handleCustomDeclaration = useCallback(
    (id: number) => {
      navigate("/custom-declaration", { state: { order_id: id } });
    },
    [navigate]
  );

  const handleMessage = useCallback(
    (orderId: number) => {
      navigate("/shipper/messages", { state: { orderId } });
    },
    [navigate]
  );

  const closeOfferDrawer = useCallback(() => setOpenOfferDrawer(false), []);
  const closeOrderDetailDrawer = useCallback(() => setOpenOrderDetailDrawer(false), []);

  const columns = useMemo(
    () => [
      {
        key: "request_number",
        header: "Request #",
        render: (record: MappedRequest) => (
          <span className="text-xs font-mono text-gray-600">
            {record.request_number}
          </span>
        ),
      },
      {
        key: "service_type",
        header: "Ship Type",
        render: (record: MappedRequest) => (
          <span className="font-medium text-sm">
            {formatServiceType(record.service_type)}
          </span>
        ),
      },
      {
        key: "ship_from_to",
        header: "Ship From / To",
        render: (record: MappedRequest) => (
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold text-gray-700">From: </span>
              {formatLocation(
                record.order?.ship_from_country,
                record.order?.ship_from_state,
                record.order?.ship_from_city
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-700">To: </span>
              {formatLocation(
                record.order?.ship_to_country,
                record.order?.ship_to_state,
                record.order?.ship_to_city
              )}
            </div>
          </div>
        ),
      },
      {
        key: "total_price",
        header: "Price",
        render: (record: MappedRequest) => {
          const pb = record.price_breakdown;

          return (
            <div className="text-xs space-y-1">
              {/* Order Price */}
              <div className="flex justify-between">
                <span className="text-gray-500">Order:</span>
                <span className="font-medium text-gray-700">
                  ${pb?.order_price ?? 0}
                </span>
              </div>

              {/* Offer Price */}
              <div className="flex justify-between">
                <span className="text-gray-500">Offer:</span>
                <span className="font-medium text-blue-700">
                  ${pb?.total_offer_price ?? 0}
                </span>
              </div>

              {/* Payable */}
              <div className="flex justify-between border-t pt-1">
                <span className="text-gray-600 font-semibold">Payable:</span>
                <span className="font-bold text-green-700">
                  ${pb?.total_payable_price ?? 0}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (record: MappedRequest) => {

          const isOfferAccepted = record.order?.status === 3;

          return (

            <div className="flex flex-col gap-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${STATUS_STYLES[record.order?.order_status?.name] ?? "bg-gray-100 text-gray-700"
                  }`}
              >
                {STATUS_LABELS[record.order?.order_status?.name] ?? record.order?.order_status?.name}
              </span>
              {isOfferAccepted && !record.order_payment && (
                <span className="text-[11px] text-orange-600 font-medium flex items-center gap-1">
                  ⚠ Payment Pending
                </span>
              )}

              {/* Optional: Paid State */}
              {record.order_payment && (
                <span className="text-[11px] text-green-600 font-medium">
                  ✓ Payment Completed
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (record: MappedRequest) => (
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Details */}
            <Tooltip text="View Details">
              <button
                onClick={() => handleViewDetails(record.id)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="View order details"
              >
                <EyeIcon className="h-5 w-5 text-gray-700" />
              </button>
            </Tooltip>

            {/* View Offers */}
            {/* <Tooltip text="View Offers">
              <button
                onClick={() => handleViewOffers(record)}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                aria-label="View offers"
              >
                <Squares2X2Icon className="h-5 w-5 text-blue-700" />
              </button>
            </Tooltip> */}

            {/* Accepted-only actions */}
            {record.status === "accepted" && (
              <>
                <Tooltip text="Manage Order">
                  <button
                    onClick={() => handleManageOrder(record.id)}
                    className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                    aria-label="Manage order"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-green-700" />
                  </button>
                </Tooltip>

                {record.order?.id && (
                  <Tooltip text="Custom Declaration">
                    <button
                      onClick={() => handleCustomDeclaration(record.order.id)}
                      className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                      aria-label="Custom declaration"
                    >
                      <DocumentTextIcon className="h-5 w-5 text-purple-700" />
                    </button>
                  </Tooltip>
                )}

                <Tooltip text="Message">
                  <button
                    onClick={() => handleMessage(record.id)}
                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    aria-label="Message"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-700" />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        ),
      },
    ],
    [
      handleViewDetails,
      handleViewOffers,
      handleManageOrder,
      handleCustomDeclaration,
      handleMessage,
    ]
  );

  return (
    <>
      <PageMeta title="Delivering Parcel | View Requests" description="" />
      <PageBreadcrumb pageTitle="View Requests" />

      <div className="space-y-6">
        <ComponentCard title="View Requests">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-10 text-red-500">
              <p className="font-medium">Something went wrong.</p>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && requests.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No requests found</p>
              <p className="text-sm mt-1">You have no offers assigned yet.</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && requests.length > 0 && (
            <DParcelTable columns={columns} data={requests} />
          )}

          {/* Drawers */}
          {openOrderDetailDrawer && selectedOrderId !== null && (
            <ViewOrderDetailDrawer
              isOpen={openOrderDetailDrawer}
              onClose={closeOrderDetailDrawer}
              orderId={selectedOrderId}
            />
          )}

          {/* {openOfferDrawer && selectedOrderData !== null && (
            <ViewShopperOffersDrawer
              isOpen={openOfferDrawer}
              onClose={closeOfferDrawer}
              orderData={selectedOrderData}
            />
          )} */}
        </ComponentCard>
      </div>
    </>
  );
}