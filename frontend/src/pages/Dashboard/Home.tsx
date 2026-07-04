import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";
import { ApiHelper } from "../../utils/ApiHelper";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchAllOrders } from "../../slices/allOrderSlice";
import DParcelTable from "../../components/tables/DParcelTable";
import { EyeIcon } from "lucide-react";
import OrderApprovalModal from "../../components/admin/OrderApprovalModal";
import AdminOfferApprovalModal from "../../components/admin/AdminOfferApprovalModal";

interface Request {
  id: string | number;
  service_type: string;
  request_number: string;
  total_aprox_weight: string;
  total_price: string;
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
  order_details: {
    id: number;
    quantity: number;
    price: string;
    weight?: string;
    product: { id: number; title: string; weight?: string };
  }[];
  order_offer: any;
  order_status: { name: string } | null;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  user: { id: number; name: string; email: string };
  ship_from:{
    country: string;
  };
  ship_to:{
    country: string;
    city: string;
    address: string;
  };
}

export default function Home() {
  const [ordersData, setOrdersData] = useState<{
    total_orders: number;
    ship_for_me: number;
    buy_for_me: number;
  }>({
    total_orders: 0,
    ship_for_me: 0,
    buy_for_me: 0,
  });
  const [currentBalance, setCurrentBalance] = useState<{
    total_commission: number;
    master_account_amount: number;
  }>({
    total_commission: 0,
    master_account_amount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState<Request | null>(null);

  const [pendingOffers, setPendingOffers] = useState<any[]>([]);
  const [pendingOffersLoading, setPendingOffersLoading] = useState(false);
  const [offerApprovalRecord, setOfferApprovalRecord] = useState<any | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { data, meta } = useSelector((state: any) => state.allOrder);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrdersStats();
    fetchBalance();
    fetchPendingOffers();
  }, []);

  const fetchPendingOffers = async () => {
    setPendingOffersLoading(true);
    try {
      const res = await ApiHelper("GET", "/admin/dashboard/pending-offers?per_page=10");
      if (res.status === 200 && res.data.success) {
        setPendingOffers(res.data.data);
      }
    } catch {
    } finally {
      setPendingOffersLoading(false);
    }
  };

  const fetchOrdersStats = async () => {
    setLoading(true);
    try {
      const res = await ApiHelper("GET", "/admin/dashboard/orders");

      if (res.status === 200 && res.data.success) {
        setOrdersData(res.data.data);
      } else {
        setOrdersData({
          total_orders: 0,
          ship_for_me: 0,
          buy_for_me: 0,
        });
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await ApiHelper("GET", "/admin/dashboard/balance");

      if (res.status === 200 && res.data.success) {
        setCurrentBalance({
          total_commission: parseFloat(res.data.total_commission),
          master_account_amount: parseFloat(res.data.master_account_amount),
        });
      } else {
        setCurrentBalance({
          total_commission: 0,
          master_account_amount: 0,
        })
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
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
        <>
            {record?.price_breakdown?.total_payable}
        </>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (record: Request) => {
        const rawStatus = record.order_status?.name ?? "Pending";
        const status = rawStatus.toLowerCase();
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",

          "offer placed": "bg-blue-100 text-blue-800",
          "offer accepted": "bg-green-100 text-green-800",

          "payment pending": "bg-orange-100 text-orange-800",

          inprogress: "bg-purple-100 text-purple-800",
          processed: "bg-indigo-100 text-indigo-800",

          forwarded: "bg-cyan-100 text-cyan-800",
          received: "bg-teal-100 text-teal-800",

          completed: "bg-green-200 text-green-900",
        };
        return <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
        >
          {rawStatus}
        </span>;
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
      key: "action",
      header: "Action",
      render: (record: Request) => (
        <button
          title="View Details"
          onClick={() => navigate("/admin/track-order", { state: { orderId: record.id } })}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
        </button>
      )
    },
  ];

  useEffect(() => {
    dispatch(fetchAllOrders({ page, per_page: 12 }));
  }, [dispatch, page]);

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="International Package and mail Forwarding Services"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 h-40 rounded-b-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2 pt-4">
              Welcome to your dashboard!
              <InfoIcon className="w-5 h-5 text-white" />
            </h1>
          </div>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6  pt-5 -mt-25">
            {/* Total Orders */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-blue-600 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : ordersData.total_orders}
                  </p>
                  <p className="text-gray-600 mb-2">Total Orders</p>
                  <div className="text-sm text-gray-500 flex gap-4">
                    <span>Ship For Me: {ordersData.ship_for_me}</span>
                    <span>Buy For Me: {ordersData.buy_for_me}</span>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
              </div>
              <div className="flex justify-end mt-4">
                <Link
                  to="/view/requests"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>

            {/* Pickup Soon */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-yellow-400 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-gray-600">Pickup soon</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-yellow-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <a href="#" className="text-blue-600 font-medium text-sm">
                  See all
                </a>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-green-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">€{currentBalance.total_commission}</p>
                  <p className="text-gray-600">Current Balance</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">

                <Link
                  to="/admin/wallet"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-red-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">€{currentBalance.master_account_amount}</p>
                  <p className="text-gray-600">Master Account Amount</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <Link
                  to="/admin/wallet"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-5">
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Requests
            </h2>
            <div className="col-span-12 mt-2">
              <DParcelTable columns={columns} data={data} rowsPerPage={10} meta={meta} loading={loading} onPageChange={(newPage) => setPage(newPage)} />
            </div>
          </div>
        </div>
      </div>
      {/* Pending Offers Section */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-5">
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Pending Offer Approvals
              </h2>
              {pendingOffers.length > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  {pendingOffers.length} pending
                </span>
              )}
            </div>

            {pendingOffersLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pendingOffers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No pending offers</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                      <th className="px-4 py-3 text-left">Request #</th>
                      <th className="px-4 py-3 text-left">Shipper</th>
                      <th className="px-4 py-3 text-left">Route</th>
                      <th className="px-4 py-3 text-left">Offer Price</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOffers.map((offer: any) => (
                      <tr key={offer.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {offer.order?.request_number ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {offer.shipper?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span>{offer.order?.ship_from ?? "-"}</span>
                          <span className="mx-1 text-gray-400">→</span>
                          <span>{offer.order?.ship_to ?? "-"}{offer.order?.ship_to_city ? `, ${offer.order.ship_to_city}` : ""}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          ${offer.total_offer_price}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setOfferApprovalRecord(offer)}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {approvalRecord && (
        <OrderApprovalModal
          record={approvalRecord}
          onClose={() => setApprovalRecord(null)}
          onSuccess={() => dispatch(fetchAllOrders({ page, per_page: 12 }))}
        />
      )}

      {offerApprovalRecord && (
        <AdminOfferApprovalModal
          offer={offerApprovalRecord}
          onClose={() => setOfferApprovalRecord(null)}
          onSuccess={() => fetchPendingOffers()}
        />
      )}
    </>
  );
}
