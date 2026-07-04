import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

interface OrderRecord {
  id: string | number;
  request_number: string;
  user?: { name: string; email?: string };
  ship_from?: { country?: string };
  ship_to?: { country?: string; city?: string };
}

interface Props {
  record: OrderRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderApprovalModal({ record, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      const res = await ApiHelper("POST", `/admin/order/${record.id}/approve`, { status, reason });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Review Order Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Order Info */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 text-gray-700">
          <p><span className="font-medium">Request #:</span> {record.request_number}</p>
          <p><span className="font-medium">Shopper:</span> {record.user?.name ?? "-"}</p>
          <p><span className="font-medium">From:</span> {record.ship_from?.country ?? "-"}</p>
          <p>
            <span className="font-medium">To:</span>{" "}
            {record.ship_to?.country ?? "-"}
            {record.ship_to?.city ? `, ${record.ship_to.city}` : ""}
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-gray-400 font-normal">(optional — shown in rejection email)</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incomplete product details..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => handleAction("approved")}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {loading ? "Processing..." : "Approve"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleAction("rejected")}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            <XCircleIcon className="w-4 h-4" />
            {loading ? "Processing..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
