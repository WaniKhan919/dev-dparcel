import * as yup from "yup";
import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { ChevronLeftIcon } from "../../icons";
import { ApiHelper } from "../../utils/ApiHelper";

const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
});

type FormData = { email: string };

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await ApiHelper("POST", "/forgot-password", data);
      if (res.status === 200) {
        setSent(true);
      } else {
        setError("email", { message: res.data.message || "Something went wrong" });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.email?.[0] ??
        err.response?.data?.message ??
        "Something went wrong";
      setError("email", { message: msg });
    }
  };

  return (
    <>
      <PageMeta title="Forgot Password" description="" />
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
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check your email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We sent a password reset link to your email. The link expires in 15 minutes.
                </p>
                <Link
                  to="/signin"
                  className="inline-block mt-4 text-sm font-medium text-brand-500 hover:text-brand-600 hover:underline underline-offset-2"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    Forgot password?
                  </h1>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <div>
                    <Label>Email <span className="text-error-500">*</span></Label>
                    <Input type="email" placeholder="you@example.com" {...register("email")} />
                    {errors.email && (
                      <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                        <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                        </svg>
                        {errors.email.message}
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
