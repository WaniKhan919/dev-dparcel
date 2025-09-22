import { useEffect, useMemo, useState } from "react";
import { fetchPermission } from "../../slices/permissionSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";

interface AssignPermissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignPermissionDrawer({
  isOpen,
  onClose,
}: AssignPermissionDrawerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, permissionsLoading, error } = useSelector((state: any) => state.permissions);
  useEffect(() => {
      dispatch(fetchPermission());
  }, [dispatch]);

  const roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Manager" },
    { id: 3, name: "User" },
  ];

  const mappedPermissions = useMemo(() => {
    if (!permissions) return [];
    return permissions.map((record: any) => ({
      id: record.id,
      name: record.name,
      code: record.code,
    }));
  }, [permissions]);

  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  if (!isOpen) return null;

  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissions.map((p:any) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = () => {
    if (!selectedRole) {
      alert("⚠️ Please select a role first!");
      return;
    }

    console.log("Submitting:", {
      roleId: selectedRole,
      permissions: selectedPermissions,
    });

    alert(
      `✅ Assigned ${selectedPermissions.length} permissions to role ID ${selectedRole}`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Assign Permissions</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 h-[calc(100%-60px)] flex flex-col">
          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Role <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={selectedRole ?? ""}
              onChange={(e) => setSelectedRole(Number(e.target.value))}
            >
              <option value="" disabled>
                Choose a role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select All Button */}
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Permissions</h3>
            <button
              onClick={handleSelectAll}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
            >
              {selectAll ? "Unselect All" : "Select All"}
            </button>
          </div>

          {/* Permissions Grid */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mappedPermissions.map((permission:any) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 text-sm text-gray-700 border rounded-md px-2 py-1 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                  />
                  {permission.name}
                </label>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Assign Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
