import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOrders } from "../../slices/orderSlice";
import { createPortal } from "react-dom";
import ViewOffersDrawer from "../../utils/Drawers/Offers/ViewOffersDrawer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentModal from "../../utils/PaymentModal";
import ShopperOrderMessages from "../../utils/Drawers/Order/ShopperOrderMessages";
import TrackOrderDrawer from "../../utils/Drawers/Order/TrackOrderDrawer";
import ViewOrderDetailDrawer from "../../utils/Drawers/Offers/ViewOrderDetailDrawer";
import ShopperTableAction from "../../components/tables/ShopperTableAction";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY!);

interface Request {
  id: number;
  service_type: string;
  total_aprox_weight: string;
  total_price: string;
  tracking_number: string;
  order_details: {
    id: number;
    quantity: number;
    price: string;
    product: {
      id: number;
      title: string;
      weight?: string;
    };
  }[];
  accepted_offer: {
    id: number;
    order_id: number;
    user_id: number;
    status: string;
  } | null;
  order_payment: {
    id: number;
    order_id: number;
    amount: string;
    status: string;
  } | null;

  // New relationships
  ship_from_country?: { id: number; name: string };
  ship_from_state?: { id: number; name: string };
  ship_from_city?: { id: number; name: string };
  ship_to_country?: { id: number; name: string };
  ship_to_state?: { id: number; name: string };
  ship_to_city?: { id: number; name: string };
}


export default function ViewOrder() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, meta, loading } = useSelector((state: any) => state.order);
  const [openOrderDetailDrawer, setOpenOrderDetailDrawer] = useState(false)
  const [openOfferDrawer, setOpenOfferDrawer] = useState(false)
  const [orderData, setOrderData] = useState([])
  const [orderId, setOrderId] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Request | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false)
  const [openTrackOrderDrawer, setOpenTrackOrderDrawer] = useState(false)
  const [shipperId, setShipperId] = useState(0)

  const openPayment = (record: Request) => {
    setSelectedOrder(record);
    setShipperId(record.accepted_offer?.user_id ?? 0);
    setIsPaymentOpen(true);
  };

  const openMessage = (record: any) => {
    setOrderData(record)
    setOpenMessageDrawer(true)
  }

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const viewOrderDetails = (id: number) => {
    setOrderId(id)
    setOpenOrderDetailDrawer(true)
  }
  const viewOffers = (record: any) => {
    setOrderData(record)
    setOpenOfferDrawer(true)
  }
  const trackOrder = (record: any) => {
    setOrderData(record)
    setOpenTrackOrderDrawer(true)
  }
  const onClose = () => {
    setOpenOfferDrawer(false)
    setOpenOrderDetailDrawer(false)
    setOpenMessageDrawer(false)
    setOpenTrackOrderDrawer(false)
  }

  const columns = [
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: Request) => {
        return record.service_type == "ship_for_me"
          ? "Ship For Me"
          : "Buy For Me";
      },
    },
    {
      key: "ship_from",
      header: "Ship From/To",
      render: (record: Request) => (
        <div className="flex flex-col text-gray-700">
          <div className="font-medium">
            <span className="text-blue-600">From:</span>{" "}
            {record.ship_from_city?.name
              ? `${record.ship_from_city.name}, ${record.ship_from_state?.name}, ${record.ship_from_country?.name}`
              : "-"}
          </div>
          <div className="font-medium">
            <span className="text-green-600">To:</span>{" "}
            {record.ship_to_city?.name
              ? `${record.ship_to_city.name}, ${record.ship_to_state?.name}, ${record.ship_to_country?.name}`
              : "-"}
          </div>
        </div>
      ),

    },
    {
      key: "products",
      header: "Products",
      render: (record: Request) => (
        <div className="flex flex-col gap-1">
          {record.order_details?.map((detail) => (
            <span key={detail.id} className="text-gray-700">
              {detail.product?.title} (x{detail.quantity})
            </span>
          ))}
        </div>
      ),
    },
    { key: "total_aprox_weight", header: "Approx Weight (g)" },
    { key: "total_price", header: "Total Price" },
    {
      key: "weight_per_unit",
      header: "Weight Per Unit (Gram)",
      render: (record: Request) => (
        <div className="flex flex-col gap-1">
          {record.order_details?.map((detail) => (
            <span key={detail.id}>
              {detail.product?.title}: {detail.product?.weight ?? "N/A"} g
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "payment_status",
      header: "Payment Status",
      render: (record: Request) => {
        const status = record?.order_payment?.status;

        const statusColors: Record<string, string> = {
          captured: "bg-green-100 text-green-800",
          succeeded: "bg-green-100 text-green-800",
          processing: "bg-yellow-100 text-yellow-800",
          requires_action: "bg-blue-100 text-blue-800",
          requires_capture: "bg-orange-100 text-orange-800",
          failed: "bg-red-100 text-red-800",
          canceled: "bg-gray-200 text-gray-800",
        };

        const colorClass = status ? statusColors[status] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 text-m font-medium rounded-full ${colorClass}`}
          >
            {status || "-"}
          </span>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: Request) => (
        <ShopperTableAction
          record={record}
          viewOrderDetails={viewOrderDetails}
          viewOffers={viewOffers}
          openPayment={openPayment}
          trackOrder={trackOrder}
          openMessage={openMessage}
        />
      ),
    }


  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />
      <div className="space-y-6">
        <ComponentCard title="Requests">
          <DParcelTable columns={columns} data={data} />
          {
            openOrderDetailDrawer &&
            <ViewOrderDetailDrawer
              isOpen={openOrderDetailDrawer}
              onClose={onClose}
              orderId={orderId}
            />
          }
          {
            openOfferDrawer &&
            <ViewOffersDrawer
              isOpen={openOfferDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }
          {isPaymentOpen && selectedOrder && (
            <Elements stripe={stripePromise}>
              <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                orderId={selectedOrder.id}
                shipperId={shipperId}
                amount={parseFloat(selectedOrder.total_price)}
              />
            </Elements>
          )}

          {
            openTrackOrderDrawer &&
            <TrackOrderDrawer
              isOpen={openTrackOrderDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }
          {
            openMessageDrawer &&
            <ShopperOrderMessages
              isOpen={openMessageDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }

        </ComponentCard>
      </div>
    </>
  );
}

