import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { fetchCountries } from "../../slices/countriesSlice";
import { fetchStates } from "../../slices/statesSlice";
import { fetchCities } from "../../slices/citiesSlice";
import CustomDeclarationView from "../Order/CustomDeclarationView";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/ui/dropdown/Select";

interface FormValues {
    to_name: string;
    to_business: string;
    to_street: string;
    to_postcode: string;
    to_country: number;
    to_state: number;
    to_city: number;

    category_commercial_sample?: boolean;
    category_gift?: boolean;
    category_returned_goods?: boolean;
    category_documents?: boolean;
    category_other?: boolean;

    explanation?: string;
    comments?: string;

    total_declared_value?: number;
    total_weight?: number;
    products?: any,
}

const validationSchema: Yup.ObjectSchema<FormValues> = Yup.object({
    to_name: Yup.string().required("Name is required"),
    to_business: Yup.string().required("Business is required"),
    to_street: Yup.string().required("Address is required"),
    to_postcode: Yup.string().required("Postcode is required"),

    to_country: Yup.number().required("Country is required"),
    to_state: Yup.number().required("State is required"),
    to_city: Yup.number().required("City is required"),

    category_commercial_sample: Yup.boolean().optional(),
    category_gift: Yup.boolean().optional(),
    category_returned_goods: Yup.boolean().optional(),
    category_documents: Yup.boolean().optional(),
    category_other: Yup.boolean().optional(),

    explanation: Yup.string().optional(),
    comments: Yup.string().optional(),

    total_declared_value: Yup.number().optional(),
    total_weight: Yup.number().optional(),
    products: Yup.array(
        Yup.object({
            hs_code: Yup.string().required("HS Tariff Number is required"),
            origin_country: Yup.string().optional(),
        })
    ).optional(),
});


