import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

export default function ShopperTrackOrder() {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const [loading, setLoading] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [orderTracking, setOrderTracking] = useState<any[]>([]);

    const steps = ["Order Detail", "Offer", "Products", "Order Tracking"];
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                if (!orderData) return <p>Loading order...</p>;

                return (
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Order Info */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow">
                            <h3 className="text-lg font-semibold mb-3">Order Info</h3>

                            <p className="text-sm">Request #: {orderData.request_number}</p>
                            <p className="text-sm">Tracking #: {orderData.tracking_number}</p>
                            <p className="text-sm capitalize">Service: {orderData.service_type.replace("_", " ")}</p>
                        </div>

                        {/* Price Info */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold mb-3">Pricing</h3>

                            <p className="text-sm">Total Price</p>
                            <p className="text-2xl font-bold text-green-600">${orderData.total_price}</p>

                            <p className="text-sm mt-2">Total Weight</p>
                            <p className="font-medium">{orderData.total_weight} kg</p>
                        </div>

                        {/* Shipping */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm">
                            <h3 className="font-semibold mb-3">Shipping</h3>

                            <p className="text-sm">
                                <span className="font-medium">From:</span>{" "}
                                {orderData.ship_from?.city}, {orderData.ship_from?.country}
                            </p>

                            <p className="text-sm mt-2">
                                <span className="font-medium">To:</span>{" "}
                                {orderData.ship_to?.city}, {orderData.ship_to?.country}
                            </p>
                        </div>

                        {/* Services */}
                        <div className="bg-white border rounded-xl p-5 shadow-sm md:col-span-3">
                            <h3 className="font-semibold mb-3">Services</h3>

                            {orderData.services?.map((service: any) => (
                                <div
                                    key={service.service_id}
                                    className="flex justify-between py-2 border-b text-sm"
                                >
                                    <span>{service.title}</span>
                                    <span className="font-medium">${service.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 1:
                if (!orderData?.acceptedOffer) {
                    return <p className="text-gray-500">No offer accepted yet.</p>;
                }

                const offer = orderData.acceptedOffer;

                return (
                    <div className="max-w-xl mx-auto">

                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">

                            <h3 className="text-xl font-semibold mb-4">Accepted Offer</h3>

                            {/* Main Offer Price */}
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm">Offer Price</span>
                                <span className="text-2xl font-bold">${offer.offer_price}</span>
                            </div>

                            {/* Additional Prices */}
                            {offer.additional_prices?.length > 0 && (
                                <div className="bg-white/20 rounded-lg p-4 backdrop-blur mb-4">

                                    <h4 className="font-semibold text-sm mb-3">
                                        Additional Charges
                                    </h4>

                                    {offer.additional_prices.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex justify-between text-sm py-1 border-b border-white/30 last:border-none"
                                        >
                                            <span>{item.title}</span>
                                            <span>${item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Shipper Info */}
                            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">

                                <p className="text-sm">
                                    <span className="font-semibold">Shipper:</span>{" "}
                                    {offer.shipper?.name}
                                </p>

                                <p className="text-sm">
                                    <span className="font-semibold">Email:</span>{" "}
                                    {offer.shipper?.email}
                                </p>

                                <p className="text-sm">
                                    <span className="font-semibold">Phone:</span>{" "}
                                    {offer.shipper?.phone}
                                </p>

                                <p className="text-xs mt-3 opacity-80">
                                    Accepted at {new Date(offer.updated_at).toLocaleString()}
                                </p>

                            </div>

                        </div>

                    </div>
                );
            case 2:
                if (!orderData?.products?.length) {
                    return <p>No products found.</p>;
                }

                return (
                    <div className="overflow-x-auto">

                        <table className="min-w-full border rounded-lg overflow-hidden">

                            <thead className="bg-gray-100 text-left text-sm">
                                <tr>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Purchase Status</th>
                                    <th className="p-3">Tracking ID</th>
                                    <th className="p-3">Tracking Link</th>
                                    <th className="p-3">Receipt</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm">

                                {orderData.products.map((item: any) => {
                                    const tracking = item.product?.approved_product_tracking;

                                    return (
                                        <tr key={item.id} className="border-t">

                                            <td className="p-3 font-medium">
                                                {item.product?.title}
                                            </td>

                                            <td className="p-3">
                                                {tracking?.purchase_status || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {tracking?.tracking_id || "N/A"}
                                            </td>

                                            <td className="p-3">
                                                {tracking?.tracking_link ? (
                                                    <a
                                                        href={tracking.tracking_link}
                                                        target="_blank"
                                                        className="text-blue-600 underline"
                                                    >
                                                        Track
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {tracking?.product_receipt ? (
                                                    <a href={tracking.product_receipt} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={tracking.product_receipt}
                                                            alt="Product Receipt"
                                                            className="w-20 h-20 object-cover rounded border shadow-sm hover:scale-105 transition-transform"
                                                        />
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>

                    </div>
                );
            case 3:
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-8">Order Tracking</h3>

                        {orderTracking.length === 0 ? (
                            <p className="text-gray-500 text-sm">No tracking updates available.</p>
                        ) : (
                            <ul className="relative border-l-2 border-gray-200 ml-3">
                                {orderTracking.map((status: any, idx: number) => {
                                    const isCompleted = status.is_completed;
                                    const nextStatus = orderTracking[idx + 1];
                                    const isCurrent = isCompleted && !nextStatus?.is_completed;

                                    return (
                                        <li key={status.status_id} className="mb-8 ml-6">

                                            {/* Circle */}
                                            <span
                                                className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white
                                    ${isCompleted
                                                        ? isCurrent
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-green-600 text-white"
                                                        : "bg-gray-300"
                                                    }`}
                                            >
                                                {!isCurrent && isCompleted ? "✓" : ""}
                                            </span>

                                            {/* Status Title */}
                                            <h4
                                                className={`font-semibold text-sm ${isCurrent ? "text-blue-600" : "text-gray-800"
                                                    }`}
                                            >
                                                {status.status_name} {isCurrent && "(Current)"}
                                            </h4>

                                            {/* Tracking Info */}
                                            {status.tracking && (
                                                <div className="mt-2 bg-gray-50 p-3 rounded-lg border text-xs text-gray-600">
                                                    {status.tracking.tracking_number && (
                                                        <p>
                                                            <span className="font-medium">Tracking #:</span>{" "}
                                                            {status.tracking.tracking_number}
                                                        </p>
                                                    )}

                                                    {status.tracking.created_at && (
                                                        <p>
                                                            <span className="font-medium">Updated:</span>{" "}
                                                            {new Date(
                                                                status.tracking.created_at
                                                            ).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const fetchOrderDetails = async () => {
        if (!orderId) return;

        setLoading(true);
        try {
            // Fetch full order details
            const orderRes = await ApiHelper("GET", `/shopper/order/get-order-detail/${orderId}`);
            if (orderRes.status === 200) {
                setOrderData(orderRes.data.data);
            } else {
                toast.error(orderRes.data.message || "Failed to fetch order");
            }

            // Fetch order tracking details
            const trackingRes = await ApiHelper("GET", `/order/get-order-tracking/${orderId}`);
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

    return (
        <>
            <PageMeta title="Delivering Parcel | Track Order" description="" />
            <PageBreadcrumb pageTitle="Track Order" />

            <div className="bg-white p-6 rounded-xl shadow-md">

                {/* Stepper */}
                <div className="flex items-center justify-between mb-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center relative">

                            {/* Circle */}
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                                ${index <= currentStep
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 text-gray-400"
                                    }`}
                            >
                                {index + 1}
                            </div>

                            {/* Label */}
                            <span className="text-sm mt-2">{step}</span>

                            {/* Line */}
                            {index !== steps.length - 1 && (
                                <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-200 -z-10"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[200px] mb-6">
                    {renderStepContent()}
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={currentStep === steps.length - 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}