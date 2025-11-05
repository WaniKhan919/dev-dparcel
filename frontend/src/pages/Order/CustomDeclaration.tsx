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
import { useLocation } from "react-router";
import CustomDeclarationView from "./CustomDeclarationView";

interface FormValues {
  purpose_of_shipment: string;
  export_reason: string;
  receiver_name: string;
  receiver_phone: string;
  postal_code: string;
  receiver_address: string;
  country_id: number;
  state_id: number;
  city_id: number;
  total_declared_value: number;
  total_weight: number;
  currency?: string;
  unit_of_weight?: string;
  is_dutiable?: boolean;
  contains_prohibited_items?: boolean | null;
  contains_liquids?: boolean | null;
  contains_batteries?: boolean | null;
  is_fragile?: boolean | null;
  additional_info?: string;
}

// Full validation schema for your required fields
const validationSchema: Yup.ObjectSchema<FormValues> = Yup.object({
  purpose_of_shipment: Yup.string().required("Purpose of shipment is required"),
  export_reason: Yup.string().required("Export reason is required"),
  receiver_name: Yup.string().required("Receiver name is required"),
  receiver_phone: Yup.string().required("Receiver phone is required"),
  postal_code: Yup.string().required("Postal code is required"),
  receiver_address: Yup.string().required("Receiver address is required"),
  country_id: Yup.number().typeError("Country is required").required("Country is required"),
  state_id: Yup.number().typeError("State is required").required("State is required"),
  city_id: Yup.number().typeError("City is required").required("City is required"),
  total_declared_value: Yup.number().typeError("Required").required("Total declared value is required"),
  total_weight: Yup.number().typeError("Required").required("Total weight is required"),

  // ✅ Optional checkboxes
  contains_prohibited_items: Yup.boolean().nullable().optional(),
  contains_liquids: Yup.boolean().nullable().optional(),
  contains_batteries: Yup.boolean().nullable().optional(),
  is_fragile: Yup.boolean().nullable().optional(),

  currency: Yup.string().optional(),
  unit_of_weight: Yup.string().optional(),
  is_dutiable: Yup.boolean().optional(),
  additional_info: Yup.string().optional(),
});

export default function CustomDeclarationForm() {
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch<any>();

  const { data: countries } = useSelector((state: any) => state.countries);
  const { data: states } = useSelector((state: any) => state.states);
  const { data: cities } = useSelector((state: any) => state.cities);
  const [orderData, setOrderData] = useState<any>(null);
  const location = useLocation();
  const { order_id } = location.state || {};

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      currency: "USD",
      unit_of_weight: "g",
      is_dutiable: false,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ApiHelper("GET", `/order/get-order-detail/${order_id}`);
      if (response.status === 200) {
        setOrderData(response.data.data);
        if (response.data.data?.custom_declaration) {
          setShowForm(false);
        } else {
          setShowForm(true);
        }
        setValue("total_declared_value", response.data.data?.total_price || 0);
        setValue("total_weight", response.data.data?.total_aprox_weight || 0);
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  // ✅ This prevents auto submit when step 5 loads
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
      if (step < 5) return;
      try {
        const payload = {
          ...data,
          order_id: order_id, // from previous screen
          shipping_type_id: orderData?.service_type === "buy_for_me" ? 1 : 2,
        };
        const res = await ApiHelper("POST", "/custom-declaration/store", payload);
        if (res.status === 200 && res.data.success) {
        
          toast.success("Custom Declaration submitted successfully!");
        } else {
          toast.error(res.data.message);
        }
        toast.success("Custom Declaration submitted successfully!");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to create declaration.");
      }
    };

  // ✅ Step validation only when Next is clicked
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["purpose_of_shipment", "export_reason"];
        break;
      case 2:
        fieldsToValidate = ["receiver_name", "receiver_phone", "postal_code", "receiver_address"];
        break;
      case 3:
        fieldsToValidate = ["country_id", "state_id", "city_id"];
        break;
      case 4:
        setTimeout(() => setStep(5), 0);
        return;
      case 5:
        fieldsToValidate = ["total_declared_value", "total_weight"];
        break;
    }

    const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 5));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };


  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <>
      <PageMeta title="Delivering Parcel | Custom Declaration" description="" />
      <PageBreadcrumb pageTitle="Custom Declaration" />
      {
        orderData?.custom_declaration && !showForm ?(
        <CustomDeclarationView
          data={orderData.custom_declaration}
          orderDetails={orderData.order_details}
          onEdit={() => setShowForm(true)} // 👈 open edit mode
        />
        ):
        (
        <div className="max-w-5xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          {/* Stepper */}
          <div className="flex justify-between items-center mb-10 relative">
            {[
              "Shipment Details",
              "Receiver Info",
              "Location Info",
              "Products Info",
              "Declaration Info",
            ].map((label, index) => (
              <div key={index} className="flex-1 flex flex-col items-center relative">
                {index < 3 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-[3px] -z-10 ${step > index + 1 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                  ></div>
                )}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${step > index
                    ? "bg-blue-600 border-blue-600 text-white"
                    : step === index + 1
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-400 text-gray-400"
                    }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${step >= index + 1
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>Purpose of Shipment</Label>
                  <Input type="text" {...register("purpose_of_shipment")} />
                  <p className="text-red-500 text-sm">
                    {errors.purpose_of_shipment?.message}
                  </p>
                </div>

                <div>
                  <Label>Export Reason</Label>
                  <Input type="text" {...register("export_reason")} />
                  <p className="text-red-500 text-sm">
                    {errors.export_reason?.message}
                  </p>
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
                  <p className="text-red-500 text-sm">{errors.postal_code?.message}</p>
                </div>

                <div className="sm:col-span-3">
                  <Label>Receiver Address</Label>
                  <textarea
                    {...register("receiver_address")}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-red-500 text-sm">{errors.receiver_address?.message}</p>
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
                  <p className="text-red-500 text-sm">{errors.country_id?.message}</p>
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
                  <p className="text-red-500 text-sm">{errors.state_id?.message}</p>
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
                  <p className="text-red-500 text-sm">{errors.city_id?.message}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>Total Declared Value</Label>
                  <Input type="number" {...register("total_declared_value")} readOnly />
                  <p className="text-red-500 text-sm">{errors.total_declared_value?.message}</p>
                </div>

                <div>
                  <Label>Total Weight</Label>
                  <Input type="number" {...register("total_weight")} readOnly />
                  <p className="text-red-500 text-sm">{errors.total_weight?.message}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input type="checkbox" {...register("contains_prohibited_items")} />
                  <Label>Contains Prohibited Items</Label>
                </div>

                <div className="flex items-center space-x-3">
                  <input type="checkbox" {...register("contains_liquids")} />
                  <Label>Contains Liquids</Label>
                </div>

                <div className="flex items-center space-x-3">
                  <input type="checkbox" {...register("contains_batteries")} />
                  <Label>Contains Batteries</Label>
                </div>

                <div className="flex items-center space-x-3">
                  <input type="checkbox" {...register("is_fragile")} />
                  <Label>Is Fragile</Label>
                </div>

                <div className="sm:col-span-2">
                  <Label>Additional Information</Label>
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

              {step < 5 ? (
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

        )
      }
    </>
  );
}
