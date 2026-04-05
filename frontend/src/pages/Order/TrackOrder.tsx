import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ApiHelper } from "../../utils/ApiHelper";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import CustomDeclarationView from "./CustomDeclarationView";

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
    customDeclaration: any;
}

export default function TrackOrder() {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const steps = ["Order Detail", "Offer", "Products", "Order Tracking"];
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [orderTracking, setOrderTracking] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<number | null>(null);

    const openActionModal = (productId: number, type: number) => {
        setSelectedProductId(productId);
        setActionType(type);
        setIsActionModalOpen(true);
    };

    const handleConfirmAction = async () => {
        try {

            const payload = {
                product_id: selectedProductId,
                status: actionType,
            };

            const response = await ApiHelper("POST", "/admin/order/approve/product", payload);
            if (response.status === 200 && response.data.status) {
                toast.success(response.data.message, {
                    duration: 3000,
                    position: "top-right",
                    icon: "🎉",
                });
                fetchOrderDetails();
                setIsActionModalOpen(false)
            } else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.error(error);
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
    }, [orderId]);

    if (!orderId) return <div className="p-10 text-center">No order selected</div>;

    if (loading || !orderData)
        return <div className="p-10 text-center">Loading order details...</div>;

    const allTrackingExists = orderData?.products?.every(
        (item: any) => item.product?.tracking
    );

    return (
        <>
            <PageMeta title="Delivering Parcel | Track Order" description="" />
            <PageBreadcrumb pageTitle="Track Order" />
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

                            {currentStep === 2 && orderData && (
                                <div className="overflow-x-auto">
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
                                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600"> Action </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200">
                                            {orderData.products.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">

                                                    {/* Product Name */}
                                                    <td className="px-4 py-2 text-sm text-gray-700">
                                                        {item.product?.title}
                                                    </td>

                                                    {/* Product URL */}
                                                    <td className="px-4 py-2 text-sm">
                                                        <a
                                                            href={item.product?.product_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 underline"
                                                        >
                                                            View Product
                                                        </a>
                                                    </td>

                                                    {/* Quantity */}
                                                    <td className="px-4 py-2 text-sm text-gray-700">
                                                        {item.quantity}
                                                    </td>

                                                    {/* Purchase Status */}
                                                    <td className="px-4 py-2 text-sm">
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                                            {item.status}
                                                        </span>
                                                    </td>

                                                    {/* Tracking Link */}
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                        {item.product?.tracking?.tracking_link || "-"}
                                                    </td>

                                                    {/* Tracking ID */}
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                        {item.product?.tracking?.tracking_id || "-"}
                                                    </td>

                                                    {/* Product Receipt */}
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                        {item.product?.tracking?.product_receipt ? (

                                                            <a href={item.product.tracking.product_receipt} target="_blank">
                                                                <img
                                                                    src={item.product.tracking.product_receipt}
                                                                    alt="Product Receipt"
                                                                    className="h-16 w-16 object-cover rounded border cursor-pointer"
                                                                />
                                                            </a>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </td>
                                                    {
                                                        item?.product?.tracking &&
                                                        <td className="px-4 py-2 text-sm">
                                                            {item?.product?.tracking?.status == 0 ? (
                                                                <div className="flex gap-2">

                                                                    <button
                                                                        onClick={() => openActionModal(item.id, 1)}
                                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                                    >
                                                                        Approve
                                                                    </button>

                                                                    <button
                                                                        onClick={() => openActionModal(item.id, 2)}
                                                                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                                    >
                                                                        Reject
                                                                    </button>

                                                                </div>
                                                            ) : item?.product?.tracking?.status == 1 ? (
                                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                                    Approved
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                                    Rejected
                                                                </span>
                                                            )}
                                                        </td>
                                                    }

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {currentStep === 3 && (
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
             {
                orderData?.customDeclaration ? (
                    <CustomDeclarationView
                        data={orderData.customDeclaration}
                        orderData={orderData}
                        fetchOrderDetails={fetchOrderDetails}
                    />
                ):('')
            }
            <Modal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                className="max-w-md p-6"
            >
                <div className="text-center">

                    <h3 className="text-lg font-semibold mb-3">
                        Confirm Action
                    </h3>

                    <p className="text-gray-600 mb-6">
                        Are you sure you want to{" "}
                        <span className="font-semibold">
                            {actionType === 1 ? "approve" : "reject"}
                        </span>{" "}
                        this product?
                    </p>

                    <div className="flex justify-center gap-4">

                        <button
                            onClick={() => setIsActionModalOpen(false)}
                            className="px-4 py-2 border rounded-md"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleConfirmAction}
                            className={`px-4 py-2 text-white rounded-md ${actionType === 1
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            Confirm
                        </button>

                    </div>

                </div>
            </Modal>
        </>
    );
}
