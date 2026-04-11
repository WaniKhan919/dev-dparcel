import * as yup from "yup";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ApiHelper } from "../../utils/ApiHelper";
import { fetchCountries } from "../../slices/countriesSlice";
import { fetchStates } from "../../slices/statesSlice";
import { fetchCities } from "../../slices/citiesSlice";
import Select from "../ui/dropdown/Select";
import MultiSelect from "../form/MultiSelect";
import { userHasRole } from "../../utils/DparcelHelper";

// ✅ Profile schema
const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().required("Email is required"),
  phone: yup.string().required("Phone is required"),
  country_id: yup.number().required("Country is required"),
  state_id: yup.number().required("State is required"),
  city_id: yup.number().required("City is required"),
});

const passwordSchema = yup.object().shape({
  old_password: yup.string().required("Old password is required"),
  new_password: yup
    .string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Confirm password is required"),
});

type Subscription = {
  level?: {
    title?: string;
    max_locations?: number;
  };
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "service">("profile");

  const dispatch = useDispatch<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [shipperSubscripition, setShipperSubscripition] = useState<Subscription | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [maxLocation, setMaxLocation] = useState<number>(0);
  const { data: countries, loading: countriesLoading } = useSelector((state: any) => state.countries);

  const { data: states, loading: statesLoading } = useSelector((state: any) => state.states);
  const { data: cities, loading: citiesLoading } = useSelector((state: any) => state.cities);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const {
    control,
  } = useForm<any>()

  // Form setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset,
    watch,
    setValue,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { isSubmitting: passwordSubmitting },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const selectedCountryId = watch("country_id");
  const selectedStateId = watch("state_id");

  // ✅ Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await ApiHelper("GET", "/user-profile");
      if (res.status === 200 && res.data?.data) {
        const user = res.data.data;

        // First, reset the basic info
        reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          country_id: user.country?.id || "",
          state_id: user.state?.id || "",
          city_id: 0, // temporarily empty
        });

        // Then, fetch dependent dropdowns in sequence
        if (user.country?.id) {
          await dispatch(fetchStates(user.country.id));
        }

        if (user.state?.id) {
          await dispatch(fetchCities(user.state.id));
        }

        // ✅ After both lists are loaded, now set the city value
        if (user.city?.id) {
          setValue("city_id", user.city.id);
        }
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    }
  };


  useEffect(() => {
    fetchUserProfile();
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCountryId) {
      dispatch(fetchStates(selectedCountryId));
      setValue("state_id", 0);
      setValue("city_id", 0);
    }
  }, [selectedCountryId, dispatch, setValue]);

  useEffect(() => {
    if (selectedStateId) {
      dispatch(fetchCities(selectedStateId));
      setValue("city_id", 0);
    }
  }, [selectedStateId, dispatch, setValue]);

  useEffect(() => {
    if (userHasRole('shipper')) {
      getShipperServiceAreas()
      getShipperSubscription()
    }
  }, []);
  useEffect(() => {
    if (shipperSubscripition?.level?.max_locations) {
      setMaxLocation(shipperSubscripition.level.max_locations);
    }
  }, [shipperSubscripition]);

  const isDisabled = loading || selectedCountries.length === 0 || selectedCountries.length > (shipperSubscripition?.level?.max_locations ?? 0);

  const onUpdateProfile = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city_id: data.city_id,
      };

      const res = await ApiHelper("PUT", "/update-profile", payload);
      if (res.status === 200) {
        toast.success(res.data.message || "Profile updated successfully");
      } else {
        toast.error(res.data.message || "Profile update failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile update failed!");
    }
  };

  const onUpdatePassword = async (data: any) => {
    try {
      const res = await ApiHelper("PUT", "/update-password", data);
      if (res.status === 200) {
        toast.success(res.data.message || "Password updated successfully");
      } else {
        toast.error(res.data.message || "Password update failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed!");
    }
  };

  const getShipperSubscription = async () => {
    try {
      const res = await ApiHelper("GET", "/shipper/subscription");
      if (res.status === 200) {
        setShipperSubscripition(res.data.data)
      } else {
        setShipperSubscripition(null)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message);
    }
  };
  const getShipperServiceAreas = async () => {
    try {
      const res = await ApiHelper("GET", "/shipper/service-area");
      if (res.status === 200) {
        const countryIds = res.data.data.map((area: any) => String(area.country_id));
        setSelectedCountries(countryIds);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message);
    }
  };

  const handleSave = async () => {
    if (selectedCountries.length === 0) {
      toast.error("Please select at least one country", {
        duration: 3000,
        position: "top-right",
        icon: "⚠️",
      });
      return;
    }

    if (selectedCountries.length > maxLocation) {
      toast.error(`You can select maximum ${maxLocation} countries`, {
        duration: 3000,
        position: "top-right",
        icon: "⚠️",
      });
      return;
    }

    const payload = {
      country_ids: selectedCountries.map(Number),
    };

    setLoading(true);

    try {
      const res = await ApiHelper("POST", "/shipper/service-area/store", payload);

      if (res.status === 200) {
        toast.success("Service areas saved successfully", {
          duration: 3000,
          position: "top-right",
          icon: "✅",
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "API request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10">

      {/* Header Tabs */}
      <div className="max-w-4xl mx-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-800">

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === "profile"
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            Update Profile
            {activeTab === "profile" && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-gray-900 dark:bg-white"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === "password"
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            Change Password
            {activeTab === "password" && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-gray-900 dark:bg-white"></span>
            )}
          </button>
          {
            userHasRole('shipper') &&
            <button
              onClick={() => setActiveTab("service")}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === "service"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              Service Areas
              {activeTab === "service" && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-gray-900 dark:bg-white"></span>
              )}
            </button>
          }

        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10">

        {activeTab === "profile" ? (
          <form
            onSubmit={handleProfileSubmit(onUpdateProfile)}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Name</Label>
              <Input
                placeholder="Enter your name"
                className="h-12 rounded-lg border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                {...registerProfile("name")}
              />
              {profileErrors.name && (
                <p className="text-red-500 text-sm">{profileErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Email</Label>
              <Input
                placeholder="Enter email"
                className="h-12 rounded-lg border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                {...registerProfile("email")}
              />
              {profileErrors.email && (
                <p className="text-red-500 text-sm">{profileErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Phone</Label>
              <Input
                placeholder="Enter phone"
                className="h-12 rounded-lg border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                {...registerProfile("phone")}
              />
              {profileErrors.phone && (
                <p className="text-red-500 text-sm">{profileErrors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Country</Label>
              <select
                {...registerProfile("country_id")}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-transparent"
              >
                {countriesLoading ? (
                  <option>Loading countries...</option>
                ) : (
                  <>
                    <option value="">Select country</option>
                    {countries?.map((c: any) => (
                      <option key={c.id} value={Number(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">State</Label>
              <select
                value={selectedStateId || ""}
                {...registerProfile("state_id")}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("state_id", Number(value));
                  setValue("city_id", 0);
                  if (value) dispatch(fetchCities(Number(value)));
                }}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-transparent"
              >
                {statesLoading ? (
                  <option>Loading states...</option>
                ) : (
                  <>
                    <option value="">Select state</option>
                    {states?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">City</Label>
              <select
                {...registerProfile("city_id", { valueAsNumber: true })}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-transparent"
              >
                {citiesLoading ? (
                  <option>Loading cities...</option>
                ) : (
                  <>
                    <option value="">Select city</option>
                    {cities?.map((city: any) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="col-span-full flex justify-end pt-6">
              <Button
                type="submit"
                disabled={profileSubmitting}
                className="px-8 py-3 rounded-lg bg-gray-900 text-white hover:bg-black transition"
              >
                {profileSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </div>

          </form>
        ) : activeTab === "password" ? (
          <form
            onSubmit={handlePasswordSubmit(onUpdatePassword)}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Old Password</Label>
              <Input
                type="password"
                placeholder="Enter old password"
                className="h-12 rounded-lg border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                {...registerPassword("old_password")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="h-12 rounded-lg border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                {...registerPassword("new_password")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="h-12 rounded-lg border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                {...registerPassword("new_password_confirmation")}
              />
            </div>

            <div className="col-span-full flex justify-end pt-6">
              <Button
                type="submit"
                disabled={passwordSubmitting}
                className="px-8 py-3 rounded-lg bg-gray-900 text-white hover:bg-black transition"
              >
                {passwordSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </div>

          </form>
        ) : (
          <>
            {/* Subscription Info */}
            {
              userHasRole('shipper') &&
              <>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Your Subscription</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {shipperSubscripition?.level?.title} ({shipperSubscripition?.level?.max_locations} Locations)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Selected</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {selectedCountries.length} / {shipperSubscripition?.level?.max_locations}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Country (Single Select) */}
                  <div>
                    <Controller
                      name="ship_to_country_id"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          label="Select Countries"
                          options={countries.map((c: any) => ({
                            value: String(c.id),
                            text: c.name,
                          }))}
                          value={selectedCountries}
                          // onChange={(val) => setSelectedCountries(val)}
                          onChange={(val) => {
                            const maxAllowed = shipperSubscripition?.level?.max_locations ?? 0;
                            if (val.length > maxAllowed) {
                              toast.error(`Your plan allows maximum ${maxAllowed} location(s)`, {
                                duration: 3000,
                                position: "top-right",
                                icon: "⚠️",
                              });
                              // return;
                            }
                            setSelectedCountries(val);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Selected Coutries Preview */}
                {selectedCountries.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Selected Countries ({selectedCountries.length}):
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedCountries.map((countryId) => {
                        const country = countries.find((c: any) => String(c.id) === countryId);

                        return country ? (
                          <span
                            key={countryId}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                          >
                            {country.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isDisabled}
                    className={`px-6 py-2 rounded-lg text-white ${
                      isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            }
          </>
        )
        }

      </div>
    </div>
  );
}
