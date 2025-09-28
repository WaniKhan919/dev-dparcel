import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";
import { AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderStatus } from "../../../slices/orderStatusSlice";

import Label from "../../../components/form/Label";
import TextArea from "../../../components/form/input/TextArea";
import Input from "../../../components/form/input/InputField";

const schema = yup.object().shape({
  status: yup.string().required("Status is required"),
  // tracking_number: yup.string().optional(),
  // remarks: yup.string().optional(),
});

// 👇 renamed this to avoid clash with built-in FormData
type OrderStatusFormData = {
  status: string;
  tracking_number?: string;
  remarks?: string;
};

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function ViewShopperOffersDrawer({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { orderStatus, loading } = useSelector((state: any) => state.orderStatus);

  const [isLoading, setIsLoading] = useState(false);
  const [orderTracking, setOrderTrackingData] = useState<any>([]);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderStatusFormData>({
    resolver: yupResolver(schema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: OrderStatusFormData) => {
    setIsLoading(true);

    try {
      const payload: any = {
        order_id: orderData.id,
        status_id: data.status,
        tracking_number: data.tracking_number || "",
        remarks: data.remarks || "",
        files,
      };

      const res = await ApiHelper("POST", "/order/update-status", payload);

      if (res.status === 200) {
        getOrderTrackingData()
        toast.success(res.data.message || "Status updated successfully 🎉");
        reset();
        setFiles([]);
      } else {
        toast.error(res.data.message || "Failed to update ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchOrderStatus());
  }, [dispatch]);

  const getOrderTrackingData = async () => {
    setIsLoading(true);
    try {
      const res = await ApiHelper("GET", `/order/get-order-tracking/${orderData.id}`);
      if (res.status === 200) {
        const trackingArray = res.data.data; // assume this is an array
        const historyData = trackingArray.map((tracking: any) => ({
          id: tracking.id,
          status: tracking.status?.name
            ? "Order " + tracking.status.name.charAt(0).toUpperCase() + tracking.status.name.slice(1)
            : "Unknown",
          time: new Date(tracking.created_at).toLocaleString(), // format timestamp
          remarks: tracking.remarks || null,
        }));

        setOrderTrackingData(historyData);

      } else {
        setOrderTrackingData([]);
      }
    } catch {
      toast.error("Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderData.id) {
      getOrderTrackingData();
    }
  }, [orderData]);

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Manage Order – #{orderData?.order?.tracking_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          {/* Order Actions */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {/* Status */}
              <div>
                <Label>
                  Status <span className="text-error-500">*</span>
                </Label>
                <select
                  {...register("status")}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring focus:ring-blue-200"
                >
                  <option value="">Select status</option>
                  {orderStatus?.map((st: any) => (
                    <option key={st.id} value={st.id}>
                      {st.name.charAt(0).toUpperCase() + st.name.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status.message}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <Label>File</Label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 
                    file:mr-3 file:py-2 file:px-4 file:rounded-md 
                    file:border-0 file:bg-blue-50 file:text-blue-700 
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Tracking number */}
            <div>
              <Label>Tracking Number</Label>
              <Input
                type="text"
                placeholder="Enter tracking number"
                {...register("tracking_number")}
              />
            </div>

            {/* Remarks */}
            <div>
              <Label>Remarks</Label>
              <TextArea
                placeholder="Enter description"
                {...register("remarks")}
              />
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md 
                  hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading || isSubmitting ? "Updating..." : "Update Status"}
              </button>
            </div>
          </form>

          {/* Order History */}
          <div>
            <h3 className="text-md font-semibold mb-3">Order History</h3>
            <ol className="relative border-l border-gray-300">
              {orderTracking.map((item: any) => (
                <li key={item.id} className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 border border-white"></div>

                  <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                    {item.time}
                  </time>

                  <p className="text-base font-medium text-gray-800">
                    {item.status}
                  </p>

                  {item.remarks && (
                    <p className="text-sm text-gray-600 italic mt-1">
                      {item.remarks}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
