import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOffers } from "../../slices/shipperOffersSlice";
import { createPortal } from "react-dom";

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
          pending: "bg-yellow-100 text-yellow-800",      // waiting
          inprogress: "bg-blue-100 text-blue-800",      // active work
          accepted: "bg-green-100 text-green-800",      // success
          rejected: "bg-red-100 text-red-800",          // failure
          cancelled: "bg-gray-200 text-gray-800",       // neutral
          ignored: "bg-purple-100 text-purple-800",     // dismissed
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
        const [open, setOpen] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [position, setPosition] = useState({ top: 0, left: 0 });

        const toggleDropdown = () => {
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
          }
          setOpen(!open);
        };

        // Close on outside click
        useEffect(() => {
          const handleClickOutside = (e: MouseEvent) => {
            if (
              buttonRef.current &&
              !buttonRef.current.contains(e.target as Node)
            ) {
              setOpen(false);
            }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
          <>
            <button
              ref={buttonRef}
              type="button"
              onClick={toggleDropdown}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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

            {open &&
              createPortal(
                <div
                  style={{ top: position.top, left: position.left }}
                  className="absolute mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="py-1">
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      View
                    </button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      Edit
                    </button>
                    <button className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                      Delete
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </>
        );
      },
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
