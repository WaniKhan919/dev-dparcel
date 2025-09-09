import { useState } from "react";
import DashboardPermissions from "./DashboardPermission";

interface AssignPermissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignPermissionDrawer({
  isOpen,
  onClose,
}: AssignPermissionDrawerProps) {
  const [showTable, setShowTable] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 z-[100]">
  
      <div
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose} 
      ></div>

      <div
        className={`absolute top-20 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Assign New Permission</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Type <span className="text-red-500">*</span>
              </label>
              <select className="w-full border rounded-lg px-3 py-2">
                <option>Regulatory Auditee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <select className="w-full border rounded-lg px-3 py-2">
                <option>PakteIecom (Basic Regulatory Auditee)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowTable(true)}
              className=" bg-blue-600 text-white px-4 py-2 rounded-lg w-full md:w-auto"
            >
              Get Permissions
            </button>
          </div>

          {showTable && (
            <div className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => setAccordionOpen(!accordionOpen)}
                  className="w-full flex justify-between items-center  bg-blue-600 text-white px-4 py-3 font-medium"
                >
                  <span>Dashboard</span>
                  <span>{accordionOpen ? "−" : "+"}</span>
                </button>

                <DashboardPermissions />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
