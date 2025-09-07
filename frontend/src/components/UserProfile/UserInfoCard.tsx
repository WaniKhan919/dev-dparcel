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
<div className="w-full space-y-6">
  {/* Tabs Card - always full width */}
  <div className="w-full">
    <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <div className="flex space-x-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Update Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "password"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Change Password
        </button>
      </div>
    </div>
  </div>

  {/* Form Card - responsive width */}
  <div className="w-full lg:w-1/2">
    <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      {/* Profile Form */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleProfileSubmit(onUpdateProfile)}
          className="space-y-5"
        >
          <div>
            <Label>Name</Label>
            <Input placeholder="Enter your name" {...registerProfile("name")} />
            {profileErrors.name && (
              <p className="text-red-500 text-sm">
                {profileErrors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label>Email</Label>
            <Input placeholder="Enter email" {...registerProfile("email")} />
            {profileErrors.email && (
              <p className="text-red-500 text-sm">
                {profileErrors.email.message}
              </p>
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
        <form
          onSubmit={handlePasswordSubmit(onUpdatePassword)}
          className="space-y-5"
        >
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
</div>


  );
}
