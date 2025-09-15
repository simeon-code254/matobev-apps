import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  help?: string;
};

const Select = React.forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, help, className = "", children, ...props },
  ref
) {
  return (
    <div>
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        ref={ref}
        aria-invalid={!!error}
        className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
        {...props}
      >
        {children}
      </select>
      {help && !error && <div className="text-xs text-slate-500 mt-1">{help}</div>}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
});

export default Select;
