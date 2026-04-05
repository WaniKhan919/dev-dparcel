import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Modal } from "../../components/ui/modal";
import { userHasRole } from "../../utils/DparcelHelper";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

interface Props {
  data: any; 
  orderData: any;
  fetchOrderDetails?: any;
}

const CustomDeclarationView: React.FC<Props> = ({ data, orderData, fetchOrderDetails }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Products come from orderData.products
  const products: any[] = data?.products ?? [];
  // Use request_number from orderData, fallback to declaration id
  const requestNumber = orderData?.request_number ?? `#${data?.id}`;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Custom_Declaration_${requestNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 16mm 14mm;
      }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-size: 11px; }
      }
    `,
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading declaration details...
      </div>
    );
  }

  const formatAddress = (prefix: "to") =>
    [
      data?.[`${prefix}_street`],
      data?.[`${prefix}_city`]?.name,
      data?.[`${prefix}_state`]?.name,
      data?.[`${prefix}_country`]?.name,
      data?.[`${prefix}_postcode`],
    ]
      .filter(Boolean)
      .join(", ");

  const categories = [
    { label: "Commercial Sample", key: "category_commercial_sample" },
    { label: "Gift", key: "category_gift" },
    { label: "Returned Goods", key: "category_returned_goods" },
    { label: "Documents", key: "category_documents" },
    { label: "Other", key: "category_other" },
  ].filter((c) => data[c.key]);

  const totalWeight = products.reduce((sum: number, item: any) => {
    const weight = parseFloat(item.product?.weight || 0);
    const qty = parseFloat(item.product?.quantity || 0);
    return sum + weight * qty;
  }, 0);

  const totalValue = products.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product?.price || 0);
    const qty = parseFloat(item.product?.quantity || 0);
    return sum + price * qty;
  }, 0);

  const handleConfirm = async () => {
    if (!actionType) return;

    setLoading(true); // 🔥 start loading

    const payload = {
      status: actionType === "approve" ? "approved" : "rejected",
      custom_decleration_id: orderData.customDeclaration.id,
    };

    try {
      const response = await ApiHelper("POST", "/admin/order/custom-decleration", payload);

      if (response.status === 200 && response.data.status) {
        toast.success(response.data.message, {
          duration: 3000,
          position: "top-right",
          icon: "🎉",
        });

        setIsModalOpen(false);
        fetchOrderDetails();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false); // 🔥 stop loading
    }
  };
  return (
    <>
      {/* ── Screen-only: print button ── */}
      <style>{`
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          .no-print { display: none !important; }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .print-badge {
            border: 1px solid #d1d5db !important;
            background: #f9fafb !important;
            -webkit-print-color-adjust: exact;
          }
          .print-table th {
            background: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
          }
          .print-header-bar {
            background: #1e3a5f !important;
            -webkit-print-color-adjust: exact;
          }
          .page-break-avoid { page-break-inside: avoid; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Action Bar */}
        <div className="no-print flex items-center justify-between mb-5">

          {/* LEFT SIDE */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Custom Declaration</h2>
            <p className="text-xs text-gray-400 mt-0.5">{requestNumber}</p>
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex items-center gap-3">

            {userHasRole('admin') && data.status == 'pending' && (
              <button
                onClick={() => {
                  setActionType("approve");
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow hover:bg-green-700 transition-colors"
              >
                Approve / Reject
              </button>
            )}

            <button
              onClick={() => handlePrint()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M9 21h6v-6H9v6z" />
              </svg>
              Print / Save PDF
            </button>

          </div>
        </div>

        {/* ── Printable Document ── */}
        <div
          ref={componentRef}
          className="print-page bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="print-header-bar bg-[#1e3a5f] text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold tracking-wide">CUSTOMS DECLARATION</h1>
              <p className="text-xs text-blue-200 mt-0.5">Generated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">Request Number</p>
              <p className="text-base font-mono font-semibold">{requestNumber}</p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Sender & Receiver */}
            <section className="page-break-avoid">
              <SectionTitle>Receiver</SectionTitle>

              <div className="grid grid-cols-1">
                <AddressCard
                  role="To (Receiver)"
                  name={data.to_name}
                  business={data.to_business}
                  address={formatAddress("to")}
                  color="green"
                />
              </div>
            </section>

            {/* Category + Importer Info side by side */}
            <section className="grid grid-cols-2 gap-4 page-break-avoid">
              {/* Shipment Category */}
              <div>
                <SectionTitle>Shipment Category</SectionTitle>
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <span key={c.key} className="print-badge inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {c.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Not specified</span>
                  )}
                </div>
              </div>

              {/* Importer Info */}
              <div>
                <SectionTitle>Importer Info</SectionTitle>
                <div className="space-y-1.5">
                  <InfoRow label="Reference" value={data.importer_reference} />
                  <InfoRow label="Contact" value={data.importer_contact} />
                  <InfoRow label="Office Origin" value={data.office_origin_posting} />
                </div>
              </div>
            </section>

            {/* Explanation & Comments */}
            {(data.explanation || data.comments) && (
              <section className="grid grid-cols-2 gap-4 page-break-avoid">
                {data.explanation && (
                  <div>
                    <SectionTitle>Explanation</SectionTitle>
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">{data.explanation}</p>
                  </div>
                )}
                {data.comments && (
                  <div>
                    <SectionTitle>Comments</SectionTitle>
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">{data.comments}</p>
                  </div>
                )}
              </section>
            )}

            {/* Products Table */}
            <section className="page-break-avoid">
              <SectionTitle>Products / Contents</SectionTitle>
              <table className="print-table w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
                    <th className="border-b border-gray-200 px-3 py-2 text-left">Product</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-center w-16">Qty</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-center w-20">Weight</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-right w-24">Price</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left">HS Tariff Number</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left">Country of Origin</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((item: any, i: number) => (
                      <tr key={item.id ?? i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>


                        <td className="border-b border-gray-100 px-3 py-2 font-medium text-gray-800">
                          {item.product?.title || "-"}
                        </td>

                        <td className="border-b border-gray-100 px-3 py-2 text-center text-gray-600">
                          {item.product?.quantity ?? "-"}
                        </td>

                        <td className="border-b border-gray-100 px-3 py-2 text-center text-gray-600">
                          {item.product?.weight ? `${item.product.weight} kg` : "-"}
                        </td>

                        <td className="border-b border-gray-100 px-3 py-2 text-right text-gray-800 font-medium">
                          {item.product?.price ? `$${item.product.price}` : "-"}
                        </td>

                        {/* ✅ NEW */}
                        <td className="border-b border-gray-100 px-3 py-2 text-gray-600">
                          {item.hs_code || "-"}
                        </td>

                        {/* ✅ NEW */}
                        <td className="border-b border-gray-100 px-3 py-2 text-gray-600">
                          {item.origin_country || "-"}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400 text-xs">
                        No products listed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Declaration Summary */}
            <section className="page-break-avoid">
              <SectionTitle>Declaration Summary</SectionTitle>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <SummaryCard label="Total Value" value={`${totalValue} ${"USD"}`} />
                <SummaryCard label="Total Weight" value={`${totalWeight} g`} />
                <SummaryCard
                  label="Status"
                  value={data.status || "Pending"}
                  highlight={data.status === "approved" ? "green" : data.status === "rejected" ? "red" : "yellow"}
                />
              </div>

            </section>

            {/* Submitted At */}
            {data.submitted_at && (
              <div className="text-xs text-gray-400 flex justify-between pt-1 border-t border-gray-100">
                <span>Submitted: {data.submitted_at}</span>
                <span>System generated document — do not alter</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-md mx-auto p-6"
        closeOnOutsideClick={false}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Action
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to {" "}
          <span className={`font-semibold ${actionType === "approve" ? "text-green-600" : "text-red-600"}`}>
            {actionType}
          </span>{" "}
          this custom declaration?
        </p>

        {/* Switch buttons */}
        <div className="flex gap-2 mt-4 mb-4">
          <button
            onClick={() => setActionType("approve")}
            className={`flex-1 py-2 rounded-lg text-sm ${actionType === "approve"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            Approve
          </button>

          <button
            onClick={() => setActionType("reject")}
            className={`flex-1 py-2 rounded-lg text-sm ${actionType === "reject"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            Reject
          </button>
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => handleConfirm()}
            disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded-lg flex items-center justify-center gap-2
    ${actionType === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
              }
    ${loading ? "opacity-70 cursor-not-allowed" : ""}
  `}
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}

            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>

      </Modal>
    </>
  );
};

/* ── Small helpers ── */

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{children}</h3>
);

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-700">{value || "—"}</span>
  </div>
);

const AddressCard = ({
  role, name, business, address, color,
}: {
  role: string; name?: string; business?: string; address: string; color: "blue" | "green";
}) => {
  const accent = color === "blue" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50";
  const roleColor = color === "blue" ? "text-blue-600" : "text-green-600";
  return (
    <div className={`print-badge rounded-lg border p-3 ${accent}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${roleColor}`}>{role}</p>
      <p className="text-sm font-semibold text-gray-800">{name || "—"}</p>
      {business && <p className="text-xs text-gray-500">{business}</p>}
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{address || "—"}</p>
    </div>
  );
};

const SummaryCard = ({
  label, value, highlight,
}: {
  label: string; value: string; highlight?: "green" | "red" | "yellow";
}) => {
  const bg = highlight === "green" ? "bg-green-50 border-green-200" : highlight === "red" ? "bg-red-50 border-red-200" : highlight === "yellow" ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200";
  return (
    <div className={`print-badge rounded-lg border px-3 py-2.5 ${bg}`}>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
};

export default CustomDeclarationView;