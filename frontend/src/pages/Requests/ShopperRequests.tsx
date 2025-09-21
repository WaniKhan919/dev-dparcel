import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOffers } from "../../slices/shipperOffersSlice";

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
}

export default function ShopperRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: apiData, meta, loading } = useSelector((state: any) => state.order);

  useEffect(() => {
    dispatch(fetchOffers({ page: 1, per_page: 10 }));
  }, [dispatch]);
  useEffect(() => {
  console.log('Redux state.data:', apiData);
  console.log('Mapped offers:', offers);
}, [apiData]);

const offers: Request[] = apiData.map((item: any) => ({
  id: item.id,
  service_type: item.order?.service_type,
  ship_from: item.order?.ship_from,
  ship_to: item.order?.ship_to,
  total_aprox_weight: item.order?.total_aprox_weight,
  total_price: item.order?.total_price,
  order_details: item.order?.order_details?.map((detail: any) => ({
    id: detail.id,
    quantity: detail.quantity,
    price: detail.price,
    product: {
      id: detail.product?.id,
      title: detail.product?.title,
      weight: detail.product?.weight,
    },
  })),
  status: item.status,
}));


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
    { key: "status", header: "Status" },
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
          <DParcelTable columns={columns} data={offers} />
        </ComponentCard>
      </div>
    </>
  );
}
