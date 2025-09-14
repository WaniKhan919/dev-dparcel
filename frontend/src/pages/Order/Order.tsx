import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";

const steps = ["Shipping Info", "Shipping Address", "Product Details"];
const multiOptions = [
    { value: "1", text: "Option 1", selected: false },
    { value: "2", text: "Option 2", selected: false },
    { value: "3", text: "Option 3", selected: false },
    { value: "4", text: "Option 4", selected: false },
    { value: "5", text: "Option 5", selected: false },
];
export default function Order() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        serviceType: "",
        shipFrom: "",
        shipTo: "",
        products: [] as string[],
    });

    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setFormData((prev) => {
                const products = checked
                    ? [...prev.products, value]
                    : prev.products.filter((p) => p !== value);
                return { ...prev, products };
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = () => {
        alert("Form submitted! " + JSON.stringify(formData, null, 2));
    };

    const countries = ["USA", "Canada", "UK", "Germany", "Pakistan", "India"];
    const availableProducts = ["Laptop", "Phone", "Watch", "Shoes", "Book"];

    return (
        <>
            <PageMeta title="Delivering Parcel | Request" description="" />
            <PageBreadcrumb pageTitle="Request" />
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-6 p-6">
                    {/* Sidebar Steps */}
                    <div className="col-span-1 bg-white shadow rounded-2xl p-4">
                        <ul className="space-y-4">
                            {steps.map((step, index) => (
                                <li
                                    key={index}
                                    className={`cursor-pointer p-2 rounded-xl text-sm font-medium transition
                                        ${index === currentStep ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                                    `}
                                    onClick={() => setCurrentStep(index)}
                                >
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Content */}
                    <div className="col-span-3 bg-white shadow rounded-2xl p-6">
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Service Type</h2>
                                <div className="flex flex-col items-center space-y-3">
                                    {["Buy For Me", "Ship For Me"].map((option) => (
                                         <label
          key={option}
          className={`w-full max-w-sm flex items-center justify-between cursor-pointer rounded-lg border p-4 transition 
            ${
              formData.serviceType === option
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
        >
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name="serviceType"
                                                    value={option}
                                                    checked={formData.serviceType === option}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                <span className="font-medium">{option}</span>
                                            </div>

                                            {formData.serviceType === option && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                                                    ✓
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}


                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Shipping Address</h2>
                                <div>
                                    <Label>Ship From <span className="text-error-500">*</span></Label>
                                    <select
                                        name="shipFrom"
                                        value={formData.shipFrom}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-xl"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Ship To <span className="text-error-500">*</span></Label>
                                    <select
                                        name="shipTo"
                                        value={formData.shipTo}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-xl"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Product Details</h2>
                                <div>
                                    <MultiSelect
                                        label=" Select Multiple Product"
                                        options={multiOptions}
                                        onChange={(values) => setSelectedValues(values)}
                                    />
                                    <p className="sr-only">
                                        Selected Values: {selectedValues.join(", ")}
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="px-4 py-2 bg-gray-200 rounded-xl disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
