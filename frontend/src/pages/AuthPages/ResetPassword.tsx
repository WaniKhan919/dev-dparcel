import * as yup from "yup";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { ApiHelper } from "../../utils/ApiHelper";

const schema = yup.object().shape({
  password: yup.string().min(8, "Minimum 8 characters").required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

type FormData = { password: string; password_confirmation: string };

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await ApiHelper("POST", "/reset-password", { ...data, token });
      if (res.status === 200) {
        toast.success(res.data.message || "Password reset successfully!");
        setTimeout(() => navigate("/signin"), 1500);
      } else {
        toast.error(res.data.message || "Reset failed. Link may have expired.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <PageMeta title="Reset Password" description="" />
      <AuthLayout>
        <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
          <div className="w-full max-w-md mx-auto pt-6 sm:pt-10 px-4">
            <Link
              to="/signin"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 group"
            >
              <ChevronLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Back to sign in
            </Link>
          </div>

          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Set new password
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Must be at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Password */}
              <div>
                <Label>New Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 right-4 top-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeIcon className="fill-current size-4" /> : <EyeCloseIcon className="fill-current size-4" />}
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

              {/* Confirm Password */}
              <div>
                <Label>Confirm Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...register("password_confirmation")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute z-30 -translate-y-1/2 right-4 top-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeIcon className="fill-current size-4" /> : <EyeCloseIcon className="fill-current size-4" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                    <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                    </svg>
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all shadow-sm shadow-brand-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin size-4 text-white/80" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