export default function ShopperTrackOrder() {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const [loading, setLoading] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [orderTracking, setOrderTracking] = useState<any[]>([]);

    const steps = ["Order Detail", "Offer", "Products", "Order Tracking"];
    const [currentStep, setCurrentStep] = useState(0);

    const [step, setStep] = useState(1);
    const stepRef = useRef(step);
    const [showForm, setShowForm] = useState(false);
    const dispatch = useDispatch<any>();

    const { data: countries } = useSelector((state: any) => state.countries);
    const { data: states } = useSelector((state: any) => state.states);
    const { data: cities } = useSelector((state: any) => state.cities);


    const {
        register,
        handleSubmit,
        setValue,
        trigger,
        control,
        reset,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            to_country: 0,
            to_state: 0,
            to_city: 0,
            products: orderData?.products?.map(() => ({ hs_code: "", origin_country: "" })) || [],

        },
        mode: "onBlur",
    });

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
                if (!orderData) {
                    return (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="ml-3 text-gray-500 text-sm">Loading order...</p>
                        </div>
                    );
                }

                return (
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Order Info */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow">
                            <h3 className="text-lg font-semibold mb-3">Order Info</h3>

                            <p className="text-sm">Request #: {orderData.request_number}</p>
                            <p className="text-sm capitalize">
                                Service: {orderData.service_type == "shipe_for_me" ? "Ship For Me" : "Buy For Me"}
                            </p>
                        </div>

                        {/* Price Info (🔥 UPDATED) */}
                        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between h-full">

                            {/* Header */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Pricing</h3>

                                {/* Total Payable */}
                                <div className="flex items-end justify-between">
                                    <p className="text-sm text-gray-500">Total Payable</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ${orderData.price_breakdown?.total_payable ?? orderData.total_price}
                                    </p>
                                </div>

                                {/* Breakdown */}
                                <div className="mt-1 space-y-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg p-1">

                                    {orderData.service_type === "buy_for_me" && (
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${orderData.price_breakdown?.initial_total ?? 0}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>${orderData.price_breakdown?.shipper_total ?? 0}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Additional</span>
                                        <span>${orderData.price_breakdown?.shipper_additional_charges ?? 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Weight</span>
                                    <span className="font-medium text-gray-800">
                                        {orderData.total_weight} g
                                    </span>
                                </div>
                            </div>

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
                const breakdown = orderData.price_breakdown;

                return (
                    <div className="max-w-xl mx-auto">

                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">

                            <h3 className="text-xl font-semibold mb-4">Accepted Offer</h3>

                            {/* Offer Price */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm">Offer Price</span>
                                <span className="text-2xl font-bold">
                                    ${breakdown?.shipper_offer_price}
                                </span>
                            </div>

                            {/* Additional Charges */}
                            {offer.additional_prices?.length > 0 && (
                                <div className="bg-white/20 rounded-lg p-4 backdrop-blur mb-4">

                                    <h4 className="font-semibold text-sm mb-3">
                                        Additional Charges
                                    </h4>

                                    {offer.additional_prices.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm py-1 border-b border-white/30 last:border-none"
                                        >
                                            <span>{item.title}</span>
                                            <span>${item.price}</span>
                                        </div>
                                    ))}

                                    {/* Shown from backend */}
                                    <div className="flex justify-between text-sm pt-2 font-semibold">
                                        <span>Total Shipping</span>
                                        <span>${breakdown?.shipper_total}</span>
                                    </div>

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

                            {/* FINAL TOTAL 🔥 */}
                            <div className="mt-4 border-t border-white/30 pt-3 flex justify-between font-bold text-lg">
                                <span>Total Payable</span>
                                <span>${breakdown?.total_payable}</span>
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

    useEffect(() => {
        dispatch(fetchCountries());
    }, [dispatch]);

    useEffect(() => {
        stepRef.current = step;
    }, [step]);

    const fetchCustomDeclaration = async () => {
        try {
            const response = await ApiHelper("GET", `/order/get-order-detail/${orderId}`);
            if (response.status === 200) {
                setOrderData(response.data.data);
                if (response.data.data?.customDeclaration) {
                    setShowForm(false);
                } else {
                    setShowForm(true);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch order details:", error);
        }
    };

    useEffect(() => {
        fetchCustomDeclaration();
    }, []);

    // ✅ This prevents auto submit when step 5 loads
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        if (stepRef.current < 3) return;
        if (step < 3) return;
        try {
            const payload = {
                ...data,
                order_id: orderId,
                shipping_type_id: orderData?.service_type === "buy_for_me" ? 1 : 2,

                // ✅ orderData products se id map karo
                products: orderData?.products?.map((item: any, index: number) => ({
                    id: item.product_id ?? item.id,
                    hs_code: data.products?.[index]?.hs_code ?? "",
                    origin_country: data.products?.[index]?.origin_country ?? "",
                })),
            };
            const res = await ApiHelper("POST", "/custom-declaration/store", payload);
            if (res.status === 200 && res.data.success) {

                toast.success("Custom Declaration submitted successfully!");
                fetchCustomDeclaration();
            } else {
                toast.error(res.data.message);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create declaration.");
        }
    };

    // ✅ Step validation only when Next is clicked
    const customDeclerationNextStep = async () => {
        let fieldsToValidate: (keyof FormValues)[] = [];

        switch (step) {
            case 1:
                fieldsToValidate = ["to_name", "to_business", "to_street", "to_postcode", "to_country", "to_state", "to_city"];
                break;
            case 2:
                const isValidStep2 = await trigger("products");
                if (isValidStep2) {
                    stepRef.current = 3; // ✅ pehle ref update karo
                    // setStep(3);
                    break;
                }
                return ;
            case 3:
                break;
        }

        const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (isValid) {
            setStep((prev) => Math.min(prev + 1, 3));
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    };

    useEffect(() => {
        if (!orderData) return;

        const declaration = orderData.customDeclaration;

        reset({
            to_name: declaration?.to_name || "",
            to_business: declaration?.to_business || "",
            to_street: declaration?.to_street || "",
            to_postcode: declaration?.to_postcode || "",
            to_country: declaration?.to_country?.id || 0,
            to_state: declaration?.to_state?.id || 0,
            to_city: declaration?.to_city?.id || 0,

            category_commercial_sample: declaration?.category_commercial_sample || false,
            category_gift: declaration?.category_gift || false,
            category_returned_goods: declaration?.category_returned_goods || false,
            category_documents: declaration?.category_documents || false,
            category_other: declaration?.category_other || false,

            explanation: declaration?.explanation || "",
            comments: declaration?.comments || "",

            total_declared_value: declaration?.total_declared_value || 0,
            total_weight: declaration?.total_weight || 0,
            products: orderData.products?.map(() => ({
                hs_code: "",
                origin_country: "",
            })) || [],
        });

        if (declaration?.to_country?.id) dispatch(fetchStates(declaration.to_country.id));
        if (declaration?.to_state?.id) dispatch(fetchCities(declaration.to_state.id));

    }, [orderData]); // ✅ sirf orderData pe depend karo
    const customDeclerationPrevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <button
                        type="button"
                        onClick={nextStep}
                        disabled={currentStep === steps.length - 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            {
                orderData?.customDeclaration && !showForm ? (
                    <CustomDeclarationView
                        data={orderData.customDeclaration}
                        orderData={orderData}
                    />
                ) :
                    (

                        orderData && orderData?.status > 5 ?
                            (
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">

                                    {/* 🔥 HEADER */}
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Custom Declaration
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Fill the required details for customs processing
                                            </p>
                                        </div>

                                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                            CN22 / CN23
                                        </span>
                                    </div>
                                    {/* Stepper */}
                                    <div className="flex justify-between items-center mb-10 relative">
                                        {["To", "Products", "Declaration"].map((label, index) => (
                                            <div key={index} className="flex-1 flex flex-col items-center relative">

                                                {index !== 4 && (
                                                    <div
                                                        className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 transition-all  ${step > index + 1 ? "bg-blue-600" : "bg-gray-200"}`}
                                                    />
                                                )}

                                                <div
                                                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${step > index + 1
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : step === index + 1
                                                            ? "border-blue-600 text-blue-600 bg-white"
                                                            : "border-gray-300 text-gray-400"
                                                        }`}
                                                >
                                                    {step > index + 1 ? "✓" : index + 1}
                                                </div>

                                                <span
                                                    className={`mt-2 text-xs font-medium text-center 
                    ${step >= index + 1 ? "text-blue-600" : "text-gray-400"}`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={step === 3 ? handleSubmit(onSubmit) : (e) => e.preventDefault()} className="space-y-10">
                                        {/* STEP 1 */}
                                        {step === 1 && (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <Label>Name</Label>
                                                        <Input type="text" {...register("to_name")} />
                                                        <p className="text-red-500 text-sm">
                                                            {errors.to_name?.message}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label>Business</Label>
                                                        <Input type="text" {...register("to_business")} />
                                                        <p className="text-red-500 text-sm">
                                                            {errors.to_business?.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <Label>Address</Label>
                                                        <Input type="text" {...register("to_street")} />
                                                        <p className="text-red-500 text-sm">
                                                            {errors.to_street?.message}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label>Postcode</Label>
                                                        <Input type="text" {...register("to_postcode")} />
                                                        <p className="text-red-500 text-sm">
                                                            {errors.to_postcode?.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                                                    {/* COUNTRY */}
                                                    <div>
                                                        <Controller
                                                            name="to_country"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select<number>
                                                                    label="Country"
                                                                    options={countries?.map((c: any) => ({
                                                                        value: c.id,
                                                                        label: c.name,
                                                                    })) || []}
                                                                    value={field.value ? Number(field.value) : null}
                                                                    onChange={(val: any) => {
                                                                        field.onChange(val);
                                                                        setValue("to_country", val);
                                                                        setValue("to_state", 0);
                                                                        setValue("to_city", 0);

                                                                        if (val) {
                                                                            dispatch(fetchStates(val));
                                                                        }
                                                                    }}
                                                                    placeholder="Country"
                                                                    error={errors.to_country?.message as string}
                                                                    clearable
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* STATE */}
                                                    <div>
                                                        <Controller
                                                            name="to_state"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select<number>
                                                                    label="State"
                                                                    options={states?.map((s: any) => ({
                                                                        value: s.id,
                                                                        label: s.name,
                                                                    })) || []}
                                                                    value={field.value ? Number(field.value) : null}
                                                                    onChange={(val: any) => {
                                                                        field.onChange(val);
                                                                        setValue("to_state", val);
                                                                        setValue("to_city", 0);

                                                                        if (val) {
                                                                            dispatch(fetchCities(val));
                                                                        }
                                                                    }}
                                                                    placeholder="State"
                                                                    error={errors.to_state?.message as string}
                                                                    clearable
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* CITY */}
                                                    <div>
                                                        <Controller
                                                            name="to_city"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select<number>
                                                                    label="City"
                                                                    options={cities?.map((city: any) => ({
                                                                        value: city.id,
                                                                        label: city.name,
                                                                    })) || []}
                                                                    value={field.value ? Number(field.value) : null}
                                                                    onChange={(val: any) => {
                                                                        field.onChange(val);
                                                                        setValue("to_city", val);
                                                                    }}
                                                                    placeholder="City"
                                                                    error={errors.to_city?.message as string}
                                                                    clearable
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                </div>
                                            </>
                                        )}

                                        {/* STEP 2 */}
                                        {step === 2 && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Product Details</h3>

                                                {orderData && orderData.products.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full border border-gray-300 rounded-lg">
                                                            <thead className="bg-gray-100">

                                                                {/* 🔥 TOP HEADER ROW */}
                                                                <tr>
                                                                    <th className="px-4 py-2 border" rowSpan={2}>Product Name</th>
                                                                    <th className="px-4 py-2 border" rowSpan={2}>Quantity</th>
                                                                    <th className="px-4 py-2 border" rowSpan={2}>Price</th>
                                                                    <th className="px-4 py-2 border" rowSpan={2}>Weight</th>
                                                                    <th className="px-4 py-2 border" rowSpan={2}>Total Price</th>

                                                                    {/* 🔥 GROUP HEADER */}
                                                                    <th className="px-4 py-2 border text-center" colSpan={2}>
                                                                        For commercial items only
                                                                    </th>
                                                                </tr>

                                                                {/* 🔥 SUB HEADER */}
                                                                <tr>
                                                                    <th className="px-4 py-2 border">HS Tariff Number</th>
                                                                    <th className="px-4 py-2 border">Country of Origin</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {orderData.products.map((item: any, index: number) => {
                                                                    const totalPrice = Number(item.price) * Number(item.quantity);

                                                                    return (
                                                                        <tr key={item.id} className="text-center">

                                                                            <td className="px-4 py-2 border">
                                                                                {item.product?.title}
                                                                            </td>

                                                                            <td className="px-4 py-2 border">{item.quantity}</td>

                                                                            <td className="px-4 py-2 border">{item.price}</td>

                                                                            <td className="px-4 py-2 border">
                                                                                {item.weight} g
                                                                            </td>

                                                                            <td className="px-4 py-2 border">
                                                                                ${totalPrice}
                                                                            </td>

                                                                            {/* HS CODE */}
                                                                            <td className="px-3 py-2 border">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="HS Code"
                                                                                    {...register(`products.${index}.hs_code`)}
                                                                                    className="border rounded px-2 py-1 text-xs w-full"
                                                                                />
                                                                                {(errors.products as any)?.[index]?.hs_code && (
                                                                                    <p className="text-red-500 text-xs mt-1">
                                                                                        {(errors.products as any)[index].hs_code.message}
                                                                                    </p>
                                                                                )}
                                                                            </td>

                                                                            {/* ORIGIN */}
                                                                            <td className="px-3 py-2 border">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Country"
                                                                                    {...register(`products.${index}.origin_country`)}
                                                                                    className="border rounded px-2 py-1 text-xs w-full"
                                                                                />
                                                                            </td>

                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>

                                                            {/* 🔥 FOOTER */}
                                                            <tfoot>
                                                                <tr className="bg-gray-50 font-semibold">
                                                                    <td colSpan={3} className="px-4 py-2 border text-right">
                                                                        Total:
                                                                    </td>

                                                                    {/* TOTAL WEIGHT */}
                                                                    <td className="px-4 py-2 border">
                                                                        {orderData.products.reduce(
                                                                            (sum: number, item: any) =>
                                                                                sum + (Number(item.weight || 0) * Number(item.quantity || 1)),
                                                                            0
                                                                        )}{" "}
                                                                        g
                                                                    </td>

                                                                    {/* TOTAL VALUE */}
                                                                    <td className="px-4 py-2 border">
                                                                        $
                                                                        {orderData.products.reduce(
                                                                            (sum: number, item: any) =>
                                                                                sum + Number(item.price) * Number(item.quantity),
                                                                            0
                                                                        )}
                                                                    </td>

                                                                    <td className="border"></td>
                                                                    <td className="border"></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">No product details found.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* STEP 3 */}
                                        {step === 3 && (
                                            <div className="space-y-6">

                                                {/* Category */}
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                                        Category of item
                                                    </h3>

                                                    <div className="flex flex-wrap gap-3">
                                                        {[
                                                            { label: "Commercial Sample", name: "category_commercial_sample" },
                                                            { label: "Gift", name: "category_gift" },
                                                            { label: "Returned Goods", name: "category_returned_goods" },
                                                            { label: "Documents", name: "category_documents" },
                                                            { label: "Other", name: "category_other" },
                                                        ].map((item) => (
                                                            <label key={item.name} className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                                                                <input type="checkbox" {...register(item.name as any)} />
                                                                <span className="text-sm">{item.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Explanation */}
                                                <div>
                                                    <Label>Explanation</Label>
                                                    <textarea {...register("explanation")} rows={3} className="w-full border p-3 rounded-lg" />
                                                </div>

                                                {/* Comments */}
                                                <div>
                                                    <Label>Comments</Label>
                                                    <textarea {...register("comments")} rows={3} className="w-full border p-3 rounded-lg" />
                                                </div>

                                            </div>
                                        )}
                                        {/* Buttons */}
                                        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">

                                            {step > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={customDeclerationPrevStep}
                                                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
                                                >
                                                    Previous
                                                </button>
                                            ) : <div />}

                                            {step < 3 ? (
                                                <button
                                                    type="button"
                                                    onClick={customDeclerationNextStep}
                                                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
                                                >
                                                    Next
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition"
                                                >
                                                    {isSubmitting ? "Submitting..." : "Submit"}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                            ) : (
                                ''
                            )


                    )
            }
        </>
    );
}