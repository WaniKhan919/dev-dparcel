import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchCountries } from "../../slices/countriesSlice";
import { fetchStates } from "../../slices/statesSlice";
import { fetchCities } from "../../slices/citiesSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ApiHelper } from "../../utils/ApiHelper";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface FormValues {
    shipping_type_id: number;
    export_reason?: string;
    purpose_of_shipment?: string;
    receiver_name: string;
    receiver_phone: string;
    receiver_address: string;
    postal_code?: string;
    country_id: number;
    state_id: number;
    city_id: number;
    total_declared_value?: number;
    total_weight?: number;
    currency?: string;
    unit_of_weight?: string;
    contains_prohibited_items?: boolean;
    contains_liquids?: boolean;
    contains_batteries?: boolean;
    is_fragile?: boolean;
    is_dutiable?: boolean;
    additional_info?: string;
}


const validationSchema = Yup.object().shape({
    shipping_type_id: Yup.number().required("Shipping type is required"),
    receiver_name: Yup.string().required("Receiver name is required"),
    receiver_phone: Yup.string().required("Receiver phone is required"),
    receiver_address: Yup.string().required("Receiver address is required"),
    country_id: Yup.number().required("Country is required"),
    state_id: Yup.number().required("State is required"),
    city_id: Yup.number().required("City is required"),
});

export default function CustomDeclarationForm() {
    const [step, setStep] = useState(1);
    const dispatch = useDispatch<any>();

    const { data: countries } = useSelector((state: any) => state.countries);
    const { data: states } = useSelector((state: any) => state.states);
    const { data: cities } = useSelector((state: any) => state.cities);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            currency: "USD",
            unit_of_weight: "kg",
            is_dutiable: false,
        },
    });


    useEffect(() => {
        dispatch(fetchCountries());
    }, [dispatch]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const res = await ApiHelper("POST", "/api/custom-declaration/store", data);
            toast.success("Custom Declaration created successfully!");
            console.log("Response:", res.data);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Failed to create declaration."
            );
        }
    };

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    return (
        <>

            <PageMeta title="Delivering Parcel | Custom Declaration" description="" />
            <PageBreadcrumb pageTitle="Custom Declaration" />
                <div className="max-w-5xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
      
      {/* Stepper with Labels */}
      <div className="flex justify-between items-center mb-10 relative">
        {[
          "Shipment Details",
          "Receiver Info",
          "Location Info",
          "Declaration Info",
        ].map((label, index) => (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            {/* Connector Line */}
            {index < 3 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-[3px] -z-10 ${
                  step > index + 1
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              ></div>
            )}

            {/* Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                step > index
                  ? "bg-blue-600 border-blue-600 text-white"
                  : step === index + 1
                  ? "border-blue-600 text-blue-600"
                  : "border-gray-400 text-gray-400"
              }`}
            >
              {index + 1}
            </div>

            <span
              className={`mt-2 text-sm font-medium ${
                step >= index + 1
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>Purpose of Shipment</Label>
              <Input type="text" {...register("purpose_of_shipment")} />
            </div>
            <div>
              <Label>Export Reason</Label>
              <Input type="text" {...register("export_reason")} />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Label>Receiver Name</Label>
              <Input type="text" {...register("receiver_name")} />
              <p className="text-red-500 text-sm">{errors.receiver_name?.message}</p>
            </div>

            <div>
              <Label>Receiver Phone</Label>
              <Input type="text" {...register("receiver_phone")} />
              <p className="text-red-500 text-sm">{errors.receiver_phone?.message}</p>
            </div>
            

            <div>
              <Label>Postal Code</Label>
              <Input type="text" {...register("postal_code")} />
            </div>

            <div className="sm:col-span-3">
              <Label>Receiver Address</Label>
              <textarea
                {...register("receiver_address")}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Label>Country</Label>
              <select
                {...register("country_id")}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setValue("country_id", id);
                  dispatch(fetchStates(id));
                }}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Country</option>
                {countries?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>State</Label>
              <select
                {...register("state_id")}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setValue("state_id", id);
                  dispatch(fetchCities(id));
                }}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select State</option>
                {states?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>City</Label>
              <select
                {...register("city_id")}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select City</option>
                {cities?.map((city: any) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>Total Declared Value</Label>
              <Input type="number" {...register("total_declared_value")} />
            </div>

            <div>
              <Label>Total Weight</Label>
              <Input type="number" {...register("total_weight")} />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-4">
            {[
                "contains_prohibited_items",
                "contains_liquids",
                "contains_batteries",
                "is_fragile",
                "is_dutiable",
            ].map((key) => {
                // convert snake_case → Title Case
                const label = key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

                return (
                <label
                    key={key}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                    <input type="checkbox" {...register(key as any)} />
                    {label}
                </label>
                );
            })}
            </div>

            <div className="sm:col-span-2">
              <Label>Additional Info</Label>
              <textarea
                {...register("additional_info")}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>

        </>
    );
}
