import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../../components/common/ComponentCard";
import DParcelTable from "../../../components/tables/DParcelTable";
import { ApiHelper } from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import { Modal } from "../../../components/ui/modal";
import PageMeta from "../../../components/common/PageMeta";

export default function Shippers() {
    const navigate = useNavigate();

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShipper, setSelectedShipper] = useState<any>(null);
    const [loadingType, setLoadingType] = useState<"approved" | "rejected" | null>(null);

    // Fetch shippers
    const fetchShippers = async () => {
        try {
            setLoading(true);
            const res: any = await ApiHelper("GET", "/admin/users/shippers");
            if (res.status === 200) {
                const formatted = (res?.data?.data || []).map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mobile_number: user.shipper_profile?.mobile_number,
                    facebook_url: user.shipper_profile?.facebook_url,
                    instagram_url: user.shipper_profile?.instagram_url,
                    approval_status: user.shipper_profile?.approval_status,
                    created_at: user.created_at,
                }));

                setData(formatted);
            } else {
                setData([])
            }

        } catch (err: any) {
            toast.error(err?.message || "Failed to fetch shippers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShippers();
    }, []);

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        try {
            setLoadingType(status);

            const res = await ApiHelper(
                "POST",
                `/admin/users/${selectedShipper?.id}/status`,
                {
                    approval_status: status,
                }
            );

            if (res.status === 200 && res.data.success) {
                setIsModalOpen(false);
                setSelectedShipper(null);
                fetchShippers();
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong");
        } finally {
            setLoadingType(null);
        }
    };

    const columns = [
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "mobile_number", header: "Mobile" },

        // 🔗 Facebook direct link
        {
            key: "facebook_url",
            header: "Facebook",
            render: (record: any) =>
                record.facebook_url ? (
                    <a
                        href={record.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 underline"
                    >
                        {record.facebook_url}
                    </a>
                ) : (
                    "-"
                ),
        },

        // 🔗 Instagram direct link
        {
            key: "instagram_url",
            header: "Instagram",
            render: (record: any) =>
                record.instagram_url ? (
                    <a
                        href={record.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-500 underline"
                    >
                        {record.instagram_url}
                    </a>
                ) : (
                    "-"
                ),
        },

        // 📊 Status
        {
            key: "approval_status",
            header: "Status",
            render: (record: any) => {
                const status = record.approval_status;

                const color =
                    status === "approved"
                        ? "bg-green-100 text-green-600"
                        : status === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600";

                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
                        {status}
                    </span>
                );
            },
        },

        // 📅 Created
        {
            key: "created_at",
            header: "Created",
            render: (record: any) =>
                new Date(record.created_at).toLocaleDateString(),
        },

        // ⚡ Actions (ONLY ONE BUTTON)
        {
            key: "actions",
            header: "Actions",
            render: (record: any) => {
                const status = record.approval_status;

                // 🎯 Pending → clickable button
                if (status === "pending") {
                    return (
                        <button
                            onClick={() => {
                                setSelectedShipper(record);
                                setIsModalOpen(true);
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Approve / Reject
                        </button>
                    );
                }

                // ✅ Approved / Rejected → disabled badge-style button
                const color =
                    status === "approved"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600";

                return (
                    <button
                        disabled
                        className={`px-3 py-1 text-xs rounded cursor-not-allowed ${color}`}
                    >
                        {status}
                    </button>
                );
            },
        },
    ];

    return (
        <>
            <PageMeta
                title="Shipper"
                description=""
            />
            <ComponentCard title="Shippers">
                <DParcelTable columns={columns} data={data} loading={loading} />
            </ComponentCard>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="max-w-md m-4"
            >
                <div className="p-6 w-[420px] bg-white rounded-2xl">

                    {/* Header */}
                    <div className="mb-5">

                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Shipper Details
                            </h2>
                        </div>

                        {/* Badge row separate */}
                        <div className="mt-2">
                            <span
                                className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${selectedShipper?.approval_status === "approved"
                                    ? "bg-green-100 text-green-600"
                                    : selectedShipper?.approval_status === "rejected"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-600"
                                    }`}
                            >
                                {selectedShipper?.approval_status || "pending"}
                            </span>
                        </div>

                    </div>

                    {/* Info Card */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">

                        <div className="flex justify-between">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium text-gray-800">
                                {selectedShipper?.name}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-800">
                                {selectedShipper?.email}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Mobile</span>
                            <span className="font-medium text-gray-800">
                                {selectedShipper?.mobile_number || "-"}
                            </span>
                        </div>

                    </div>

                    {/* Divider */}
                    <div className="my-5 border-t border-gray-200"></div>

                    {/* Actions */}
                    <div className="flex gap-3">

                        {/* Reject */}
                        <button
                            onClick={() => handleStatusUpdate("rejected")}
                            disabled={loadingType !== null}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
            ${loadingType === "rejected"
                                    ? "bg-red-400 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                        >
                            {loadingType === "rejected" ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Processing...
                                </>
                            ) : (
                                "Reject"
                            )}
                        </button>

                        {/* Approve */}
                        <button
                            onClick={() => handleStatusUpdate("approved")}
                            disabled={loadingType !== null}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
            ${loadingType === "approved"
                                    ? "bg-green-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                }`}
                        >
                            {loadingType === "approved" ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Processing...
                                </>
                            ) : (
                                "Approve"
                            )}
                        </button>

                    </div>

                </div>
            </Modal>
        </>
    );
}