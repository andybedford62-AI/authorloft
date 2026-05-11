"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "edit" | "add" | "delete" | "view" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  edit:   "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
  add:    "text-green-600 hover:text-green-700 hover:bg-green-50",
  delete: "text-red-600  hover:text-red-700  hover:bg-red-50",
  view:   "text-gray-900 hover:text-gray-800 hover:bg-gray-100",
  ghost:  "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
};

interface IconButtonProps {
  icon:      ReactNode;
  title:     string;
  onClick?:  () => void;
  disabled?: boolean;
  loading?:  boolean;
  variant?:  Variant;
  type?:     "button" | "submit";
  className?: string;
}

export function IconButton({
  icon,
  title,
  onClick,
  disabled = false,
  loading  = false,
  variant  = "ghost",
  type     = "button",
  className,
}: IconButtonProps) {
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
        ${className || ""}
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
