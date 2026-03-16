import * as yup from "yup";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import { ApiHelper } from "../../utils/ApiHelper";
import Label from "../../components/form/Label";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextArea from "../../components/form/input/TextArea";

interface Service {
    id: number;
    title: string;
    price: string;
    description: string | null;
    is_required: number;
    status: number;
}

interface OrderService {
    id: number;
    order_id: number;
    service_id: number;
    created_at: string;
    updated_at: string;
    service: Service;
}

interface Product {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    product_url: string;
    quantity: number;
    price: string;
    weight: string;
    created_at: string;
    updated_at: string;
    tracking: ProductTracking;
}

interface ProductTracking {
    purchase_status: string;
    tracking_id: string;
    tracking_link: string;
    product_receipt: string;
}

interface Ship {
    country: string;
    state: string;
    city: string;
}
interface AdditionalPrice {
    title: string;
    price: string;
}
interface Shipper {
    id: number;
    name: string;
    email: string;
    phone: string;
}
interface AcceptedOffer {
    id: number;
    order_id: number;
    user_id: number;
    message: string | null;
    status: string;
    offer_price: string;
    shipper: Shipper;
    additional_prices: AdditionalPrice[];
    created_at: string;
    updated_at: string;
}
interface OrderData {
    id: number;
    user_id: number;
    service_type: string;
    total_aprox_weight: string;
    total_price: string;
    tracking_number: string;
    request_number: string;
    status: number;
    products: any[];
    acceptedOffer: AcceptedOffer;
    order_services: OrderService[];
    ship_from: Ship;
    ship_to: Ship;
}

const excludedStatuses = [
    "Pending",
    "Offer Placed",
    "Offer Accepted",
    "Payment Pending",
    "Received",
    "Completed",
];

type OrderStatusFormData = {
    status: string;
    tracking_number?: string;
    remarks?: string;
};

const schema = yup.object().shape({
    status: yup.string().required("Status is required"),
    // tracking_number: yup.string().optional(),
    // remarks: yup.string().optional(),
});

