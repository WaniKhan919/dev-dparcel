import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import { Controller, useForm } from "react-hook-form";
import Checkbox from "../../components/form/input/Checkbox";

const steps = ["Shipping Info", "Shipping Address", "Product Details"];
const multiOptions = [
  { value: "1", text: "Option 1", selected: false },
  { value: "2", text: "Option 2", selected: false },
  { value: "3", text: "Option 3", selected: false },
  { value: "4", text: "Option 4", selected: false },
  { value: "5", text: "Option 5", selected: false },
];

type FormValues = {
  terms: boolean;
};

export default function Order() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const { control } = useForm<FormValues>({
    defaultValues: { terms: false },
  });

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

  return (
    <>
      <PageMeta title="Delivering Parcel | Request" description="" />
      <PageBreadcrumb pageTitle="Request" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex-1 flex items-center last:flex-none"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition 
                  ${
                    index === currentStep
                      ? "bg-blue-500 text-white shadow-lg"
                      : index < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {index < currentStep ? <></> : index + 1}
              </div>
              <span className="ml-3 font-medium hidden sm:inline-block">
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-3">
                  <div
                    className={`h-1 transition ${
                      index < currentStep ? "bg-blue-500" : ""
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Service Type
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {["Buy For Me", "Ship For Me"].map((option) => (
                  <label
                    key={option}
                    className={`flex-1 flex items-center justify-between cursor-pointer rounded-xl border p-5 transition 
                      ${
                        formData.serviceType === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={option}
                      checked={formData.serviceType === option}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="font-medium text-gray-700">{option}</span>
                    {formData.serviceType === option && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                        ✓
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>
                    Ship From <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="shipFrom"
                    value={formData.shipFrom}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>
                    Ship To <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="shipTo"
                    value={formData.shipTo}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Product Details
              </h2>

              <MultiSelect
                label="Select Multiple Product"
                options={multiOptions}
                onChange={(values) => setSelectedValues(values)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>
                    Total Approx Weight (Gram){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Approximate Weight"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>
                    Products Total Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Total Price"
                    className="w-full"
                  />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800">
                Additional Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { id: "photo", label: "Product Photo" },
                    { id: "consolidation", label: "Package Consolidation" },
                    { id: "assistance", label: "Purchase Assistance" },
                ].map((item) => (
                    <label
                    key={item.id}
                    className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer bg-white shadow-sm hover:shadow-md transition"
                    >
                    <input
                        type="checkbox"
                        name={item.id}
                        value={item.label}
                        className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">{item.label}</span>
                    </label>
                ))}
            </div>


              <div className="flex items-start gap-3">
                <Controller
                  control={control}
                  name="terms"
                  render={({ field }) => (
                    <Checkbox
                      className="w-5 h-5 mt-1"
                      checked={field.value}
                      onChange={() => field.onChange(!field.value)}
                    />
                  )}
                />
                <p className="text-sm text-gray-600">
                  By clicking the tick button, I hereby agree and consent to the{" "}
                  <a href="#" className="text-blue-500 underline">
                    terms of business
                  </a>
                  , its policies, and the privacy policy.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
              >
                Next 
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
              >
                 Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
