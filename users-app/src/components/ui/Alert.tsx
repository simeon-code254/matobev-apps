import React from "react";

type Variant = "info" | "success" | "warning" | "error";

export default function Alert({ children, variant = "info", className = "" }: { children: React.ReactNode; variant?: Variant; className?: string }) {
  const map: Record<Variant, string> = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };
  return <div className={`rounded-lg border px-3 py-2 text-sm ${map[variant]} ${className}`}>{children}</div>;
}
