"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "success" | "danger" | "warning" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  danger:  "bg-red-600  hover:bg-red-700  text-white",
  warning: "bg-amber-500 hover:bg-amber-600 text-white",
  ghost:   "bg-transparent hover:bg-gray-100 text-gray-600 [data-admin-theme=dark_&]:hover:bg-gray-700 [data-admin-theme=dark_&]:text-gray-300",
};

export function IconButton({
  icon,
  title,
  onClick,
  disabled = false,
  loading  = false,
  variant  = "ghost",
  type     = "button",
}: {
  icon:      ReactNode;
  title:     string;
  onClick?:  () => void;
  disabled?: boolean;
  loading?:  boolean;
  variant?:  Variant;
  type?:     "button" | "submit";
}) {
  return (
    <button
      type={type}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative group/tip p-1.5 rounded transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
      `}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}

      {/* Tooltip */}
      <span className="
        pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
        whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white
        opacity-0 group-hover/tip:opacity-100 transition-opacity z-50
      ">
        {title}
      </span>
    </button>
  );
}
