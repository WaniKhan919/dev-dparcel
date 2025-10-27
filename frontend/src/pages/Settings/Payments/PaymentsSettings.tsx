import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import DParcelTable from "../../../components/tables/DParcelTable";
import { useEffect, useState } from "react";
import PageMeta from "../../../components/common/PageMeta";
import { useModal } from "../../../hooks/useModal";
import { ApiHelper } from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchShippingType } from "../../../slices/shippingTypeSlice";

export interface PaymentSettingFormData {
  id: number;
  role_id: number;
  shipping_types_id?: number | null;
  key: string;
  value: number;
  type: string;
  description?: string;
  active: boolean;
}

const schema = yup.object({
  role_id: yup.number().typeError("Role is required").required("Role is required"),
  shipping_types_id: yup.number().nullable(),
  key: yup.string().required("Key is required"),
  value: yup.number().typeError("Value must be a number").required("Value is required"),
  type: yup.string().oneOf(["percent", "fixed"]).required("Type is required"),
  description: yup.string().nullable(),
  active: yup.boolean().required("Status is required"),
});

export default function PaymentSettings() {
  
  const dispatch = useDispatch<AppDispatch>();
  const { shippingType, shippingTypeLoading, error } = useSelector((state: any) => state.shippingType);
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState<PaymentSettingFormData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roles, setRoles] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSettingFormData>({
    resolver: yupResolver(schema) as any,
  });

  // ✅ Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await ApiHelper("GET", "/roles");
      if (res.status === 200) {
        const formatted = res.data.data.map((r: any) => ({
          value: String(r.id),
          text: r.name,
        }));
        setRoles(formatted);
      }
    } catch {
      toast.error("Failed to load roles ❌");
    }
  };

  // ✅ Fetch all payment settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await ApiHelper("GET", "/admin/settings/payment");
      if (res.status === 200) {
        setSettings(res.data.data.data || []); // since pagination used
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load settings ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchRoles();
  }, []);

  useEffect(() => {
    dispatch(fetchShippingType());
  }, [dispatch]);

  // ✅ Submit handler
  const onSubmit = async (data: PaymentSettingFormData) => {
    setLoading(true);
    try {
      const endpoint = editMode
        ? `/admin/settings/payment/${selectedId}`
        : "/admin/settings/payment";
      const method = editMode ? "PUT" : "POST";

      const res = await ApiHelper(method, endpoint, data);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || "Saved successfully ✅");
        fetchSettings();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to save ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit
  const editSetting = (id: number) => {
    const setting = settings.find((s) => s.id === id);
    if (setting) {
      reset(setting);
      setSelectedId(id);
      setEditMode(true);
      openModal();
    }
  };

  // ✅ Delete
  const deleteSetting = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await ApiHelper("DELETE", `/admin/settings/payment/${deleteId}`);
      if (res.status === 200) {
        toast.success(res.data.message || "Deleted successfully ✅");
        fetchSettings();
      } else {
        toast.error(res.data.message || "Delete failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting ❌");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const onClose = () => {
    reset();
    setEditMode(false);
    setSelectedId(null);
    closeModal();
  };

  const columns: any = [
    { key: "key", header: "Key" },
    { key: "value", header: "Value" },
    { key: "type", header: "Type" },
    { key: "description", header: "Description" },
    {
      key: "active",
      header: "Status",
      render: (row: PaymentSettingFormData) => (
        <Badge size="sm" color={row.active ? "success" : "warning"}>
          {row.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: PaymentSettingFormData) => (
        <div className="flex gap-3">
          <button
            onClick={() => editSetting(row.id!)}
            className="p-2 border border-blue-300 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setDeleteId(row.id!);
              setDeleteModalOpen(true);
            }}
            className="p-2 border border-red-300 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition"
          >
            <TrashBinIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Admin | Payment Setting" description="Manage Payment Settings" />
      <PageBreadcrumb pageTitle="Payment Setting" />

      <div className="space-y-6">
        <ComponentCard title="Payment Settings">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={openModal}>
              Add Setting
            </Button>
          </div>
          <DParcelTable columns={columns} data={settings} loading={loading} />
        </ComponentCard>

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4" closeOnOutsideClick={false}>
          <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editMode ? "Edit Setting" : "Add Setting"}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role *</Label>
                  <select {...register("role_id", { valueAsNumber: true })} className="w-full border p-2 rounded-md">
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.text}
                      </option>
                    ))}
                  </select>
                  {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id.message}</p>}
                </div>

                <div>
                  <Label>Shipping Type (optional)</Label>
                  <select {...register("shipping_types_id", { valueAsNumber: true })} className="w-full border p-2 rounded-md">
                    <option value="">None</option>
                    {shippingType.map((s:any) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Key *</Label>
                  <Input placeholder="e.g. shipper_service_fee" {...register("key")} />
                  {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
                </div>

                <div>
                  <Label>Value *</Label>
                  <Input type="number" step="0.01" placeholder="Enter value" {...register("value")} />
                  {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type *</Label>
                  <select {...register("type")} className="w-full border p-2 rounded-md">
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                </div>

                <div>
                  <Label>Status *</Label>
                  <select {...register("active")} className="w-full border p-2 rounded-md">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input placeholder="Optional description" {...register("description")} />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || loading}>
                  {loading ? "Saving..." : editMode ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-md m-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold mb-4">Confirm Deletion</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this setting? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={deleteSetting} disabled={loading} className="bg-red-600 text-white">
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
