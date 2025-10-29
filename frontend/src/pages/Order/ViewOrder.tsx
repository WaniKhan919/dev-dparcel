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
  ship_from: string;
  ship_to: string;
  products: string; // comma-separated
  total_aprox_weight: string;
  total_price: string;
  weight_per_unit: string;
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
  }
  order_payment: {
    id: number;
    order_id: number;
    amount: string;
    status: string;
  }
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

  const openPayment = (record: Request) => {
    setSelectedOrder(record);
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
        <div className="flex flex-col">
          <span><strong>From:</strong> {record.ship_from}</span>
          <span><strong>To:</strong> {record.ship_to}</span>
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
    // {
    //   key: "actions",
    //   header: "Actions",
    //   render: (record: Request) => {
    //     const [open, setOpen] = useState(false);
    //     const buttonRef = useRef<HTMLButtonElement>(null);
    //     const dropdownRef = useRef<HTMLDivElement>(null);
    //     const [position, setPosition] = useState({ top: 0, left: 0 });

    //     const toggleDropdown = () => {
    //       if (buttonRef.current) {
    //         const rect = buttonRef.current.getBoundingClientRect();
    //         setPosition({
    //           top: rect.bottom + window.scrollY,
    //           left: rect.left + window.scrollX,
    //         });
    //       }
    //       setOpen((prev) => !prev);
    //     };

    //     useEffect(() => {
    //       const handleClickOutside = (e: MouseEvent) => {
    //         if (
    //           buttonRef.current &&
    //           !buttonRef.current.contains(e.target as Node) &&
    //           dropdownRef.current &&
    //           !dropdownRef.current.contains(e.target as Node)
    //         ) {
    //           setOpen(false);
    //         }
    //       };
    //       document.addEventListener("mousedown", handleClickOutside);
    //       return () => document.removeEventListener("mousedown", handleClickOutside);
    //     }, []);

    //     return (
    //       <>
    //         <button
    //           ref={buttonRef}
    //           type="button"
    //           onClick={toggleDropdown}
    //           className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
    //         >
    //           Actions
    //           <svg
    //             className="-mr-1 ml-2 h-5 w-5"
    //             xmlns="http://www.w3.org/2000/svg"
    //             viewBox="0 0 20 20"
    //             fill="currentColor"
    //           >
    //             <path
    //               fillRule="evenodd"
    //               d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //         </button>

    //         {open &&
    //           createPortal(
    //             <div
    //               ref={dropdownRef}
    //               style={{ top: position.top, left: position.left }}
    //               className="absolute mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    //             >
    //               <div className="py-1">
    //                 {/* Existing Actions */}
    //                 <button
    //                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
    //                   onClick={(e) => {
    //                     e.stopPropagation();
    //                     viewOrderDetails(record.id);
    //                     setOpen(false);
    //                   }}
    //                 >
    //                   View Detail
    //                 </button>
    //                 <button
    //                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
    //                   onClick={(e) => {
    //                     e.stopPropagation();
    //                     viewOffers(record);
    //                     setOpen(false);
    //                   }}
    //                 >
    //                   View Offers
    //                 </button>
    //                 {record?.accepted_offer?.status === "accepted" &&
    //                   !record?.order_payment && (
    //                     <button
    //                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
    //                       onClick={(e) => {
    //                         e.stopPropagation();
    //                         openPayment(record);
    //                         setOpen(false);
    //                       }}
    //                     >
    //                       Make Payment
    //                     </button>
    //                   )}

    //                 {/* New Actions */}
    //                 <button
    //                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
    //                   onClick={(e) => {
    //                     e.stopPropagation();
    //                     trackOrder(record);
    //                     setOpen(false);
    //                   }}
    //                 >
    //                   Track Order
    //                 </button>
    //                 {
    //                 record?.accepted_offer?.status === "accepted" &&
    //                   <button
    //                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
    //                     onClick={(e) => {
    //                       e.stopPropagation();
    //                       openMessage(record);
    //                       setOpen(false);
    //                     }}
    //                   >
    //                     Conversation
    //                   </button>
    //                 }
    //               </div>
    //             </div>,
    //             document.body
    //           )}
    //       </>
    //     );
    //   },
    // }
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
                shipperId={selectedOrder.accepted_offer.user_id}
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

