import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface ProgressiveDisclosureProps {
  title: string;
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  triggerClassName?: string;
  contentClassName?: string;
}

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: 'card' | 'outline' | 'minimal';
  onToggle?: (isOpen: boolean) => void;
}

/**
 * ProgressiveDisclosure Component
 * 
 * Shows summary/KPI information by default, with expandable detailed content.
 * Reduces cognitive load by presenting high-level data first.
 * 
 * Mobile-First Strategy:
 * - Shows KPIs only on mobile (< 768px)
 * - Expands to show table/detailed view when needed
 * - Smooth animations for better UX
 */
export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  summary,
  children,
  defaultOpen = false,
  onToggle,
  triggerClassName,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className="card-modern">
      <button
        className={`disclosure-trigger ${triggerClassName || ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown className="text-color-text-secondary" />
      </button>

      {summary && !isOpen && (
        <div className="p-md text-color-text-secondary">
          {summary}
        </div>
      )}

      <div className={`disclosure-content ${isOpen ? 'open' : ''} ${contentClassName || ''}`}>
        {children}
      </div>
    </div>
  );
};

/**
 * KPICard Component
 * 
 * Displays key metric with trend indicator and optional icon.
 * Touch-friendly design with minimum 48x48px tap target.
 * 
 * Features:
 * - Responsive font sizing
 * - Trend indicators (up/down/neutral)
 * - Neumorphic styling
 * - Container query responsive
 */
export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  onClick,
}) => {
  const trendColor = {
    up: 'text-color-success',
    down: 'text-color-error',
    neutral: 'text-color-text-secondary',
  }[trend || 'neutral'];

  return (
    <div
      className="card-modern cursor-pointer flex flex-col gap-spacing-md"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-between">
        <span className="text-color-text-secondary text-sm font-medium">
          {label}
        </span>
        {Icon && <Icon className="text-color-primary" style={{ width: '20px', height: '20px' }} />}
      </div>

      <div className="flex-col">
        <div className="flex items-baseline gap-spacing-sm">
          <span className="text-2xl font-bold text-color-text">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-color-text-secondary">
              {unit}
            </span>
          )}
        </div>

        {trend && trendValue && (
          <div className={`text-xs font-semibold mt-spacing-sm ${trendColor}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * KPISummaryRow Component
 * 
 * Displays multiple KPIs in a responsive grid.
 * Grid adapts from 1 column (mobile) to 4 columns (desktop).
 */
export const KPISummaryRow: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="grid gap-spacing-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
};

/**
 * ExpandableSection Component
 * 
 * Reusable expandable container with multiple style variants.
 * Perfect for tables, lists, and detailed content.
 * 
 * Variants:
 * - card: Full card styling with shadow
 * - outline: Border only
 * - minimal: No styling, just expandable
 */
export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  variant = 'card',
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const variantClasses = {
    card: 'card-modern',
    outline: 'border border-color-border rounded-lg',
    minimal: '',
  }[variant];

  return (
    <div className={variantClasses}>
      <button
        className="disclosure-trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-color-text">{title}</span>
        <ChevronDown
          className={`text-color-text-secondary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`disclosure-content ${isOpen ? 'open' : ''}`}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * TabularDataPreview Component
 * 
 * Shows abbreviated table with "View More" option before expanding.
 * Mobile-optimized: shows only 2-3 rows initially on mobile/tablet.
 */
interface TabularDataPreviewProps {
  columns: Array<{ key: string; label: string; width?: string }>;
  data: Array<Record<string, any>>;
  maxVisibleRows?: number;
  onViewMore?: () => void;
  children?: ReactNode;
}

export const TabularDataPreview: React.FC<TabularDataPreviewProps> = ({
  columns,
  data,
  maxVisibleRows = 3,
  onViewMore,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleData = isExpanded ? data : data.slice(0, maxVisibleRows);
  const hasMore = data.length > maxVisibleRows;

  return (
    <div className="card-container space-y-spacing-md">
      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="data-table w-full text-sm">
          <thead>
            <tr className="border-b border-color-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-spacing-md py-spacing-md text-left font-semibold text-color-text-secondary"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-color-border hover:bg-color-bg-tertiary transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={`${idx}-${col.key}`}
                    className="px-spacing-md py-spacing-md text-color-text"
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View More Button */}
      {hasMore && !isExpanded && (
        <button
          className="btn-view-more w-full"
          onClick={() => {
            setIsExpanded(true);
            onViewMore?.();
          }}
        >
          View All ({data.length} items)
        </button>
      )}

      {/* Collapse Button */}
      {isExpanded && hasMore && (
        <button
          className="btn-view-more w-full"
          onClick={() => setIsExpanded(false)}
        >
          Show Less
        </button>
      )}

      {/* Custom Content */}
      {children}
    </div>
  );
};

export default ProgressiveDisclosure;
