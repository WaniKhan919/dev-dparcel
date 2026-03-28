import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { ApiHelper } from "../../utils/ApiHelper";
import { encryptLocalStorage } from "../../utils/DparcelHelper";

interface SignUpFormProps {
  role: string;
}

const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  terms: yup.boolean().oneOf([true], "You must accept the terms").required(),
}).required();

type FormValues = {
  name: string;
  email: string;
  password: string;
  terms: boolean;
};

export default function SignUpForm({ role }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        role: role,
      };

      const toastId = toast.loading("Signing up...");

      const res: any = await ApiHelper("POST", "/signup", payload);

      if (res?.status === 201) {
        toast.success(res.data.message || "Registered successfully", {
          duration: 3000,
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
      {/* Back link */}
      <div className="w-full max-w-md mx-auto pt-6 sm:pt-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 group"
        >
          <ChevronLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to dashboard
        </Link>
      </div>

      {/* Main content */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400 tracking-wide uppercase">
              Create Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Join us today
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to get started
          </p>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="inline-flex items-center justify-center gap-2.5 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm dark:bg-white/5 dark:text-white/80 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/>
              <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/>
              <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/>
              <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/>
            </svg>
            Google
          </button>
          <button className="inline-flex items-center justify-center gap-2.5 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm dark:bg-white/5 dark:text-white/80 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20">
            <svg width="18" height="18" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
              <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z"/>
            </svg>
            Twitter / X
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs font-medium text-gray-400 bg-white dark:bg-gray-900 dark:text-gray-500 tracking-widest uppercase">
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">

            {/* Name */}
            <div>
              <Label>
                Full Name <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="name"
                placeholder="John Doe"
                {...register("name")}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Min. 8 characters"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeIcon className="fill-current size-4" />
                  ) : (
                    <EyeCloseIcon className="fill-current size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <Controller
                  control={control}
                  name="terms"
                  render={({ field }) => (
                    <Checkbox
                      className="w-4 h-4 mt-0.5 shrink-0"
                      checked={field.value}
                      onChange={(val: boolean) => field.onChange(val)}
                    />
                  )}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  By creating an account you agree to our{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200 underline underline-offset-2 cursor-pointer hover:text-brand-500 transition-colors">
                    Terms and Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200 underline underline-offset-2 cursor-pointer hover:text-brand-500 transition-colors">
                    Privacy Policy
                  </span>
                </p>
              </div>
              {errors.terms && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
                  </svg>
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all shadow-sm shadow-brand-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin size-4 text-white/80" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline underline-offset-2 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}