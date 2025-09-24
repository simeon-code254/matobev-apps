import React from 'react';

interface StatsDisplayProps {
  stats: {
    speed?: number;
    stamina?: number;
    passing?: number;
    shooting?: number;
    strength?: number;
    dribbling?: number;
    overall_rating?: number;
  };
  compact?: boolean;
}

export default function StatsDisplay({ stats, compact = false }: StatsDisplayProps) {
  const statItems = [
    { key: 'speed', label: 'SPD', value: stats.speed },
    { key: 'stamina', label: 'STA', value: stats.stamina },
    { key: 'passing', label: 'PAS', value: stats.passing },
    { key: 'shooting', label: 'SHO', value: stats.shooting },
    { key: 'strength', label: 'STR', value: stats.strength },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-1">
        {statItems.map(({ key, label, value }) => (
          <div
            key={key}
            className="bg-slate-100 rounded px-2 py-1 text-center"
          >
            <div className="text-xs font-medium text-slate-600">{label}</div>
            <div className="text-xs font-bold text-slate-900">
              {value !== undefined ? value : '—'}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Overall Rating */}
      {stats.overall_rating !== undefined && (
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">
            {stats.overall_rating.toFixed(1)}
          </div>
          <div className="text-sm text-slate-600">Overall Rating</div>
        </div>
      )}

      {/* Individual Stats */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map(({ key, label, value }) => (
          <div key={key} className="text-center">
            <div className="text-lg font-bold text-slate-900">
              {value !== undefined ? value : '—'}
            </div>
            <div className="text-xs text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Dribbling if available */}
      {stats.dribbling !== undefined && (
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">
            {stats.dribbling}
          </div>
          <div className="text-xs text-slate-600">Dribbling</div>
        </div>
      )}
    </div>
  );
}