export default function ManageRequest() {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [orderTracking, setOrderTracking] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const steps = ["Order Detail", "Offer", "Products", "Order Status", "Order Tracking"];
    const [currentStep, setCurrentStep] = useState(0);
    const [productStates, setProductStates] = useState<any[]>([]);
    const [orderStatusOptions, setOrderStatusOptions] = useState<
        { id: number; name: string; disabled: boolean }[]
    >([]);

    const [orderTrackingData, setOrderTrackingData] = useState<any>([]);
    useEffect(() => {
        if (orderData?.products) {
            const initialStates = orderData.products.map((detail: any) => ({
                product_id: detail.product.id,
                purchase_status: "not_purchase",
                tracking_link: "",
                tracking_id: "",
                product_receipt: null as File | null,
            }));

            setProductStates(initialStates);
        }
    }, [orderData]);

    const handleProductChange = (
        index: number,
        key: "purchase_status" | "tracking_link" | "tracking_id" | "product_receipt",
        value: any
    ) => {
        const updated = [...productStates];
        updated[index][key] = value;
        setProductStates(updated);
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<OrderStatusFormData>({
        resolver: yupResolver(schema),
    });

    const getOrderTrackingData = async () => {
        // setIsLoading(true);
        try {
            const res = await ApiHelper("GET", `/order/get-order-tracking/${orderId}`);
            if (res.status === 200) {
                const trackingArray = res.data.data;
                setOrderTrackingData(trackingArray);
                const options = trackingArray
                    .filter((st: any) => !excludedStatuses.includes(st.status_name))
                    .map((st: any) => {
                        return {
                            id: st.status_id,
                            name: st.status_name,
                            disabled: st.is_completed, // only completed steps disabled
                        };
                    });

                setOrderStatusOptions(options);
            } else {
                setOrderTrackingData([]);
            }
        } catch {
            toast.error("Failed to fetch offers");
        } finally {
            // setIsLoading(false);
        }
    };


    const fetchOrderDetails = async () => {
        if (!orderId) return;

        setLoading(true);
        try {
            // Fetch full order details
            const orderRes = await ApiHelper(
                "GET",
                `/order/get-order-detail/${orderId}`
            );
            if (orderRes.status === 200) {
                setOrderData(orderRes.data.data);
            } else {
                toast.error(orderRes.data.message || "Failed to fetch order");
            }

            // Fetch order tracking details
            const trackingRes = await ApiHelper(
                "GET",
                `/order/get-order-tracking/${orderId}`
            );
            if (trackingRes.status === 200) {
                setOrderTracking(trackingRes.data.data);
            } else {
                setOrderTracking([]);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        getOrderTrackingData();
    }, [orderId]);

    if (!orderId) return <div className="p-10 text-center">No order selected</div>;

    if (loading || !orderData)
        return <div className="p-10 text-center">Loading order details...</div>;

    const allTrackingExists = orderData?.products?.every(
        (item: any) => item.product?.tracking
    );

    const submitProducts = async () => {
        try {
            const formData = new FormData();

            productStates.forEach((product: any, index: number) => {
                formData.append(`products[${index}][product_id]`, product.product_id);
                formData.append(`products[${index}][purchase_status]`, product.purchase_status);

                if (product.purchase_status === "purchase") {
                    formData.append(`products[${index}][tracking_link]`, product.tracking_link || "");
                    formData.append(`products[${index}][tracking_id]`, product.tracking_id || "");

                    // Only append if it's a real File object
                    if (product.product_receipt instanceof File) {
                        formData.append(`products[${index}][product_receipt]`, product.product_receipt);
                    }
                }
            });

            const res = await ApiHelper("POST", "/order/product/insert-tracking", formData, {}, true);

            if (res.status === 200) {
                toast.success(res.data.message || "Products submitted successfully 🎉");
            } else {
                toast.error(res.data.message || "Submission failed ❌");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong ❌");
        }
    };
    const onStatusSubmit = async (data: OrderStatusFormData) => {
        // setIsLoading(true);

        try {
            const payload: any = {
                order_id: orderId,
                status_id: data.status,
                remarks: data.remarks || "",
            };

            const res = await ApiHelper("POST", "/order/update-status", payload);

            if (res.status === 200) {
                getOrderTrackingData()
                toast.success(res.data.message || "Status updated successfully 🎉");
                reset();
            } else {
                toast.error(res.data.message || "Failed to update ❌");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong ❌");
        } finally {
            // setIsLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Delivering Parcel | Manage Order" description="" />
            <PageBreadcrumb pageTitle="Manage Order" />

            <div className="space-y-4 p-4">
                {/* Order Info */}
                <div className="bg-white p-4 border rounded-md">
                    <h2 className="text-lg font-semibold">
                        Manage Order – #{orderData?.request_number}
                    </h2>
                </div>

                {/* Wizard */}
                <div className="flex flex-col lg:flex-row gap-4">

                    {/* Form Wizard Section */}
                    <div className="flex-1 bg-white border rounded-md p-4 flex flex-col">
                        <h3 className="text-lg font-semibold mb-6">Order Workflow</h3>

                        {/* Stepper */}
                        <div className="flex items-center w-full mb-6">
                            {steps.map((step, index) => {
                                const isCompleted = index < currentStep;
                                const isActive = index === currentStep;

                                return (
                                    <div key={step} className="flex items-center flex-1">
                                        {/* Step Circle */}
                                        <div className="flex flex-col items-center relative z-10">
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${isCompleted ? "bg-green-600 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                                                    }`}
                                            >
                                                {isCompleted ? "✓" : index + 1}
                                            </div>
                                            <span className="text-xs mt-2 text-gray-600 text-center whitespace-nowrap">
                                                {step}
                                            </span>
                                        </div>

                                        {/* Connector */}
                                        {index !== steps.length - 1 && (
                                            <div className="flex-1 h-[2px] bg-gray-300 mx-3 relative">
                                                <div
                                                    className="absolute top-0 left-0 h-[2px] bg-green-500 transition-all"
                                                    style={{ width: isCompleted ? "100%" : "0%" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 mt-4">

                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    {/* Summary Cards */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="border-l-4 border-indigo-500 bg-indigo-50 rounded-md p-4 shadow-sm hover:shadow-md transition">
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">Service Type</p>
                                            <p className="font-semibold text-indigo-700 mt-1 text-lg">
                                                {orderData.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"}
                                            </p>
                                        </div>

                                        <div className="border-l-4 border-green-500 bg-green-50 rounded-md p-4 shadow-sm hover:shadow-md transition">
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Weight</p>
                                            <p className="font-semibold text-green-700 mt-1 text-lg">
                                                {orderData.total_aprox_weight} g
                                            </p>
                                        </div>

                                        <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-md p-4 shadow-sm hover:shadow-md transition">
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Price</p>
                                            <p className="font-semibold text-yellow-700 mt-1 text-lg">
                                                ${orderData.total_price}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="border-l-4 border-blue-500 bg-blue-50 rounded-md p-4 shadow-sm hover:shadow-md transition">
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">Ship From</p>
                                            <p className="font-medium text-blue-700 mt-1">
                                                {orderData.ship_from.city}, {orderData.ship_from.state}, {orderData.ship_from.country}
                                            </p>
                                        </div>

                                        <div className="border-l-4 border-pink-500 bg-pink-50 rounded-md p-4 shadow-sm hover:shadow-md transition">
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">Ship To</p>
                                            <p className="font-medium text-pink-700 mt-1">
                                                {orderData.ship_to.city}, {orderData.ship_to.state}, {orderData.ship_to.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && orderData?.acceptedOffer && (
                                <div className="bg-white rounded-xl shadow-md p-6 space-y-6">

                                    {/* Offer Header */}
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            Accepted Offer
                                        </h3>

                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {orderData.acceptedOffer.status}
                                        </span>
                                    </div>

                                    {/* Offer Price */}
                                    <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Offer Price</span>

                                        <span className="text-2xl font-bold text-blue-600">
                                            ${orderData.acceptedOffer.offer_price}
                                        </span>
                                    </div>

                                    {/* Shipper Info */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-700 mb-3">
                                            Shipper Information
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Name</p>
                                                <p className="font-medium">{orderData.acceptedOffer.shipper?.name}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Email</p>
                                                <p className="font-medium">{orderData.acceptedOffer.shipper?.email}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Phone</p>
                                                <p className="font-medium">{orderData.acceptedOffer.shipper?.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Prices */}
                                    {orderData.acceptedOffer.additional_prices?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">
                                                Additional Charges
                                            </h4>

                                            <div className="space-y-3">
                                                {orderData.acceptedOffer.additional_prices.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg"
                                                    >
                                                        <span className="text-gray-700 font-medium">
                                                            {item.title}
                                                        </span>

                                                        <span className="text-yellow-700 font-semibold">
                                                            ${item.price}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 2 && orderData && productStates.length > 0 && (
                                <div className="overflow-x-auto">
                                    {/* Product Table */}
                                    <table className="min-w-full border border-gray-200 divide-y divide-gray-200 rounded-md">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product Name</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product URL</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Purchase Status</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tracking Link</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tracking ID</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {orderData.products.map((detail, index) => {
                                                const state = productStates[index];
                                                const tracking = detail.product?.tracking;

                                                return (
                                                    <tr key={detail.id} className="hover:bg-gray-50">

                                                        <td className="px-4 py-3 font-medium">
                                                            {detail.product.title}
                                                        </td>

                                                        <td className="px-4 py-3 text-indigo-600">
                                                            <a
                                                                href={detail.product.product_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="underline"
                                                            >
                                                                Link
                                                            </a>
                                                        </td>

                                                        <td className="px-4 py-3">{detail.quantity}</td>

                                                        {/* Purchase Status */}
                                                        <td className="px-4 py-3">
                                                            {tracking ? (
                                                                tracking.purchase_status
                                                            ) : (
                                                                <select
                                                                    value={state.purchase_status}
                                                                    onChange={(e) =>
                                                                        handleProductChange(index, "purchase_status", e.target.value)
                                                                    }
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                >
                                                                    <option value="purchase">Purchase</option>
                                                                    <option value="not_purchase">Not Purchase</option>
                                                                </select>
                                                            )}
                                                        </td>

                                                        {/* Tracking Link */}
                                                        <td className="px-4 py-3">
                                                            {tracking ? (
                                                                tracking.tracking_link
                                                            ) : state.purchase_status === "purchase" ? (
                                                                <input
                                                                    type="text"
                                                                    placeholder="Tracking Link"
                                                                    value={state.tracking_link}
                                                                    onChange={(e) =>
                                                                        handleProductChange(index, "tracking_link", e.target.value)
                                                                    }
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>

                                                        {/* Tracking ID */}
                                                        <td className="px-4 py-3">
                                                            {tracking ? (
                                                                tracking.tracking_id
                                                            ) : state.purchase_status === "purchase" ? (
                                                                <input
                                                                    type="text"
                                                                    placeholder="Tracking ID"
                                                                    value={state.tracking_id}
                                                                    onChange={(e) =>
                                                                        handleProductChange(index, "tracking_id", e.target.value)
                                                                    }
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>

                                                        {/* Receipt */}
                                                        <td className="px-4 py-3">
                                                            {tracking ? (
                                                                <a href={tracking.product_receipt} target="_blank">
                                                                    <img
                                                                        src={tracking.product_receipt}
                                                                        alt="Product Receipt"
                                                                        className="h-16 w-16 object-cover rounded border cursor-pointer"
                                                                    />
                                                                </a>
                                                            ) : state.purchase_status === "purchase" ? (
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) =>
                                                                        handleProductChange(
                                                                            index,
                                                                            "product_receipt",
                                                                            e.target.files?.[0] || null
                                                                        )
                                                                    }
                                                                    className="border rounded-md px-2 py-1 w-full"
                                                                />
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Submit Button */}
                                    {!allTrackingExists && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={submitProducts}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="flex justify-center">
                                    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                                        <h3 className="text-lg font-semibold mb-4 text-center">
                                            Update Order Status
                                        </h3>

                                        <form onSubmit={handleSubmit(onStatusSubmit)} className="space-y-4">

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

                                                    {orderStatusOptions.map((st) => (
                                                        <option key={st.id} value={st.id} disabled={st.disabled}>
                                                            {st.name.charAt(0).toUpperCase() + st.name.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>

                                                {errors.status && (
                                                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                                                )}
                                            </div>

                                            {/* Remarks */}
                                            <div>
                                                <Label>Remarks</Label>

                                                <TextArea
                                                    placeholder="Enter remarks"
                                                    className="w-full"
                                                    {...register("remarks")}
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <div className="pt-2 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={loading || isSubmitting}
                                                    className=" px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                                >
                                                    {loading || isSubmitting ? "Updating..." : "Update Status"}
                                                </button>
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="max-w-md mx-auto p-4">
                                    <h3 className="text-lg font-semibold mb-6">Order Tracking</h3>
                                    <ul className="relative">
                                        {orderTracking.map((status, idx) => {
                                            const isCompleted = status.is_completed;
                                            const nextStatus = orderTracking[idx + 1];
                                            const isCurrent = isCompleted && !nextStatus?.is_completed;

                                            return (
                                                <li key={status.status_id} className="flex relative">
                                                    {/* Timeline: Circle + Line */}
                                                    <div className="flex flex-col items-center mr-4 relative">
                                                        {/* Circle */}
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 ${isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"}`}
                                                        >
                                                            {isCompleted ? "✓" : ""}
                                                        </div>

                                                        {/* Vertical Line */}
                                                        {idx !== orderTracking.length - 1 && (
                                                            <div
                                                                className={`absolute top-6 left-1/2 transform -translate-x-1/2 w-[2px] h-full ${isCompleted ? "bg-green-600" : "bg-gray-300"}`}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Status Info */}
                                                    <div className="pl-2 pb-6 flex-1">
                                                        <p className={`font-medium ${isCurrent ? "text-blue-600" : "text-gray-800"}`}>
                                                            {status.status_name} {isCurrent && "(Current)"}
                                                        </p>
                                                        {status.tracking && (
                                                            <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                                {status.tracking.tracking_number && (
                                                                    <p>Tracking #: {status.tracking.tracking_number}</p>
                                                                )}
                                                                {status.tracking.created_at && (
                                                                    <p>{new Date(status.tracking.created_at).toLocaleString()}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                                disabled={currentStep === 0}
                                className="px-4 py-2 border rounded-md disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
                                disabled={currentStep === steps.length - 1}
                                className="px-5 py-2 bg-blue-600 text-white rounded-md"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}