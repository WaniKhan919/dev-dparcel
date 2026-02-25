import React from "react";

interface SpinProps {
  isOpen: boolean;
  text?: string;
}

const Spin: React.FC<SpinProps> = ({ isOpen, text }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md">
      
      {/* Modern Spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>

      {/* Optional Text */}
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-700 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Spin;
