import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOffers } from "../../slices/shipperOffersSlice";
import { createPortal } from "react-dom";
import ViewShopperOffersDrawer from "../../utils/Drawers/Offers/ViewShopperOffersDrawer";
import ManageOrderTrackingDrawer from "../../utils/Drawers/Order/ManageOrderTrackingDrawer";
import OrderMessages from "../../utils/Drawers/Order/OrderMessages";
import { useNavigate } from "react-router";

interface Request {
  id: number;
  service_type: string;
  ship_from: string;
  ship_to: string;
  total_aprox_weight: string;
  total_price: string;
  status: string;
  request_number: string;
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
}

export default function ShopperRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data, meta, loading } = useSelector((state: any) => state.shipperOffers);
  const [openOfferDrawer, setOpenOfferDrawer] = useState(false)
  const [openManageOfferDrawer, setOpenManageOfferDrawer] = useState(false)
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false)
  const [orderData, setOrderData] = useState([])
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });


  useEffect(() => {
    dispatch(fetchOffers({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const requests: Request[] = useMemo(() => {
    return data.map((offer: any) => ({
      id: offer.order_id,
      service_type: offer.order?.service_type ?? "",
      ship_from: offer.order
        ? `${offer.order.ship_from_country?.name ?? ""}, ${offer.order.ship_from_state?.name ?? ""}, ${offer.order.ship_from_city?.name ?? ""}`
        : "",
      ship_to: offer.order
        ? `${offer.order.ship_to_country?.name ?? ""}, ${offer.order.ship_to_state?.name ?? ""}, ${offer.order.ship_to_city?.name ?? ""}`
        : "",
      total_aprox_weight: offer.order?.total_aprox_weight ?? "",
      total_price: offer.order?.total_price ?? "",
      status: offer.status,
      request_number:offer.order?.request_number,
      order_details: offer.order?.order_details ?? [],
      order: offer.order
    }));
  }, [data]);

  const handleCustomDecleration = (id: number) => {
    navigate("/custom-declaration", {
      state: { order_id: id },
    });
  }

  const columns = [
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: Request) =>
      (
        <>
        <span>{record.service_type === "ship_for_me" ? "Ship For Me" : "Shop For Me"}</span>
        <br />
        <span>{record.request_number}</span>
        </>
      )
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
      key: "status",
      header: "Status",
      render: (record: Request) => {
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          inprogress: "bg-blue-100 text-blue-800",
          accepted: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
          cancelled: "bg-gray-200 text-gray-800",
          ignored: "bg-purple-100 text-purple-800",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[record.status] || "bg-gray-100 text-gray-800"
              }`}
          >
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: Request) => {
        const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
          setOpenDropdownId(openDropdownId === record.id ? null : record.id);
        };

        return (
          <>
            <button
              type="button"
              onClick={toggleDropdown}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Actions
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {openDropdownId === record.id &&
              createPortal(
                <div
                  style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                  className="absolute mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="py-1">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewOffers(record);
                        setOpenDropdownId(null);
                      }}
                    >
                      View Offers
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        manageOrder(record);
                        setOpenDropdownId(null);
                      }}
                    >
                      Manage Order
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={(e) => {
                        handleCustomDecleration(record.order_details[0].id)
                      }}
                    >
                      Custom Decleraion
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </>
        );
      },
    },
    {
      key: "message",
      header: "Message",
      render: (record: Request) =>
        record.status === "accepted" ? (
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
            onClick={() =>
              navigate("/shipper/messages", { state: { orderId: record.id } })
            }
          >
            Message
          </button>
        ) : null,
    }

  ];


  const viewOffers = (record: any) => {
    setOrderData(record)
    setOpenOfferDrawer(true)
  }
  const manageOrder = (record: any) => {
    setOrderData(record)
    setOpenManageOfferDrawer(true)
  }
  const openMessage = (record: any) => {
    setOrderData(record)
    setOpenMessageDrawer(true)
  }
  const onClose = () => {
    setOpenOfferDrawer(false)
    setOpenMessageDrawer(false)
    setOpenManageOfferDrawer(false)
  }

  return (
    <>
      <PageMeta title="Delivering Parcel | View Requests" description="" />
      <PageBreadcrumb pageTitle="View Requests" />
      <div className="space-y-6">
        <ComponentCard title="View Requests">
          <DParcelTable columns={columns} data={requests} />
          {
            openOfferDrawer &&
            <ViewShopperOffersDrawer
              isOpen={openOfferDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }
          {
            openManageOfferDrawer &&
            <ManageOrderTrackingDrawer
              isOpen={openManageOfferDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }
          {
            openMessageDrawer &&
            <OrderMessages
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
