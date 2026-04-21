import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import DParcelTable from "../../components/tables/DParcelTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useEffect, useState } from "react";
import { fetchServices } from "../../slices/servicesSlice";
import { fetchShippingType } from "../../slices/shippingTypeSlice";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../icons";
import Select from "../../components/ui/dropdown/Select";

interface ServiceFormData {
  id: number;
  title: string;
  shipping_type: number;
  description?: string | null;
  is_required: number;
  status?: number | null;
}

// Validation schema
const schema = yup.object({
  title: yup.string().required("Title is required"),
  shipping_type: yup.number().required("Shipping type is required"),
  description: yup.string().nullable(),
  is_required: yup
    .mixed()
    .oneOf(["0", "1"], "This field is required")
    .required("Is Required is required"),
  status: yup
    .mixed()
    .oneOf(["0", "1", ""], "Invalid value for Status")
    .nullable(),
});

type FormData = yup.InferType<typeof schema>;

export default function Services() {
  const dispatch = useDispatch<AppDispatch>();
  const { services } = useSelector((state: any) => state.services);
  const { shippingType } = useSelector((state: RootState) => state.shippingType);
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchShippingType());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: "",
      shipping_type: undefined,
      description: "",
      is_required: "" as any,
      status: "" as any,
    }
  });

  const columns = [
    { key: "title", header: "Title" },
    { key: "shipping_type", header: "Shipping Type" },
    {
      key: "is_required",
      header: "Is Required",
      render: (row: ServiceFormData) => (
        <Badge
          size="sm"
          color={row.is_required === 1 ? "success" : "warning"}
        >
          {row.is_required === 1 ? "Required" : "Not Required"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ServiceFormData) => (
        <Badge
          size="sm"
          color={row.status === 1 ? "success" : "warning"}
        >
          {row.status === 1 ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ServiceFormData) => (
        <div className="flex gap-3">
          <button
            onClick={() => editService(row.id)}
            className="p-2 border border-blue-300 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            <PencilIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setDeleteId(row.id);
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

  const onClose = () => {
    reset();
    setEditMode(false);
    setSelectedServiceId(null);
    closeModal();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const endpoint = editMode
        ? `/service/update/${selectedServiceId}`
        : "/service/store";
      const method = editMode ? "PUT" : "POST";

      const res = await ApiHelper(method, endpoint, data);

      if (res.status === 200) {
        onClose();
        toast.success(
          res.data.message ||
          (editMode ? "Service updated successfully!" : "Service added successfully!")
        );
        dispatch(fetchServices());
      } else {
        toast.error(res.data.message || "Failed to save service ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!", {
        style: { background: "#f44336", color: "#fff" },
      });
    } finally {
      setLoading(false);
      setEditMode(false);
      setSelectedServiceId(null);
    }
  };

  // Open modal with existing service data for editing
  const editService = (id: number) => {
    const service = services.find((s: ServiceFormData) => s.id === id);
    if (service) {
      reset({
        title: service.title,
        shipping_type: service.shipping_type,
        description: service.description || "",
        is_required: String(service.is_required) as any,
        status: service.status !== null ? String(service.status) as any : "",
      });
      setSelectedServiceId(id);
      setEditMode(true);
      openModal();
    }
  };

  const deleteService = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await ApiHelper("DELETE", `/service/${deleteId}`);
      if (res.status === 200) {
        toast.success(res.data.message || "Service deleted successfully!");
        dispatch(fetchServices());
      } else {
        toast.error(res.data.message || "Failed to delete service ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting service");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };
  const handleOpenModal = () => {
    reset()
    openModal()
  }

  return (
    <>
      <PageMeta title="Delivering Parcel | Services" description="" />
      <PageBreadcrumb pageTitle="Services" />
      <div className="space-y-6">
        <ComponentCard title="Services">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={handleOpenModal}>
              Add Service
            </Button>
          </div>
          <DParcelTable columns={columns} data={services} />
        </ComponentCard>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
          <div className="relative w-full max-w-[700px] rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editMode ? "Edit Service" : "Add Service"}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-x-4">
                {/* Title */}
                <div className="flex-1">
                  <Label>
                    Title <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter service title"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-x-4">
                <div className="flex-1">
                  <Controller
                    name="shipping_type"
                    control={control}
                    render={({ field }) => (
                      <Select<number>
                        label="Shipping Type"
                        options={shippingType?.map((c: any) => ({
                          value: c.id,
                          label: c.title,
                        })) || []}
                        value={field.value ? Number(field.value) : null}
                        onChange={(val: any) => {field.onChange(val);}}
                        placeholder="Shipping Type"
                        error={errors.shipping_type?.message as string}
                        clearable
                      />
                    )}
                  />
                </div>
                {/* Is Required */}
                <div className="flex-1">
                  <Label>
                    Is Required <span className="text-error-500">*</span>
                  </Label>
                  <select
                    {...register("is_required")}
                    className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select option</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                  {errors.is_required && (
                    <p className="text-red-500 text-sm">{errors.is_required.message}</p>
                  )}
                </div>

                {/* status */}
                <div className="flex-1">
                  <Label>Status</Label>
                  <select
                    {...register("status")}
                    className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <textarea
                  placeholder="Enter description"
                  {...register("description")}
                  className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-800 dark:text-white"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <Button size="sm" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || loading}>
                  {loading
                    ? "Saving..."
                    : editMode
                      ? "Update Changes"
                      : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="max-w-md m-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this service? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={deleteService}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"

              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </>
  );
}
