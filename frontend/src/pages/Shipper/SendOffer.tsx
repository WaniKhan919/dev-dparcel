import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import useOrderDetail from "../../hooks/useOrderDetail";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

interface AdditionalService {
    title: string;
    price: string;
}

interface ValidationErrors {
    offerPrice?: string;
    servicePrices?: Record<number, string>;
    additionalServices?: Record<number, { title?: string; price?: string }>;
}

export default function SendOffer() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;
    const { order: orderData, loading, error } = useOrderDetail(String(orderId));

    const [servicePrices, setServicePrices] = useState<Record<number, string>>({});
    const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([{ title: "", price: "" }]);
    const [offerPrice, setOfferPrice] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const productsTotal = useMemo(() => {
        if (!orderData?.products) return 0;
        return orderData.products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);
    }, [orderData]);

    const servicesTotal = useMemo(() => {
        return Object.values(servicePrices).reduce((sum, p) => sum + (Number(p) || 0), 0);
    }, [servicePrices]);

    const additionalTotal = useMemo(() => {
        return additionalServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    }, [additionalServices]);

    const overallTotal = useMemo(() => {
        const base = orderData?.shipping_type?.slug === "buy_for_me" ? productsTotal : 0;
        return base + servicesTotal + additionalTotal + (Number(offerPrice) || 0);
    }, [productsTotal, servicesTotal, additionalTotal, offerPrice, orderData]);
    const [checkedServices, setCheckedServices] = useState<Record<number, boolean>>({});

    const handleServiceCheck = (serviceId: number, checked: boolean) => {
        setCheckedServices(prev => ({ ...prev, [serviceId]: checked }));
        if (!checked) {
            // Uncheck hone py price aur error clear karo
            setServicePrices(prev => ({ ...prev, [serviceId]: "" }));
            setErrors(prev => ({
                ...prev,
                servicePrices: { ...prev.servicePrices, [serviceId]: "" }
            }));
        }
    };

    const handleServicePrice = (serviceId: number, value: string) => {
        setServicePrices(prev => ({ ...prev, [serviceId]: value }));
        setErrors(prev => ({
            ...prev,
            servicePrices: { ...prev.servicePrices, [serviceId]: "" }
        }));
    };

    const handleAdditionalChange = (index: number, field: keyof AdditionalService, value: string) => {
        setAdditionalServices(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddMore = () => {
        setAdditionalServices(prev => [...prev, { title: "", price: "", checked: false }]);
    };

    const handleRemoveAdditional = (index: number) => {
        setAdditionalServices(prev => prev.filter((_, i) => i !== index));
        setErrors(prev => {
            const updated = { ...prev.additionalServices };
            delete updated[index];
            return { ...prev, additionalServices: updated };
        });
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // Offer price required
        if (!offerPrice || Number(offerPrice) <= 0) {
            newErrors.offerPrice = "Offer price is required and must be greater than 0";
            isValid = false;
        }

        // Each selected service must have a price
        const servicePriceErrors: Record<number, string> = {};
        orderData?.services.forEach(service => {
            if (!checkedServices[service.service_id]) return;
            const price = servicePrices[service.service_id];
            if (!price || Number(price) <= 0) {
                servicePriceErrors[service.service_id] = "Price is required";
                isValid = false;
            }
        });
        if (Object.keys(servicePriceErrors).length > 0) {
            newErrors.servicePrices = servicePriceErrors;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        const services = [
            ...Object.entries(servicePrices).filter(([serviceId]) => checkedServices[Number(serviceId)]).map(([serviceId, price]) => ({
                service_id: Number(serviceId),
                price: Number(price),
            })),
            ...additionalServices
                .filter(s => s.title.trim() && s.price)
                .map(s => ({ title: s.title, price: Number(s.price) })),
        ];

        setSubmitting(true);
        try {
            const res = await ApiHelper("POST", `/shipper/send/request`, {
                order_id: orderId,
                offer_price: Number(offerPrice),
                services,
            });

            if (res.status === 200 || res.status === 201) {
                toast.success("Offer sent successfully!");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send offer");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-10 h-10 border-4 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500">Failed to load order details.</p>
            </div>
        );
    }

    const isBuyForMe = orderData.shipping_type?.slug === "buy_for_me";

    return (
        <>
            <PageMeta title="Send Offer" description="International Package and mail Forwarding Services" />

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Send Offer</h1>
                            <p className="text-xs text-gray-500 mt-1">Request #{orderData.request_number}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isBuyForMe ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
                            }`}>
                            {orderData.shipping_type?.title}
                        </span>
                    </div>
                    <div className="border-t"></div>
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-gray-400 text-xs">From</p>
                            <p className="font-medium text-gray-800">{orderData.ship_from.city}, {orderData.ship_from.country}</p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 px-2">
                            <span className="text-base">✈️</span>
                            <span className="text-xs text-gray-400 hidden sm:block">Shipping</span>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-xs">To</p>
                            <p className="font-medium text-gray-800">{orderData.ship_to.city}, {orderData.ship_to.country}</p>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-800">Products</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="text-left px-4 py-3">Product Name</th>
                                    <th className="text-left px-4 py-3">URL</th>
                                    <th className="text-center px-4 py-3">Qty</th>
                                    <th className="text-right px-4 py-3">Price/Unit</th>
                                    <th className="text-right px-4 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderData.products.map((item, index) => {
                                    const price = Number(item.price);
                                    const qty = Number(item.quantity);
                                    return (
                                        <tr key={index} className="border-t">
                                            <td className="px-4 py-3 font-medium text-gray-800">{item.product.title}</td>
                                            <td className="px-4 py-3">
                                                <a href={item.product.product_url} target="_blank" rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-xs">View</a>
                                            </td>
                                            <td className="px-4 py-3 text-center">{qty}</td>
                                            <td className="px-4 py-3 text-right">${price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-semibold">${(price * qty).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {isBuyForMe && (
                                <tfoot>
                                    <tr className="bg-gray-50 border-t font-semibold">
                                        <td colSpan={4} className="px-4 py-3 text-right text-gray-700">Products Total</td>
                                        <td className="px-4 py-3 text-right text-green-600">${productsTotal.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Services */}
                {orderData.services?.length > 0 && (
                    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-gray-800">Services</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Check the services you want to offer price for
                            </p>
                        </div>
                        <div className="p-4 space-y-4">
                            {orderData.services.map((service) => {
                                const hasError = !!errors.servicePrices?.[service.service_id];
                                const isChecked = !!checkedServices[service.service_id];

                                return (
                                    <div key={service.service_id}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => handleServiceCheck(service.service_id, e.target.checked)}
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{service.title}</p>
                                                    <p className="text-xs text-gray-400">{service.description}</p>
                                                </div>
                                            </div>

                                            {/* Price Input */}
                                            <div className="relative w-36">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0.00"
                                                    disabled={!isChecked}
                                                    value={servicePrices[service.service_id] ?? ""}
                                                    onChange={(e) => handleServicePrice(service.service_id, e.target.value)}
                                                    className={`w-full border rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${!isChecked
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                                        : hasError
                                                            ? "border-red-400 focus:ring-red-400 bg-red-50"
                                                            : "border-gray-200 bg-gray-50 focus:ring-blue-500 focus:bg-white"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        {isChecked && hasError && (
                                            <p className="text-red-500 text-xs mt-1 text-right">
                                                {errors.servicePrices?.[service.service_id]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Additional Services */}
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-gray-800">Additional Services</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Check a service to include it — price required for checked ones
                            </p>
                        </div>
                        <button onClick={handleAddMore} className="text-sm text-blue-600 font-medium hover:underline">
                            + Add More
                        </button>
                    </div>
                    <div className="p-4 space-y-4">
                        {additionalServices.map((service, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Service name"
                                    value={service.title}
                                    onChange={(e) => handleAdditionalChange(index, "title", e.target.value)}
                                    className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-200"
                                />
                                <div className="relative w-36">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0.00"
                                        value={service.price}
                                        onChange={(e) => handleAdditionalChange(index, "price", e.target.value)}
                                        className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveAdditional(index)}
                                    className="text-red-400 hover:text-red-600 text-lg font-bold flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offer Price + Summary */}
                <div className="bg-white border rounded-2xl shadow-md p-6 space-y-4">
                    <h3 className="font-semibold text-gray-800">Your Offer</h3>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                Main Offer Price <span className="text-red-500">*</span>
                            </p>
                            <p className="text-xs text-gray-400">Your base shipping/service charge</p>
                        </div>
                        <div className="w-44">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0.00"
                                    value={offerPrice}
                                    onChange={(e) => {
                                        setOfferPrice(e.target.value);
                                        setErrors(prev => ({ ...prev, offerPrice: "" }));
                                    }}
                                    className={`w-full border rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${errors.offerPrice
                                        ? "border-red-400 focus:ring-red-400 bg-red-50"
                                        : "focus:ring-blue-500"
                                        }`}
                                />
                            </div>
                            {errors.offerPrice && (
                                <p className="text-red-500 text-xs mt-1">{errors.offerPrice}</p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                        {isBuyForMe && (
                            <div className="flex justify-between text-gray-500">
                                <span>Products Total</span>
                                <span>${productsTotal.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                            <span>Services Total</span>
                            <span>${servicesTotal.toFixed(2)}</span>
                        </div>
                        {additionalTotal > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Additional Services</span>
                                <span>${additionalTotal.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                            <span>Offer Price</span>
                            <span>${(Number(offerPrice) || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-green-600">${overallTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Sending..." : "Send Offer"}
                </button>

            </div>
        </>
    );
}