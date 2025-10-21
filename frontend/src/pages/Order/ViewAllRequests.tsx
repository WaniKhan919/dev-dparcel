import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchAllOrders } from "../../slices/allOrderSlice";
import AdminOrderMessages from "../../utils/Drawers/Order/AdminOrderMessages";
import OrdedrSearchFilter from "../../utils/Drawers/Order/OrdedrSearchFilter";
import TableActions from "../../components/tables/TableActions";

interface Request {
  id: number;
  service_type: string;
  request_number: string;
  ship_from: string;
  ship_to: string;
  products: string; // comma-separated
  total_aprox_weight: string;
  total_price: string;
  weight_per_unit: string;
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
  order_offer: {
    id: number;
    order_id: number;
    user_id: number;
    message: string;
    status: string;
    shipper: {
      id: number;
      name: string;
    };
  };
  order_status: {
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
}

export default function ViewAllRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, meta, loading } = useSelector((state: any) => state.allOrder);
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false)
  const [orderData, setOrderData] = useState([])
  
  const [filters, setFilters] = useState({
    request_number: "",
    status: "",
    ship_from: "",
    ship_to: "",
    date: "",
  });

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllOrders({ page, per_page: 10, ...filters }));
  }, [dispatch, page, filters]);

  const openMessage = (record: any) => {
    setOrderData(record)
    setOpenMessageDrawer(true)
  }

  const trackOrder = (record: any) => {
  }
  const onClose = () => {
    setOpenMessageDrawer(false)
  }

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
{
  key: "service_type",
  header: "Ship Type",
  render: (record: Request) => {
    const label =
      record.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me";
    const color =
      record.service_type === "ship_for_me"
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800";

    return (
      <div className="flex flex-col">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
          {label}
        </span>
        <span className="text-xs text-gray-500 mt-1">{record.request_number}</span>
      </div>
    );
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
      key: "shipper",
      header: "Shipper",
      render: (record: Request) => (
        <span>{record.user.name}</span>
      ),
    },
    {
      key: "user",
      header: "Shopper",
      render: (record: Request) => (
        <span>{record?.order_offer?.shipper?.name}</span>
      ),
    },
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
        const status = (record?.order_status?.name ?? "Pending").toLowerCase();

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

        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: Request) => (
        <TableActions
          record={record}
          onViewOffers={(rec) => console.log("View Offers:", rec)}
          onTrackOrder={(rec) => trackOrder(rec)}
          onOpenMessage={(rec) => openMessage(rec)}
        />
      ),
    }
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />
      <div className="space-y-6">
        {/* Search All Order */}
        <OrdedrSearchFilter onSearch={handleSearch} onReset={handleReset} />
        <ComponentCard title="Requests">
          <DParcelTable 
            columns={columns} 
            data={data} 
            rowsPerPage={12}
            meta={meta}
            loading={loading}
            onPageChange={(newPage:number) => setPage(newPage)}
          />
          {
            openMessageDrawer &&
            <AdminOrderMessages
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

