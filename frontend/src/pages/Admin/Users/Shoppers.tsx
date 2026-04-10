import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import DParcelTable from "../../../components/tables/DParcelTable";
import { ApiHelper } from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import PageMeta from "../../../components/common/PageMeta";

export default function Shoppers() {

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch shippers
    const fetchShoppers = async () => {
        try {
            setLoading(true);
            const res: any = await ApiHelper("GET", "/admin/users/shoppers");
            if (res.status === 200) {
               setData(res.data.data)
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
        fetchShoppers();
    }, []);


    const columns = [
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },

        // 📊 Status
        {
            key: "status",
            header: "Status",
            render: (record: any) => {
                const status = record.status;

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

    ];

    return (
        <>
            <PageMeta
                title="Shopper"
                description=""
            />
            <ComponentCard title="Shoppers">
                <DParcelTable columns={columns} data={data} loading={loading} />
            </ComponentCard>

        </>
    );
}