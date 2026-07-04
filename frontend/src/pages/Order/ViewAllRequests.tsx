import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchAllOrders } from "../../slices/allOrderSlice";
import AdminOrderMessages from "../../utils/Drawers/Order/AdminOrderMessages";
import OrdedrSearchFilter from "../../utils/Drawers/Order/OrdedrSearchFilter";
import { ChatBubbleLeftIcon, EyeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal";
import { useNavigate } from "react-router";
import OrderApprovalModal from "../../components/admin/OrderApprovalModal";
import AdminOfferApprovalModal from "../../components/admin/AdminOfferApprovalModal";

interface Request {
  id: string;
  service_type: string;
  status_title: string;
  request_number: string;
  total_aprox_weight: string;
  total_price: string;
  shipping_type: {
    quantity: number;
    slug: string;
    title?: string;
  };
  order_details: {
    id: number;
    quantity: number;
    price: string;
    weight?: string;
    product: { id: number; title: string; weight?: string };
  }[];
  offers: any;
  order_status: { name: string } | null;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  user: { id: number; name: string; email?: string };
  ship_from: {
    country: string;
  };
  ship_to: {
    country: string;
    city: string;
    address: string;
  };
  price_breakdown: {
    initial_price: number;
    offer_price: number;
    selected_services: number;
    additional_services: number;
    stripe_fee: number;
    service_fee: number;
    grand_total: number;
    total_payable: number;
  };
  products: {
    id: number;
    quantity: number;
    price: string;
    weight: string;
    product: { id: number; title: string };
  }[];
  all_offers?: {
    id: string;
    offer_price: string;
    admin_approval_status: 'pending' | 'approved' | 'rejected';
    status: string;
    shipper?: { id: number; name: string } | null;
    additional_prices?: { id: number; title: string; price: string }[];
    order?: { request_number?: string };
  }[];
  accepted_offer?: {
    id: string; // encrypted
    order_id: number;
    user_id: number;
    status: string;
    admin_approval_status: 'pending' | 'approved' | 'rejected';
    offer_price: string;
    message?: string | null;

    shipper?: {
      id: number;
      name: string;
    };

    additional_prices?: {
      id: number;
      order_offer_id: number;
      service_id?: number | null;
      title?: string | null;
      price: string;
    }[];
  } | null;

}

export default function ViewAllRequests() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data, meta, loading } = useSelector((state: any) => state.allOrder);

  const [filters, setFilters] = useState({
    request_number: "",
    status: "",
    ship_from: "",
    ship_to: "",
    date: "",
  });
  const [page, setPage] = useState(1);

  const [openMessageDrawer, setOpenMessageDrawer] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [orderData, setOrderData] = useState<Request | null>(null);
  const [approvalRecord, setApprovalRecord] = useState<Request | null>(null);
  const [offerApprovalRecord, setOfferApprovalRecord] = useState<(NonNullable<Request['all_offers']>[number] & { order?: { request_number?: string } }) | null>(null);

  useEffect(() => {
    dispatch(fetchAllOrders({ page, per_page: 12, ...filters }));
  }, [dispatch, page, filters]);

  const openMessage = (record: Request) => {
    setOrderData(record);
    setOpenMessageDrawer(true);
  };

  const openDetails = (record: Request) => {
    setOrderData(record);
    setOpenDetailModal(true);
  };

  const trackOrder = (order_id: any) => {
    navigate("/admin/track-order", {
      state: { orderId: order_id },
    });
  };

  const handleSearch = (searchFilters: any) => {
    setPage(1);
    setFilters({
      request_number: searchFilters.requestNumber,
      status: searchFilters.status,
      ship_from: searchFilters.shipFrom,
      ship_to: searchFilters.shipTo,
      date: searchFilters.date,
    });
  };

  const handleReset = () => {
    setPage(1);
    setFilters({
      request_number: "",
      status: "",
      ship_from: "",
      ship_to: "",
      date: "",
    });
  };

  const columns = [
    { key: "request_number", header: "Request Number" },
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: Request) => {
        const label = record.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me";
        const color = record.service_type === "ship_for_me" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} w-max`}>{label}</span>;
      },
    },
    {
      key: "ship_from_to",
      header: "Ship From / To",
      render: (record: Request) => (
        <div className="text-sm">
          <div><strong>From:</strong> {record.ship_from?.country ?? "-"}</div>
          <div><strong>To:</strong> {record.ship_to?.country ?? "-"}, {record.ship_to?.city ?? "-"}</div>
        </div>
      ),
    },
    {
      key: "total_price",
      header: "Total Price",
      render: (record: Request) => (
        <>{record.price_breakdown.total_payable}</>
      )

    },
    {
      key: "status",
      header: "Status",
      render: (record: Request) => {
        const status = (record.status_title ?? "Pending").toLowerCase();
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          "awaiting payment": "bg-orange-100 text-orange-800",
          paid: "bg-blue-100 text-blue-800",
          purchased: "bg-indigo-100 text-indigo-800",
          "in warehouse": "bg-teal-100 text-teal-800",
          packed: "bg-purple-100 text-purple-800",
          shipped: "bg-cyan-100 text-cyan-800",
          "in transit": "bg-sky-100 text-sky-800",
          delivered: "bg-green-100 text-green-800",
          cancelled: "bg-gray-200 text-gray-800",
          returned: "bg-red-100 text-red-800",
        };
        return <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
      },
    },
    {
      key: "admin_approval",
      header: "Approval",
      render: (record: Request) => {
        const s = record.admin_approval_status;
        if (s === 'approved') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
        if (s === 'rejected') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
        return (
          <button
            onClick={() => setApprovalRecord(record)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
          >
            Review
          </button>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: Request) => (
        <div className="flex items-center gap-2">
          <button title="View Details" onClick={() => openDetails(record)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
          </button>
          <button title="Track Order" onClick={() => trackOrder(record.id)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100">
            <MapPinIcon className="h-5 w-5 text-blue-700" />
          </button>
          <button title="Messages" onClick={() => openMessage(record)} className="p-2 rounded-lg bg-green-50 hover:bg-green-100">
            <ChatBubbleLeftIcon className="h-5 w-5 text-green-700" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />
      <div className="space-y-6">
        <OrdedrSearchFilter onSearch={handleSearch} onReset={handleReset} />
        <ComponentCard title="Requests">
          <DParcelTable columns={columns} data={data} rowsPerPage={10} meta={meta} loading={loading} onPageChange={(newPage) => setPage(newPage)} />
        </ComponentCard>
      </div>

      {/* Messages Drawer */}
      {openMessageDrawer && <AdminOrderMessages isOpen={openMessageDrawer} onClose={() => setOpenMessageDrawer(false)} orderData={orderData} />}

      {/* Order Approval Modal */}
      {approvalRecord && (
        <OrderApprovalModal
          record={approvalRecord}
          onClose={() => setApprovalRecord(null)}
          onSuccess={() => dispatch(fetchAllOrders({ page, per_page: 12, ...filters }))}
        />
      )}

      {/* Offer Approval Modal */}
      {offerApprovalRecord && (
        <AdminOfferApprovalModal
          offer={offerApprovalRecord}
          onClose={() => setOfferApprovalRecord(null)}
          onSuccess={() => dispatch(fetchAllOrders({ page, per_page: 12, ...filters }))}
        />
      )}

      {/* Order Detail Modal */}
      {openDetailModal && orderData && (
        <Modal
          isOpen={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          className="max-w-4xl p-8 max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-semibold mb-6">
            Request Details - {orderData.request_number}
          </h2>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Ship Type:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${orderData.shipping_type?.title === "ship_for_me"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                    }`}
                >
                  {orderData.shipping_type?.title === "ship_for_me"
                    ? "Ship For Me"
                    : "Buy For Me"}
                </span>
              </div>

              <div>
                <strong>Status:</strong>{" "}
                {orderData.status_title ?? "Pending"}
              </div>

              <div>
                <strong>From:</strong>{" "}
                {orderData.ship_from?.country}
              </div>

              <div>
                <strong>To:</strong>{" "}
                {orderData.ship_to?.country},{" "}
                {orderData.ship_to?.city}
              </div>

              <div>
                <strong>Total Weight:</strong> {orderData.total_aprox_weight} g
              </div>

              <div>
                <strong>Total Price:</strong> $ {orderData.price_breakdown.total_payable}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">
              Products ({orderData.products?.length})
            </h3>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Weight</th>
                  </tr>
                </thead>

                <tbody>
                  {orderData.products?.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.product?.title}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">${item.price}</td>
                      <td className="p-2">{item.weight} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Offers — Admin Approval */}
          {(orderData.all_offers?.length ?? 0) > 0 && (
            <div className="border rounded-2xl p-5 bg-white shadow-sm">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Shipper Offers</h3>
              <div className="space-y-3">
                {orderData.all_offers!.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{offer.shipper?.name ?? "Unknown Shipper"}</p>
                      <p className="text-gray-500">Offer: <span className="font-semibold text-gray-700">${offer.offer_price}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      {offer.admin_approval_status === 'approved' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>
                      )}
                      {offer.admin_approval_status === 'rejected' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>
                      )}
                      {offer.admin_approval_status === 'pending' && (
                        <button
                          onClick={() => setOfferApprovalRecord({ ...offer, order: { request_number: orderData.request_number } })}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Offer Detail */}
          {orderData.accepted_offer && (
            <div className="border rounded-2xl p-5 bg-white shadow-sm">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  Accepted Offer
                </h3>

                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  Accepted
                </span>
              </div>

              {/* Offer Price */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-4">
                <span className="text-sm text-gray-600">Offer Price</span>
                <span className="text-lg font-bold text-gray-900">
                  ${orderData.accepted_offer.offer_price}
                </span>
              </div>

              {/* Additional Charges */}
              {(orderData.accepted_offer?.additional_prices?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Additional Charges
                  </h4>

                  <div className="space-y-2">
                    {orderData.accepted_offer?.additional_prices?.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">
                          {p.title ?? "Service"}
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          ${p.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
