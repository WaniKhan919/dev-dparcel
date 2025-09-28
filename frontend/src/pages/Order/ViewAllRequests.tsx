import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchAllOrders } from "../../slices/allOrderSlice";

interface Request {
    id: number;
    service_type: string;
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
  order_offer:{
    id: number;
    order_id: number;
    user_id: number;
    message: string;
    status: string;
    shipper:{
      id: number;
      name: string;
    };
  };
  user:{
    id: number;
    name: string;
  };
}

export default function ViewAllRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, meta, loading } = useSelector((state: any) => state.allOrder);

  useEffect(() => {
    dispatch(fetchAllOrders({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const columns = [
    {
        key: "service_type",
        header: "Ship Type",
        render: (record: Request) => {
            return record.service_type === "ship_for_me"
            ? "Ship For Me"
            : "Shop For Me";
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
        <span>{record.order_offer.shipper.name}</span>
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
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          accepted: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
          cancelled: "bg-gray-200 text-gray-800",
          ignored: "bg-orange-100 text-orange-800",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[record.order_offer.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {record.order_offer.status.charAt(0).toUpperCase() + record.order_offer.status.slice(1)}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />
      <div className="space-y-6">
        <ComponentCard title="Requests">
          <DParcelTable columns={columns} data={data} />
        </ComponentCard>
      </div>
    </>
  );
}

