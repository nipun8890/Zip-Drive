"use client"; // Remove if not using Next.js App Router

import React from "react";
import { MapPin } from "lucide-react"; // Lightweight, beautiful icons (alternative: react-icons)

interface LocationInputProps {
  /** Current displayed location value */
  value: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Whether the input is read-only (usually true for location selectors) */
  readOnly?: boolean;
  /** Click handler – typically opens a location picker/modal */
  onClick?: () => void;
  /** Optional custom className for the wrapper */
  className?: string;
  /** Optional custom icon – defaults to MapPin */
  icon?: React.ReactNode;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  placeholder = "Select location",
  readOnly = true,
  onClick = () => {},
  className = "",
  icon,
}) => {
  const defaultIcon = icon ?? <MapPin className="w-5 h-5 text-gray-500" />;

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onClick={onClick}
        className={`
          w-full
          px-4 py-3
          pr-12  /* Extra right padding for icon */
          border border-gray-300
          rounded-lg
          bg-white
          text-gray-900
          placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${readOnly || onClick() ? "cursor-pointer" : "cursor-text"}
          transition-all duration-200
        `}
      />

      {/* Location Icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        {defaultIcon}
      </div>
    </div>
  );
};

export default LocationInput;
