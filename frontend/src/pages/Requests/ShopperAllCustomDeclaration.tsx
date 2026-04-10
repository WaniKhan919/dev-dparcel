import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import DParcelTable from "../../components/tables/DParcelTable";
import toast from "react-hot-toast";

export default function ShopperAllCustomDeclaration() {
  const [customDeclState, setCustomDeclState] = useState({
    data: [],
    meta: null,
    page: 1,
    loading: false,
  });

  const [trackingLinks, setTrackingLinks] = useState<Record<number, string>>({});
  const [attachingId, setAttachingId] = useState<number | null>(null);

  const getCustomDecleration = async (pageNumber = 1) => {
    setCustomDeclState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await ApiHelper(
        "GET",
        `/shipper/dashboard/get-custom-declarations?page=${pageNumber}&per_page=10`
      );
      if (res.status === 200 && res.data.success) {
        setCustomDeclState({
          data: res.data.data,
          meta: res.data.meta,
          page: pageNumber,
          loading: false,
        });
      } else {
        setCustomDeclState((prev) => ({ ...prev, data: [], loading: false }));
      }
    } catch (err) {
      console.error(err);
      setCustomDeclState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAttachTrackingLink = async (orderId: number) => {
    const trackingLink = trackingLinks[orderId]?.trim();

    if (!trackingLink) {
      toast.error("Tracking link is required.");
      return;
    }

    const urlPattern = /^(https?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=%]+$/;
    if (!urlPattern.test(trackingLink)) {
      toast.error("Please enter a valid URL (must start with http:// or https://).");
      return;
    }

    try {
      setAttachingId(orderId);
      const response = await ApiHelper("POST", `/shipper/order/${orderId}/tracking-link`, {
        tracking_link: trackingLink,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Tracking link attached successfully!");
        setTrackingLinks((prev) => ({ ...prev, [orderId]: "" }));
        getCustomDecleration(customDeclState.page);
      } else {
        toast.error(response.data?.message || "Failed to attach tracking link.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAttachingId(null);
    }
  };

  useEffect(() => {
    getCustomDecleration();
  }, []);

  const columns = [
    {
      key: "request_number",
      header: "Request #",
      render: (row: any) => (
        <span className="font-medium text-gray-800">
          {row.order?.request_number}
        </span>
      ),
    },
    {
      key: "address",
      header: "Destination",
      render: (row: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-700">{row.to_street}</span>
          <span className="text-xs text-gray-400">
            {row.to_city?.name || "N/A"}, {row.to_state?.name || "N/A"},{" "}
            {row.to_country?.name || "N/A"} {row.to_postcode}
          </span>
        </div>
      ),
    },
    {
      key: "total_declared_value",
      header: "Declared Value",
      render: (row: any) => <span>${row.total_declared_value}</span>,
    },
    {
      key: "total_weight",
      header: "Weight (g)",
      render: (row: any) => (
        <span>{row.total_weight || "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.status === "approved" ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      key: "tracking_link",
      header: "Tracking Link",
      render: (row: any) =>
        row.order?.tracking_link ? (
          <div className="flex items-center gap-2">
            <a
              href={row.order.tracking_link}
              target="_blank"
              rel="noopener noreferrer"
              title={row.order.tracking_link}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition min-w-0 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate underline underline-offset-2 group-hover:no-underline max-w-[150px]">
                {row.order.tracking_link}
              </span>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(row.order.tracking_link);
                toast.success("Link copied!");
              }}
              title="Copy link"
              className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
              ✓ Attached
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter tracking link..."
              value={trackingLinks[row.order?.id] || ""}
              onChange={(e) =>
                setTrackingLinks((prev) => ({
                  ...prev,
                  [row.order?.id]: e.target.value,
                }))
              }
              className="px-3 py-1.5 border rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleAttachTrackingLink(row.order?.id)}
              disabled={attachingId === row.order?.id}
              className="px-3 py-1.5 text-sm text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              {attachingId === row.order?.id ? "Attaching..." : "Attach"}
            </button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Custom Declaration" description="" />
      <PageBreadcrumb pageTitle="Custom Declaration" />

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <DParcelTable
            columns={columns}
            data={customDeclState.data}
            loading={customDeclState.loading}
            rowsPerPage={10}
          />

          {/* Server-side Pagination */}
          {customDeclState.meta && (customDeclState.meta as any).last_page > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Page {customDeclState.page} of {(customDeclState.meta as any).last_page} —{" "}
                Total {(customDeclState.meta as any).total} records
              </p>
              <div className="flex gap-2">
                <button
                  disabled={customDeclState.page === 1}
                  onClick={() => getCustomDecleration(customDeclState.page - 1)}
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={customDeclState.page === (customDeclState.meta as any).last_page}
                  onClick={() => getCustomDecleration(customDeclState.page + 1)}
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}