import React from 'react';

interface CountryFlagProps {
  country: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CountryFlag({ country, size = 'md' }: CountryFlagProps) {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-sm overflow-hidden bg-slate-200 flex items-center justify-center`}>
      <span className="text-xs font-bold text-slate-600">
        {country.toUpperCase()}
      </span>
    </div>
  );
}
