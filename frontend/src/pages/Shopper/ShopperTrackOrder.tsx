import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
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
    from_name: string;
    from_business: string;
    from_street: string;
    from_postcode: string;
    from_country: string;
    from_state: string;
    from_city: string;
    to_name: string;
    to_business: string;
    to_street: string;
    to_postcode: string;
    to_country: string;
    to_state: string;
    to_city: string;
    importer_reference?: string;
    importer_contact?: string;
    category_commercial_sample?: boolean;
    category_gift?: boolean;
    category_returned_goods?: boolean;
    category_documents?: boolean;
    category_other?: boolean;
    explanation?: string;
    comments?: string;
    office_origin_posting?: string;
    doc_licence?: boolean;
    doc_certificate?: boolean;
    doc_invoice?: boolean;
}

const validationSchema: Yup.ObjectSchema<FormValues> = Yup.object({
    from_name: Yup.string().required("Name is required"),
    from_business: Yup.string().required("Business is required"),
    from_street: Yup.string().required("Street is required"),
    from_postcode: Yup.string().required("Postcode is required"),
    from_country: Yup.string().required("Country is required"),
    from_state: Yup.string().required("State is required"),
    from_city: Yup.string().required("City is required"),
    to_name: Yup.string().required("Name is required"),
    to_business: Yup.string().required("Business is required"),
    to_street: Yup.string().required("Street is required"),
    to_postcode: Yup.string().required("Postcode is required"),
    to_country: Yup.string().required("Country is required"),
    to_state: Yup.string().required("State is required"),
    to_city: Yup.string().required("City is required"),
    importer_reference: Yup.string().optional(),
    importer_contact: Yup.string().optional(),
    category_commercial_sample: Yup.boolean().optional(),
    category_gift: Yup.boolean().optional(),
    category_returned_goods: Yup.boolean().optional(),
    category_documents: Yup.boolean().optional(),
    category_other: Yup.boolean().optional(),
    explanation: Yup.string().optional(),
    comments: Yup.string().optional(),
    office_origin_posting: Yup.string().optional(),
    doc_licence: Yup.boolean().optional(),
    doc_certificate: Yup.boolean().optional(),
    doc_invoice: Yup.boolean().optional(),
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
    const [showForm, setShowForm] = useState(false);
    const dispatch = useDispatch<any>();

    const { data: countries } = useSelector((state: any) => state.countries);
    const reduxStates = useSelector((state: any) => state.states.data);
    const reduxCities = useSelector((state: any) => state.cities.data);
    const [customDecleration, setCustomDecleration] = useState<any>(null);
    const { order_id } = location.state || {};
    
    const [activeType, setActiveType] = useState<"from" | "to" | null>(null);

    const [fromStates, setFromStates] = useState<any[]>([]);
    const [toStates, setToStates] = useState<any[]>([]);

    const [fromCities, setFromCities] = useState<any[]>([]);
    const [toCities, setToCities] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        trigger,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        mode: "onBlur",
        defaultValues: {
            from_country: "null",
            from_state: "null",
            from_city: "null",
        }
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

    useEffect(() => {
        dispatch(fetchCountries());
    }, [dispatch]);

    useEffect(() => {
        if (!reduxStates) return;

        if (activeType === "from") {
            setFromStates(reduxStates);
        } else if (activeType === "to") {
            setToStates(reduxStates);
        }
    }, [reduxStates]);

    useEffect(() => {
        if (!reduxCities) return;

        if (activeType === "from") {
            setFromCities(reduxCities);
        } else if (activeType === "to") {
            setToCities(reduxCities);
        }
    }, [reduxCities]);

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
        if (step < 5) return;
        try {
            const payload = {
                ...data,
                order_id: orderId, // from previous screen
                shipping_type_id: orderData?.service_type === "buy_for_me" ? 1 : 2,
            };
            const res = await ApiHelper("POST", "/custom-declaration/store", payload);
            if (res.status === 200 && res.data.success) {

                toast.success("Custom Declaration submitted successfully!");
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
                fieldsToValidate = ["from_name", "from_business", "from_street", "from_postcode", "from_country", "from_city"];
                break;
            case 2:
                fieldsToValidate = ["to_name", "to_business", "to_street", "to_postcode", "to_country", "to_city"];
                break;
            case 3:
                setTimeout(() => setStep(5), 0);
                return;
            case 4:
                setTimeout(() => setStep(5), 0);
                return;
            case 5:
                setTimeout(() => setStep(5), 0);
                break;
        }

        const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (isValid) {
            setStep((prev) => Math.min(prev + 1, 5));
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    };

    useEffect(() => {
        if (showForm && orderData?.customDeclaration) {
            const data = orderData.customDeclaration;
            // reset the form with existing values
            reset({
                from_name: data.from_name || "",
                from_business: data.from_business || "",
                from_street: data.from_street || "",
                from_postcode: data.from_postcode || "",
                from_country: data.from_country?.id || "",
                from_state: data.from_state?.id || "",
                from_city: data.from_city?.id || "",
                to_name: data.to_name || "",
                to_business: data.to_business || "",
                to_street: data.to_street || "",
                to_postcode: data.to_postcode || "",
                to_country: data.to_country?.id || "",
                to_state: data.to_state?.id || "",
                to_city: data.to_city?.id || "",
                importer_reference: data.importer_reference || "",
                importer_contact: data.importer_contact || "",
                category_commercial_sample: data.category_commercial_sample || false,
                category_gift: data.category_gift || false,
                category_returned_goods: data.category_returned_goods || false,
                category_documents: data.category_documents || false,
                category_other: data.category_other || false,
                explanation: data.explanation || "",
                comments: data.comments || "",
                office_origin_posting: data.office_origin_posting || "",
                doc_licence: data.doc_licence || false,
                doc_certificate: data.doc_certificate || false,
                doc_invoice: data.doc_invoice || false,
            });

            // Optional: fetch states and cities if country/state exist
            if (data.from_country?.id) dispatch(fetchStates(data.from_country.id));
            if (data.from_state?.id) dispatch(fetchCities(data.from_state.id));
            if (data.to_country?.id) dispatch(fetchStates(data.to_country.id));
            if (data.to_state?.id) dispatch(fetchCities(data.to_state.id));
        }
    }, [showForm, orderData, dispatch, reset]);


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
            {
                orderData?.customDeclaration && !showForm ? (
                    <CustomDeclarationView
                        data={orderData.customDeclaration}
                        orderData={orderData}
                        onEdit={() => setShowForm(true)}
                    />
                ) :
                    (
                        
                        orderData && orderData?.status >= 5 ?
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
                                    {[
                                        "From",
                                        "To",
                                        "Importer",
                                        "Products",
                                        "Declaration",
                                    ].map((label, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center relative">
    
                                            {index !== 4 && (
                                                <div
                                                    className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 transition-all 
                        ${step > index + 1 ? "bg-blue-600" : "bg-gray-200"}`}
                                                />
                                            )}
    
                                            <div
                                                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-medium transition-all
                    ${step > index + 1
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
    
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                                    {/* STEP 1 */}
                                    {step === 1 && (
                                        <div className="space-y-4">
    
                                            {/* 🔹 ROW 1 */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    
                                                {/* Name */}
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Name</Label>
                                                    <Input {...register("from_name")} />
                                                    <p className="text-red-500 text-[11px] mt-0.5 min-h-[14px]">
                                                        {errors.from_name?.message}
                                                    </p>
                                                </div>
    
                                                {/* Business */}
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Business</Label>
                                                    <Input {...register("from_business")} />
                                                    <p className="text-red-500 text-[11px] mt-0.5 min-h-[14px]">
                                                        {errors.from_business?.message}
                                                    </p>
                                                </div>
    
                                                {/* Postcode */}
                                                <div>
                                                    <Label className="text-xs text-gray-500 mb-1 block">Postcode</Label>
                                                    <Input {...register("from_postcode")} />
                                                    <p className="text-red-500 text-[11px] mt-0.5 min-h-[14px]">
                                                        {errors.from_postcode?.message}
                                                    </p>
                                                </div>
    
                                            </div>
    
                                            {/* 🔹 ROW 2 */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    
                                                {/* Country */}
                                                <Controller
                                                    name="from_country"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select<number>
                                                            label="Country"
                                                            options={countries?.map((c: any) => ({
                                                                value: c.id,
                                                                label: c.name,
                                                            })) || []}
                                                            value={Number(field.value) || null}
                                                            onChange={(val: any) => {
                                                                field.onChange(val);
                                                                setValue("from_country", val);
                                                                setValue("from_state", '');
                                                                setValue("from_city", '');
    
                                                                if (val) {
                                                                    setActiveType("from");
                                                                    dispatch(fetchStates(val));
                                                                }
                                                            }}
                                                            placeholder="Country"
                                                            error={errors.from_country?.message as string}
                                                            clearable
                                                        />
                                                    )}
                                                />
    
                                                {/* State */}
                                                <Controller
                                                    name="from_state"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select<number>
                                                            label="State"
                                                            options={fromStates?.map((s: any) => ({
                                                                value: s.id,
                                                                label: s.name,
                                                            })) || []}
                                                            value={Number(field.value) || null}
                                                            onChange={(val: any) => {
                                                                field.onChange(val);
                                                                setValue("from_state", val);
                                                                setValue("from_city", '');
    
                                                                if (val){
                                                                    setActiveType("from");
                                                                    dispatch(fetchCities(val));
                                                                }
                                                            }}
                                                            placeholder="State"
                                                            error={errors.from_state?.message as string}
                                                            clearable
                                                        />
                                                    )}
                                                />
    
                                                {/* City */}
                                                <Controller
                                                    name="from_city"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select<number>
                                                            label="City"
                                                            options={fromCities?.map((city: any) => ({
                                                                value: city.id,
                                                                label: city.name,
                                                            })) || []}
                                                            value={Number(field.value) || null}
                                                            onChange={(val: any) => {
                                                                field.onChange(val);
                                                                setValue("from_city", val);
                                                            }}
                                                            placeholder="City"
                                                            error={errors.from_city?.message as string}
                                                            clearable
                                                        />
                                                    )}
                                                />
    
                                            </div>
    
                                            {/* 🔹 ROW 3 (FULL WIDTH) */}
                                            <div>
                                                <Label className="text-xs text-gray-500 mb-1 block">
                                                    Street Address
                                                </Label>
                                                <Input {...register("from_street")} />
                                                <p className="text-red-500 text-[11px] mt-0.5 min-h-[14px]">
                                                    {errors.from_street?.message}
                                                </p>
                                            </div>
    
                                        </div>
                                    )}
    
                                    {/* STEP 2 */}
                                    {step === 2 && (
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
                                                    <Label>Street</Label>
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
                                                                options={countries?.map((c: any) => ({
                                                                    value: c.id,
                                                                    label: c.name,
                                                                })) || []}
                                                                value={field.value ? Number(field.value) : null}
                                                                onChange={(val:any) => {
                                                                    field.onChange(val);
                                                                    setValue("to_country", val);
                                                                    setValue("to_state", '');
                                                                    setValue("to_city", '');
    
                                                                    if (val) {
                                                                        setActiveType("to");
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
                                                                options={toStates?.map((s: any) => ({
                                                                    value: s.id,
                                                                    label: s.name,
                                                                })) || []}
                                                                value={field.value ? Number(field.value) : null}
                                                                onChange={(val:any) => {
                                                                    field.onChange(val);
                                                                    setValue("to_state", val);
                                                                    setValue("to_city", '');
    
                                                                    if (val){
                                                                        setActiveType("to");
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
                                                                options={toCities?.map((city: any) => ({
                                                                    value: city.id,
                                                                    label: city.name,
                                                                })) || []}
                                                                value={field.value ? Number(field.value) : null}
                                                                onChange={(val:any) => {
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
    
                                    {/* STEP 3 */}
                                    {step === 3 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label>Importer’s Reference (Optional)</Label>
                                                <Input type="text" {...register("importer_reference")} />
                                            </div>
    
                                            <div>
                                                <Label>Importer’s Telephone / Fax / Email (If Known)</Label>
                                                <Input type="text" {...register("importer_contact")} />
                                            </div>
                                        </div>
                                    )}
                                    {/* STEP 4 */}
                                    {step === 4 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
    
                                            {orderData?.order_details && orderData.order_details.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full border border-gray-300 rounded-lg">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                <th className="px-4 py-2 border">#</th>
                                                                <th className="px-4 py-2 border">Product Name</th>
                                                                <th className="px-4 py-2 border">Quantity</th>
                                                                <th className="px-4 py-2 border">Price</th>
                                                                <th className="px-4 py-2 border">Weight</th>
                                                                <th className="px-4 py-2 border">Total Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {orderData.order_details.map((item: any, index: number) => (
                                                                <tr key={item.id} className="text-center">
                                                                    <td className="px-4 py-2 border">{index + 1}</td>
                                                                    <td className="px-4 py-2 border">{item.product?.title}</td>
                                                                    <td className="px-4 py-2 border">{item.quantity}</td>
                                                                    <td className="px-4 py-2 border">{item.price}</td>
                                                                    <td className="px-4 py-2 border">{item.weight} g</td>
                                                                    <td className="px-4 py-2 border">${Number(item.price) * Number(item.quantity)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No product details found.</p>
                                            )}
                                        </div>
                                    )}
    
                                    {/* STEP 5 */}
                                    {step === 5 && (
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
                                                        <label
                                                            key={item.name}
                                                            className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                {...register(item.name as any)}
                                                                className="accent-blue-600"
                                                            />
                                                            <span className="text-sm">{item.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
    
                                            {/* Explanation */}
                                            <div>
                                                <Label>Explanation</Label>
                                                <textarea
                                                    {...register("explanation")}
                                                    rows={3}
                                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Describe parcel contents..."
                                                />
                                            </div>
    
                                            {/* Comments */}
                                            <div>
                                                <Label>Comments</Label>
                                                <textarea
                                                    {...register("comments")}
                                                    rows={3}
                                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Additional notes..."
                                                />
                                            </div>
    
                                            {/* Office */}
                                            <div>
                                                <Label>Office of origin / Date of posting</Label>
                                                <textarea
                                                    {...register("office_origin_posting")}
                                                    rows={2}
                                                    className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
    
                                            {/* Documents */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                                    Documents Attached
                                                </h3>
    
                                                <div className="flex gap-4 flex-wrap">
                                                    {[
                                                        { label: "Licence", name: "doc_licence" },
                                                        { label: "Certificate", name: "doc_certificate" },
                                                        { label: "Invoice", name: "doc_invoice" },
                                                    ].map((doc) => (
                                                        <label
                                                            key={doc.name}
                                                            className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                {...register(doc.name as any)}
                                                                className="accent-blue-600"
                                                            />
                                                            <span className="text-sm">{doc.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
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
    
                                        {step < 5 ? (
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

                        ):(
                            ''
                        )
                        

                    )
            }
        </>
    );
}