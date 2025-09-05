import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "../../icons";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchPermission } from "../../slices/permissionSlice";

const schema = yup.object().shape({
    name: yup.string().required("Permission title is required"),
});

interface Permission {
    id: number;
    name: string;
    status: string;
    created_at: string;
}

type FormData = {
    name: string;
};

export default function Permissions() {
    const dispatch = useDispatch<AppDispatch>();
    const { permissions, permissionsLoading, error } = useSelector((state: any) => state.permissions);

    useEffect(() => {
        dispatch(fetchPermission());
    }, [dispatch]);

    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const onClose = () => {
        reset();
        closeModal();
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            // API call to save permission
            const res = await ApiHelper("POST", "/permissions", data);

            if (res.status === 200) {
                onClose()
                dispatch(fetchPermission());

                toast.success(res.data.message || "Permission added!");
                onClose();
            } else {
                toast.error(res.data.message || "Failed to add permission ❌");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong!", {
                style: { background: "#f44336", color: "#fff" },
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: "name",
            header: "Permission Name",
        },
        { key: "code", header: "Code" },
        { key: "created_at", header: "Created At" },
        {
            key: "actions",
            header: "Actions",
            render: (row: Permission) => (
                <div className="flex gap-3">
                    <button className="text-blue-500 hover:text-blue-700">
                        <PencilIcon />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                        <TrashBinIcon />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Delivering Parcel | Permissions" description="" />
            <PageBreadcrumb pageTitle="Permissions" />
            <div className="space-y-6">
                <ComponentCard
                    title="Permissions"
                    actions={
                        <div className="flex gap-3">
                            <button
                                onClick={openModal}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                            >
                                + Add Permission
                            </button>
                            <button
                                // onClick={openModal}
                                className="px-4 py-2 rounded-lg bg-white text-blue-600 text-sm font-medium hover:bg-blue-700 hover:text-white transition border  border-blue-500"
                            >
                                Assign Permission
                            </button>
                        </div>
                    }
                >
                    <DParcelTable columns={columns} data={permissions} />
                </ComponentCard>

                {/* Modal */}
                <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
                    <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
                        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Add Permission
                        </h4>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <Label>
                                    Permission Title <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Enter permission name"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button size="sm" variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                                <Button type="submit" size="sm" disabled={isSubmitting || loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </>
    );
}
