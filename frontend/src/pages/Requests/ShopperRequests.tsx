import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOffers } from "../../slices/shipperOffersSlice";
import ViewShopperOffersDrawer from "../../utils/Drawers/Offers/ViewShopperOffersDrawer";
import ManageOrderTrackingDrawer from "../../utils/Drawers/Order/ManageOrderTrackingDrawer";
import OrderMessages from "../../utils/Drawers/Order/OrderMessages";
import { useNavigate } from "react-router";
import { ChatBubbleLeftRightIcon, Cog6ToothIcon, DocumentTextIcon, Squares2X2Icon,EyeIcon } from "@heroicons/react/24/outline";
import Tooltip from "../../components/ui/tooltip/Tooltip";
import { Modal } from "../../components/ui/modal";
import ViewOrderDetailDrawer from "../../utils/Drawers/Offers/ViewOrderDetailDrawer";

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
  const { data} = useSelector((state: any) => state.shipperOffers);
  const [openOfferDrawer, setOpenOfferDrawer] = useState(false)
  const [openManageOfferDrawer, setOpenManageOfferDrawer] = useState(false)
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false)
  const [orderData, setOrderData] = useState([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [openOrderDetailDrawer, setOpenOrderDetailDrawer] = useState(false)
  const [orderId, setOrderId] = useState(0)

  useEffect(() => {
    dispatch(fetchOffers({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const requests: Request[] = useMemo(() => {
    if (!data || data.length === 0) return [];

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
      request_number: offer.order?.request_number,
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
      key: "request_number",
      header: "Request #",
      render: (record: any) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {record.request_number}
          </span>
        </div>
      ),
    },
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: any) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {record.service_type === "ship_for_me"
              ? "Ship For Me"
              : "Shop For Me"}
          </span>
        </div>
      ),
    },
    {
      key: "ship_from_to",
      header: "Ship From / To",
      render: (record: any) => (
        <div className="text-sm">
          <div>
            <strong>From:</strong>{" "}
            {record.order?.ship_from_country?.name ?? "-"},{" "}
            {record.order?.ship_from_state?.name ?? "-"},{" "}
            {record.order?.ship_from_city?.name ?? "-"}
          </div>
          <div>
            <strong>To:</strong>{" "}
            {record.order?.ship_to_country?.name ?? "-"},{" "}
            {record.order?.ship_to_state?.name ?? "-"},{" "}
            {record.order?.ship_to_city?.name ?? "-"}
          </div>
        </div>

      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record: any) => {
        const colors: any = {
          pending: "bg-yellow-100 text-yellow-800",
          inprogress: "bg-blue-100 text-blue-800",
          accepted: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${colors[record.status]}`}
          >
            {record.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: any) => (
        <div className="flex items-center gap-2">

          {/* View Details Modal */}
          <Tooltip text="View Details">
            <button
              onClick={() => viewOrderDetails(record.id)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <EyeIcon className="h-5 w-5 text-gray-700" />
            </button>
          </Tooltip>

          {/* View Offers */}
          <Tooltip text="View Offers">
            <button
              onClick={() => viewOffers(record)}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              <Squares2X2Icon className="h-5 w-5 text-blue-700" />
            </button>
          </Tooltip>


          {/* Manage Order */}
          {record.status === "accepted" &&
            <Tooltip text="Manage Order">
              <button
                onClick={() => manageOrder(record.id)}
                className="p-2 rounded-lg bg-green-50 hover:bg-green-100"
              >
                <Cog6ToothIcon className="h-5 w-5 text-green-700" />
              </button>
            </Tooltip>
          }

          {/* Custom Declaration */}
          {record.status === "accepted" && record.order?.id && (
            <Tooltip text="Custom Declaration">
              <button
                onClick={() => handleCustomDecleration(record.order.id)}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100"
              >
                <DocumentTextIcon className="h-5 w-5 text-purple-700" />
              </button>
            </Tooltip>
          )}

          {/* Message (if accepted) */}
          {record.status === "accepted" && (
            <Tooltip text="Message">
              <button
                onClick={() =>
                  navigate("/shipper/messages", { state: { orderId: record.id } })
                }
                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-700" />
              </button>
            </Tooltip>
          )}

        </div>
      ),
    }
  ];

  const viewOrderDetails = (id: number) => {
    setOrderId(id)
    setOpenOrderDetailDrawer(true)
  }

  const viewOffers = (record: any) => {
    setOrderData(record)
    setOpenOfferDrawer(true)
  }
  const manageOrder = (order_id: any) => {
    // setOrderData(record)
    // setOpenManageOfferDrawer(true)
    navigate("/shipper/manage-request", {
      state: { orderId: order_id },
    });
  }

  const onClose = () => {
    setOpenOfferDrawer(false)
    setOpenMessageDrawer(false)
    setOpenManageOfferDrawer(false)
    setOpenOrderDetailDrawer(false)
  }

  return (
    <>
      <PageMeta title="Delivering Parcel | View Requests" description="" />
      <PageBreadcrumb pageTitle="View Requests" />
      <div className="space-y-6">
        <ComponentCard title="View Requests">
          <DParcelTable columns={columns} data={requests} />
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
