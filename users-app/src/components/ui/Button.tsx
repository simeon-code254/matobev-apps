import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export default function Button({ className = "", variant = "primary", fullWidth, disabled, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-600",
    secondary: "bg-white/90 text-blue-700 border border-slate-200 hover:bg-white focus:ring-blue-600",
    ghost: "bg-transparent text-white hover:bg-white/10 focus:ring-white/60",
  };
  const width = fullWidth ? "w-full" : "";
  return <button className={`${base} ${variants[variant]} ${width} ${className}`} disabled={disabled} {...props} />;
}
