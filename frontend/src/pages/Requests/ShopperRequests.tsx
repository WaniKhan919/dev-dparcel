import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOffers } from "../../slices/shipperOffersSlice";

interface Request {
  id: number;
  service_type: string;
  ship_from: string;
  ship_to: string;
  total_aprox_weight: string;
  total_price: string;
  status: string;
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
  const { data, meta, loading } = useSelector((state: any) => state.shipperOffers);

  useEffect(() => {
    dispatch(fetchOffers({ page: 1, per_page: 10 }));
  }, [dispatch]);
  const requests: Request[] = useMemo(() => {
    return data.map((offer: any) => ({
      id: offer.id,
      service_type: offer.order?.service_type ?? "",
      ship_from: offer.order?.ship_from ?? "",
      ship_to: offer.order?.ship_to ?? "",
      total_aprox_weight: offer.order?.total_aprox_weight ?? "",
      total_price: offer.order?.total_price ?? "",
      status: offer.status,
      order_details: offer.order?.order_details ?? [],
    }));
  }, [data]);

  const columns = [
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: Request) => 
        record.service_type === "ship_for_me" ? "Ship For Me" : "Shop For Me",
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
          accepted: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
          cancelled: "bg-gray-200 text-gray-800",
          ignored: "bg-orange-100 text-orange-800",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[record.status] || "bg-gray-100 text-gray-800"
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
      render: (record: Request) => <></>,
    },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | View Requests" description="" />
      <PageBreadcrumb pageTitle="View Requests" />
      <div className="space-y-6">
        <ComponentCard title="View Requests">
          <DParcelTable columns={columns} data={requests} />
        </ComponentCard>
      </div>
    </>
  );
}
