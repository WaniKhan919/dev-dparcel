import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { ApiHelper } from "../../utils/ApiHelper";
import { encryptLocalStorage } from "../../utils/DparcelHelper";

interface SignUpFormProps {
  role: string;
}

type FormValues = {
  name: string;
  email: string;
  password: string;
  terms: boolean;
  mobile_number: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  references?: (string | undefined)[];
};

export default function ShipperSignUpForm({ role }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
      mobile_number: "",
      facebook_url: null,
      instagram_url: null,
      references: [],
    },
  });

  const handleStep1Next = async () => {
    const valid = await trigger(["name", "email", "password", "mobile_number"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: FormValues) => {
    clearErrors();

    const valid = await trigger([
      "facebook_url",
      "instagram_url",
      "references.0",
      "references.1",
      "terms",
    ]);

    if (!valid) return;

    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        role,
        mobile_number: data.mobile_number,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        references: data.references?.filter(Boolean) || [],
      };

      const toastId = toast.loading("Signing up...");
      const res: any = await ApiHelper("POST", "/signup", payload);

      if (res?.status === 201) {
        toast.success(res.data.message || "Registered successfully!", {
          id: toastId,
          duration: 4000,
          position: "top-right",
          icon: "🎉",
        });

        if (res.data?.user_id) {
          encryptLocalStorage("verification_user_id", String(res.data.user_id));
        }

        setTimeout(() => {
          window.location.href = "/verify";
        }, 1000);
      } else {
        toast.error(res?.data?.error || res?.data?.message || "Signup failed", { id: toastId });
      }
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        toast.error(messages);
      } else {
        toast.error(err?.response?.data?.error || err?.message || "Signup failed");
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto pt-6 sm:pt-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 group"
        >
          <ChevronLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400 tracking-wide uppercase">
              Create Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {step === 1 ? "Basic Information" : "Additional Details"}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {step === 1 ? "Step 1 of 2 — your account credentials" : "Step 2 of 2 — social & references"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? "bg-brand-500" : "bg-gray-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 2 ? "bg-brand-500" : "bg-gray-200"}`} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div>
                  <Label>Full Name <span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label>Email <span className="text-error-500">*</span></Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label>Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      placeholder="Min. 8 characters"
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeIcon className="fill-current size-4" /> : <EyeCloseIcon className="fill-current size-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <Label>Mobile Number <span className="text-error-500">*</span></Label>
                  <Input
                    type="tel"
                    placeholder="e.g., 03001234567"
                    {...register("mobile_number", {
                      required: "Mobile number is required",
                      pattern: { value: /^[0-9]{10,15}$/, message: "Enter a valid mobile number" },
                    })}
                  />
                  {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number.message}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="relative w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all shadow-sm shadow-brand-500/30"
                >
                  Continue →
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                  </svg>
                  <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    Accounts linked via Facebook or Instagram will require admin approval before activation.
                  </p>
                </div>

                <div>
                  <Label>Facebook URL </Label>
                  <Input
                    type="url"
                    placeholder="https://facebook.com/username"
                    {...register("facebook_url", {
                      required: "Facebook URL is required",
                      pattern: {
                        value: /^https?:\/\/.+\..+/,
                        message: "Enter a valid URL",
                      },
                    })}
                  />
                  {errors.facebook_url && (
                    <p className="text-red-500 text-xs mt-1">{errors.facebook_url.message}</p>
                  )}
                </div>

                <div>
                  <Label>Instagram URL </Label>
                  <Input
                    type="url"
                    placeholder="https://instagram.com/username"
                    {...register("instagram_url", {
                      required: "Instagram URL is required",
                      pattern: {
                        value: /^https?:\/\/.+\..+/,
                        message: "Enter a valid URL",
                      },
                    })}
                  />
                  {errors.instagram_url && (
                    <p className="text-red-500 text-xs mt-1">{errors.instagram_url.message}</p>
                  )}
                </div>

                <div>
                  <Label>References </Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Reference 1"
                      {...register("references.0", {
                        required: "Reference 1 is required",
                      })}
                    />
                    {errors.references?.[0] && (
                      <p className="text-red-500 text-xs mt-1">{errors.references[0]?.message}</p>
                    )}

                    <Input
                      placeholder="Reference 2"
                      {...register("references.1", {
                        required: "Reference 2 is required",
                      })}
                    />
                    {errors.references?.[1] && (
                      <p className="text-red-500 text-xs mt-1">{errors.references[1]?.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <Controller
                    control={control}
                    name="terms"
                    rules={{ required: "You must accept the terms" }}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onChange={field.onChange} />
                    )}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    By creating an account you agree to our{" "}
                    <span className="font-medium underline cursor-pointer hover:text-brand-500">Terms and Conditions</span>{" "}
                    and{" "}
                    <span className="font-medium underline cursor-pointer hover:text-brand-500">Privacy Policy</span>
                  </p>
                </div>
                {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-sm font-semibold text-white rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all shadow-sm shadow-brand-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </>
            )}

          </div>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-brand-500 hover:text-brand-600 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}