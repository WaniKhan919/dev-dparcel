import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

interface AdditionalPrice {
  title: string;
  price: string;
}

interface OfferRecord {
  id: string;
  offer_price: string;
  total_offer_price?: number;
  shipper?: { id?: number; name: string; email?: string } | null;
  additional_prices?: AdditionalPrice[];
  order?: {
    request_number?: string;
    service_type?: string;
    ship_from?: string;
    ship_to?: string;
    ship_to_city?: string;
    ship_to_address?: string;
    shopper?: { name: string; email?: string };
  };
}

interface Props {
  offer: OfferRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminOfferApprovalModal({ offer, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      const res = await ApiHelper("POST", `/admin/offer/${offer.id}/approve`, { status, reason });
      if (res.data.success) {
        toast.success(res.data.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res.data.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const basePrice = parseFloat(offer.offer_price || "0");
  const additionalTotal = offer.additional_prices?.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0) ?? 0;
  const grandTotal = offer.total_offer_price ?? basePrice + additionalTotal;

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Offer Detail</h3>
            {offer.order?.request_number && (
              <p className="text-xs text-gray-400 mt-0.5">Request #{offer.order.request_number}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* Shipper & Shopper */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Shipper</p>
              <p className="text-sm font-semibold text-gray-800">{offer.shipper?.name ?? "—"}</p>
              {offer.shipper?.email && (
                <p className="text-xs text-gray-500 mt-0.5 break-all">{offer.shipper.email}</p>
              )}
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-2">Shopper</p>
              <p className="text-sm font-semibold text-gray-800">{offer.order?.shopper?.name ?? "—"}</p>
              {offer.order?.shopper?.email && (
                <p className="text-xs text-gray-500 mt-0.5 break-all">{offer.order.shopper.email}</p>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Info</p>

            {offer.order?.service_type && (
              <div className="flex justify-between">
                <span className="text-gray-500">Service Type</span>
                <span className="font-medium text-gray-800 capitalize">
                  {offer.order.service_type.replace(/_/g, " ")}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Route</span>
              <span className="font-medium text-gray-800 text-right">
                {offer.order?.ship_from ?? "—"}
                {" → "}
                {offer.order?.ship_to ?? "—"}
                {offer.order?.ship_to_city ? `, ${offer.order.ship_to_city}` : ""}
              </span>
            </div>

            {offer.order?.ship_to_address && (
              <div className="flex justify-between">
                <span className="text-gray-500 shrink-0">Delivery Address</span>
                <span className="font-medium text-gray-800 text-right max-w-[55%]">
                  {offer.order.ship_to_address}
                </span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Offer Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base Offer Price</span>
                <span className="font-medium text-gray-800">${basePrice.toFixed(2)}</span>
              </div>

              {offer.additional_prices && offer.additional_prices.length > 0 && (
                <>
                  {offer.additional_prices.map((p, i) => (
                    <div key={i} className="flex justify-between pl-3 text-gray-500">
                      <span>+ {p.title}</span>
                      <span>${parseFloat(p.price).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span className="text-gray-700">Total Offer</span>
                <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason{" "}
              <span className="text-gray-400 font-normal text-xs">
                (optional — sent in rejection email)
              </span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Offer price too high..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            disabled={loading}
            onClick={() => handleAction("approved")}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {loading ? "Processing..." : "Approve"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleAction("rejected")}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            <XCircleIcon className="w-4 h-4" />
            {loading ? "Processing..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
