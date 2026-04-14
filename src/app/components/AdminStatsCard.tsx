import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'red';
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    label: 'text-blue-700',
    accent: 'bg-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    label: 'text-green-700',
    accent: 'bg-green-100',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    label: 'text-purple-700',
    accent: 'bg-purple-100',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    label: 'text-orange-700',
    accent: 'bg-orange-100',
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
    label: 'text-cyan-700',
    accent: 'bg-cyan-100',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    label: 'text-red-700',
    accent: 'bg-red-100',
  },
};

export function AdminStatsCard({
  label,
  value,
  icon: Icon,
  color,
  description,
  trend,
}: AdminStatsCardProps) {
  const colors = colorConfig[color];

  return (
    <div
      className={`${colors.bg} ${colors.border} rounded-lg p-5 border-2 flex flex-col justify-between hover:shadow-md transition-shadow h-full`}
    >
      {/* Header: Icon and Label */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className={`${colors.accent} rounded-lg p-3 flex-shrink-0`}>
          <Icon className={`${colors.icon} w-6 h-6`} />
        </div>
      </div>

      {/* Value Display */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
