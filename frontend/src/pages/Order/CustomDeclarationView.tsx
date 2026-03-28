import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface Props {
  data: any;           // customDeclaration object
  orderData: any;      // full order response (for products, request_number)
  onEdit: () => void;
}

const CustomDeclarationView: React.FC<Props> = ({ data, orderData }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  // Products come from orderData.products
  const products: any[] = orderData?.products ?? [];
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

  const formatAddress = (prefix: "from" | "to") =>
    [
      data[`${prefix}_street`],
      data[`${prefix}_city`]?.name,
      data[`${prefix}_state`]?.name,
      data[`${prefix}_country`]?.name,
      data[`${prefix}_postcode`],
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

  const flags = [
    { label: "Prohibited Items", key: "contains_prohibited_items", danger: true },
    { label: "Contains Liquids", key: "contains_liquids" },
    { label: "Contains Batteries", key: "contains_batteries" },
    { label: "Fragile", key: "is_fragile" },
  ];

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
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Custom Declaration</h2>
            <p className="text-xs text-gray-400 mt-0.5">{requestNumber}</p>
          </div>
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
              <SectionTitle>Sender &amp; Receiver</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <AddressCard
                  role="From (Sender)"
                  name={data.from_name}
                  business={data.from_business}
                  address={formatAddress("from")}
                  color="blue"
                />
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
                    <th className="border-b border-gray-200 px-3 py-2 text-left w-8">#</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-left">Product</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-center w-16">Qty</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-center w-20">Weight</th>
                    <th className="border-b border-gray-200 px-3 py-2 text-right w-24">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((item: any, i: number) => (
                      <tr key={item.id ?? i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border-b border-gray-100 px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="border-b border-gray-100 px-3 py-2 font-medium text-gray-800">{item.product?.title || "-"}</td>
                        <td className="border-b border-gray-100 px-3 py-2 text-center text-gray-600">{item.quantity}</td>
                        <td className="border-b border-gray-100 px-3 py-2 text-center text-gray-600">{item.weight} kg</td>
                        <td className="border-b border-gray-100 px-3 py-2 text-right text-gray-800 font-medium">${item.price}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400 text-xs">No products listed</td>
                    </tr>
                  )}
                </tbody>
                {/* {products.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Declared Value</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-800">{data.total_declared_value} {data.currency || "USD"}</td>
                    </tr>
                  </tfoot>
                )} */}
              </table>
            </section>

            {/* Declaration Summary */}
            <section className="page-break-avoid">
              <SectionTitle>Declaration Summary</SectionTitle>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <SummaryCard label="Total Value" value={`${data.total_declared_value} ${data.currency || "USD"}`} />
                <SummaryCard label="Total Weight" value={`${data.total_weight} ${data.unit_of_weight || "kg"}`} />
                <SummaryCard
                  label="Status"
                  value={data.status || "Pending"}
                  highlight={data.status === "Approved" ? "green" : data.status === "Rejected" ? "red" : "yellow"}
                />
              </div>

              {/* Flags */}
              <div className="grid grid-cols-4 gap-2">
                {flags.map((f) => (
                  <div
                    key={f.key}
                    className={`print-badge flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium
                      ${data[f.key]
                        ? f.danger
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${data[f.key] ? (f.danger ? "bg-red-500" : "bg-amber-400") : "bg-gray-300"}`} />
                    {f.label}: {data[f.key] ? "Yes" : "No"}
                  </div>
                ))}
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