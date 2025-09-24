import React from 'react';

interface DashCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function DashCard({ title, children, action, className = '' }: DashCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {action && (
          <div className="text-sm">
            {action}
          </div>
        )}
      </div>
      <div className="text-slate-600">
        {children}
      </div>
    </div>
  );
}
