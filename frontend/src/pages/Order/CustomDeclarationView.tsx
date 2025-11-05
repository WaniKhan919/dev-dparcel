import React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
interface Props {
  data: any;
  orderDetails: any;
  onEdit: () => void;
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-gray-200 pb-1">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
      {children}
    </div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <p>
    <span className="font-medium text-gray-800">{label}:</span>{" "}
    <span className="text-gray-600">{value ?? "-"}</span>
  </p>
);

const CustomDeclarationView: React.FC<Props> = ({
  data,
  orderDetails,
  onEdit,
}) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading declaration details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-2xl border border-gray-200">
      {/* Header with title and edit icon */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Custom Declaration Summary
        </h2>

        <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 transition"
            title="Edit Declaration"
            >
            <PencilSquareIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Step 1 — Shipment Details */}
      <Section title="Step 1: Shipment Details">
        <InfoItem label="Purpose of Shipment" value={data.purpose_of_shipment} />
        <InfoItem label="Export Reason" value={data.export_reason} />
      </Section>

      {/* Step 2 — Receiver Info */}
      <Section title="Step 2: Receiver Info">
        <InfoItem label="Receiver Name" value={data.receiver_name} />
        <InfoItem label="Receiver Phone" value={data.receiver_phone} />
        <InfoItem label="Postal Code" value={data.postal_code} />
        <InfoItem label="Receiver Address" value={data.receiver_address} />
      </Section>

      {/* Step 3 — Location Info */}
      <Section title="Step 3: Location Info">
        <InfoItem label="Country ID" value={data.country_id} />
        <InfoItem label="State ID" value={data.state_id} />
        <InfoItem label="City ID" value={data.city_id} />
      </Section>

      {/* Step 4 — Products Info (Tabular) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-gray-200 pb-1">
          Step 4: Products Info
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-gray-700 text-sm">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Product Title</th>
                <th className="border px-4 py-2 text-left">Quantity</th>
                <th className="border px-4 py-2 text-left">Weight</th>
                <th className="border px-4 py-2 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails && orderDetails.length > 0 ? (
                orderDetails.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{item.product?.title || "-"}</td>
                    <td className="border px-4 py-2">{item.quantity}</td>
                    <td className="border px-4 py-2">{item.weight}</td>
                    <td className="border px-4 py-2">{item.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-4 border"
                  >
                    No product information available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 5 — Declaration Info */}
      <Section title="Step 5: Declaration Info">
        <InfoItem
          label="Total Declared Value"
          value={`${data.total_declared_value} ${data.currency}`}
        />
        <InfoItem
          label="Total Weight"
          value={`${data.total_weight} ${data.unit_of_weight}`}
        />
        <InfoItem
          label="Contains Prohibited Items"
          value={data.contains_prohibited_items ? "Yes" : "No"}
        />
        <InfoItem label="Contains Liquids" value={data.contains_liquids ? "Yes" : "No"} />
        <InfoItem
          label="Contains Batteries"
          value={data.contains_batteries ? "Yes" : "No"}
        />
        <InfoItem label="Is Fragile" value={data.is_fragile ? "Yes" : "No"} />
        <InfoItem label="Is Dutiable" value={data.is_dutiable ? "Yes" : "No"} />
        <InfoItem label="Additional Info" value={data.additional_info || "-"} />
      </Section>
    </div>
  );
};

export default CustomDeclarationView;
