import * as yup from "yup";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { ApiHelper } from "../../utils/ApiHelper";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { encryptLocalStorage } from "../../utils/DparcelHelper";

const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

type FormData = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await ApiHelper("POST", "/login", data);

      if (res.status === 200) {
        const { message, user, permissions, token } = res.data;
        encryptLocalStorage("access_token", token);
        encryptLocalStorage("user", user);
        encryptLocalStorage("permissions", permissions);

        toast.success(message || "Login successful!", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#4caf50",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: "🎉",
        });

        setTimeout(() => {
          if (res.data.user.roles.includes("shipper")) {
            navigate("/shipper/dashboard");
          } else if (res.data.user.roles.includes("shopper")) {
            navigate("/shopper/request");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        toast.error(res.data.message || "Login failed ❌");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: "⚠️",
      });
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
              Welcome Back
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Sign In
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">

            {/* Email */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline underline-offset-2 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Keep me logged in
              </span>
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Sign up links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Don’t have an account?
          </p>

          <div className="flex items-center justify-center gap-4">

            {/* Shipper Card */}
            <Link
              to="/shipper/signup"
              state={{ role: "shipper" }}
              className="group px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-400 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-sm font-semibold text-gray-700 dark:text-white group-hover:text-brand-600">
                🚚 Shipper
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Send packages
              </div>
            </Link>

            {/* Shopper Card */}
            <Link
              to="/signup"
              state={{ role: "shopper" }}
              className="group px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-400 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-sm font-semibold text-gray-700 dark:text-white group-hover:text-brand-600">
                🛍️ Shopper
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Request items
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}