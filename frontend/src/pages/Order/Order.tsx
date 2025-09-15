import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import MultiSelect from "../../components/form/MultiSelect";
import { Controller, useForm } from "react-hook-form";
import Checkbox from "../../components/form/input/Checkbox";
import { AppDispatch } from "../../store";
import { fetchProduct } from "../../slices/productSlice";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

const steps = ["Shipping Info", "Shipping Address", "Product Details"];

const stepSchemas = [
  // Step 0: Shipping Info
  yup.object().shape({
    serviceType: yup.string().required("Please select a service type"),
  }),

  // Step 1: Shipping Address
  yup.object().shape({
    shipFrom: yup.string().required("Ship From is required"),
    shipTo: yup.string().required("Ship To is required"),
  }),

  // Step 2: Product Details
  yup.object().shape({
    products: yup.array().min(1, "Select at least one product"),
    weight: yup.string().required("Weight is required"),
    price: yup.string().required("Price is required"),
    terms: yup.boolean().oneOf([true], "You must accept the terms"),
  }),
];

export default function Order() {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: any) => state.products);
  const [currentStep, setCurrentStep] = useState(0);
  const [multiOptions, setMultiOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>({
    resolver: yupResolver(stepSchemas[currentStep] as any),
    mode: "onChange",
    defaultValues: {
      serviceType: "",
      shipFrom: "",
      shipTo: "",
      products: [],
      weight: "",
      price: "",
      terms: false,
    },
  });

  useEffect(() => {
    dispatch(fetchProduct());
  }, [dispatch]);

  useEffect(() => {
    if (products && Array.isArray(products)) {
      const formatted = products.map((item: any) => ({
        value: String(item.id),
        text: item.title,
        selected: false,
      }));
      setMultiOptions(formatted);
    }
  }, [products]);

  const nextStep = async () => {
    const isValid = await trigger(); // validate current step only
    if (!isValid) return;
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

    const onSubmitForm = async (data: any) => {
        setLoading(true);
        try {
            console.log("Selected Products:", data.products);
            const payload = {
                service_type: data.serviceType === "Buy For Me" ? "buy_for_me" : "ship_for_me",
                ship_from: data.shipFrom,
                ship_to: data.shipTo,
                order_details: (data.products || []).map((id: string) => ({
                    product_id: parseInt(id, 10), 
                    quantity: 1,
                })),
            };

            const res = await ApiHelper("POST", "/order/store", payload);

            if (res.status === 200 && res.data.success) {
                toast.success(res.data.message || "Order placed successfully");
                reset();
                setSelectedValues([]);
            } else {
                toast.error(res.data.message || "Failed to place order ❌");
            }  
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong!", {
            style: { background: "#f44336", color: "#fff" },
            });
        } finally {
            setLoading(false);
        }
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
                  ${index === currentStep
                    ? "bg-blue-500 text-white shadow-lg"
                    : index < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className="ml-3 font-medium hidden sm:inline-block">
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-3">
                  <div
                    className={`h-1 transition ${index < currentStep ? "bg-blue-500" : ""
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
                      ${option === control._formValues.serviceType
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      value={option}
                      {...register("serviceType")}
                      className="hidden"
                    />
                    <span className="font-medium text-gray-700">{option}</span>
                    {option === control._formValues.serviceType && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                        ✓
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {errors.serviceType && (
                <p className="text-red-500 text-sm">{errors.serviceType?.message  as string}</p>
              )}
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
                    {...register("shipFrom")}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.shipFrom && (
                    <p className="text-red-500 text-sm">{errors.shipFrom?.message  as string}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Ship To <span className="text-red-500">*</span>
                  </Label>
                  <select
                    {...register("shipTo")}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.shipTo && (
                    <p className="text-red-500 text-sm">{errors.shipTo?.message  as string}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Product Details
              </h2>

              <Controller
                control={control}
                name="products"
                render={({ field }) => (
                  <MultiSelect
                    label="Select Multiple Product"
                    options={multiOptions}
                    onChange={(values) => {
                        field.onChange(values);
                        setSelectedValues(values);
                    }}
                  />
                )}
              />
              {errors.products && (
                <p className="text-red-500 text-sm">{errors.products?.message  as string}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>
                    Total Approx Weight (Gram){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Approximate Weight"
                    {...register("weight")}
                    className="w-full"
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-sm">{errors.weight?.message  as string}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Products Total Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Total Price"
                    {...register("price")}
                    className="w-full"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price?.message  as string}</p>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800">
                Additional Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "id_photo", label: "Product Photo" },
                  { id: "is_consolidation", label: "Package Consolidation" },
                  { id: "is_assistance", label: "Purchase Assistance" },
                  { id: "is_forwarding", label: "Forwarding Service Fee" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer bg-white shadow-sm hover:shadow-md transition"
                  >
                    <input
                      type="checkbox"
                      {...register(item.id)}
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
              {errors.terms && (
                <p className="text-red-500 text-sm">{errors.terms?.message as string}</p>
              )}
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
                onClick={handleSubmit(onSubmitForm)}
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
