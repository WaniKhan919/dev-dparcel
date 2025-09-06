import * as yup from "yup";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ApiHelper } from "../../utils/ApiHelper";
import { decryptLocalStorage } from "../../utils/DparcelHelper"; // assuming you have decrypt util

// Profile Schema
const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().required("Email is required"),
  phone: yup.string().required("Phone is required"),
});

// Password Schema
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

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
};

type PasswordFormData = {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // get user from localStorage
  const user = decryptLocalStorage("user") || {};

  // Profile Form Hook
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  // Password Form Hook
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  // Handle Profile Update
  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      const res = await ApiHelper("PUT", "/update-profile", data);
      if (res.status === 200) {
        toast.success(res.data.message || "Profile updated successfully", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#4caf50",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: "🎉",
        });
      } else {
        toast.success(res.data.message ||"Profile update failed ❌", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#af4c4cff",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: "🎉",
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile update failed!");
    }
  };

  // Handle Password Update
  const onUpdatePassword = async (data: PasswordFormData) => {
    try {
      const res = await ApiHelper("PUT", "/update-password", data);
      if (res.status === 200) {
        toast.success(res.data.message || "Password updated successfully", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#4caf50",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: "🎉",
        });
      } else {
        toast.success(res.data.message || "Password update failed ❌", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#af4c4cff",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: "🎉",
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN - Info Card */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 flex flex-col items-center text-center">
        {/* Profile Icon */}
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>

        </div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
          Personal Information
        </h4>
        <div className="space-y-5 w-full text-left">
          <div>
            <p className="mb-1 text-xs text-gray-500">Name</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Update Tabs */}
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Update Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "password"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Form */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
            <div>
              <Label>Name</Label>
              <Input placeholder="Enter your name" {...registerProfile("name")} />
              {profileErrors.name && (
                <p className="text-red-500 text-sm">{profileErrors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="Enter email" {...registerProfile("email")} />
              {profileErrors.email && (
                <p className="text-red-500 text-sm">{profileErrors.email.message}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="Enter phone" {...registerProfile("phone")} />
            </div>
            <Button type="submit" disabled={profileSubmitting}>
              {profileSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        )}

        {/* Password Form */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-5">
            <div>
              <Label>Old Password</Label>
              <Input
                type="password"
                placeholder="Enter old password"
                {...registerPassword("old_password")}
              />
              {passwordErrors.old_password && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.old_password.message}
                </p>
              )}
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                {...registerPassword("new_password")}
              />
              {passwordErrors.new_password && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.new_password.message}
                </p>
              )}
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                {...registerPassword("new_password_confirmation")}
              />
              {passwordErrors.new_password_confirmation && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.new_password_confirmation.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={passwordSubmitting}>
              {passwordSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
