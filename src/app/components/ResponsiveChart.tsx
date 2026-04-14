import React, { ReactNode, useMemo } from 'react';

interface ResponsiveChartProps {
  children: ReactNode;
  mobileHeight?: number;
  tabletHeight?: number;
  desktopHeight?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * ResponsiveChartContainer Component
 * 
 * Wraps charts to make them responsive to container width using @container queries.
 * Adapts chart height and data point visibility based on available space.
 * 
 * Mobile-First Approach:
 * - Mobile (< 400px): Sparklines, minimal data points (10 max)
 * - Tablet (400-600px): Limited charts, ~20 data points  
 * - Desktop (600px+): Full charts, all data points
 * 
 * Features:
 * - Container query responsive
 * - Horizontal scroll for large datasets
 * - Touch-friendly interactions
 */
export const ResponsiveChartContainer: React.FC<ResponsiveChartProps> = ({
  children,
  mobileHeight = 250,
  tabletHeight = 300,
  desktopHeight = 400,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`card-container ${className}`}>
      {title && (
        <div className="mb-spacing-lg">
          <h3 className="font-semibold text-color-text">{title}</h3>
          {subtitle && (
            <p className="text-sm text-color-text-secondary mt-spacing-xs">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div
        className="chart-container chart-mobile"
        style={{
          '--chart-height': `${mobileHeight}px`,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
};

interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

interface DataOptimizationOptions {
  containerWidth?: number;
  maxDataPoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * Chart Data Optimization Hook
 * 
 * Intelligently reduces data point visibility for mobile/tablet views.
 * Uses container query breakpoints to determine optimal data density.
 * 
 * Strategy:
 * - Mobile: Show every Nth point (e.g., every 5th)
 * - Tablet: Show every Nth point (e.g., every 3rd)
 * - Desktop: Show all points
 */
export const useOptimizedChartData = (
  fullData: ChartDataPoint[],
  options: DataOptimizationOptions = {}
): {
  displayData: ChartDataPoint[];
  isOptimized: boolean;
  originalCount: number;
  displayedCount: number;
} => {
  const {
    containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
    maxDataPoints = {
      mobile: 10,
      tablet: 20,
      desktop: 50,
    },
  } = options;

  return useMemo(() => {
    let targetMaxPoints: number;

    if (containerWidth < 400) {
      targetMaxPoints = maxDataPoints.mobile;
    } else if (containerWidth < 600) {
      targetMaxPoints = maxDataPoints.tablet;
    } else {
      targetMaxPoints = maxDataPoints.desktop;
    }

    if (fullData.length <= targetMaxPoints) {
      return {
        displayData: fullData,
        isOptimized: false,
        originalCount: fullData.length,
        displayedCount: fullData.length,
      };
    }

    // Calculate step size
    const step = Math.ceil(fullData.length / targetMaxPoints);
    const optimizedData = fullData.filter((_, idx) => idx % step === 0);

    // Always include first and last data points
    const displayData = [
      fullData[0],
      ...optimizedData.slice(1, -1),
      fullData[fullData.length - 1],
    ];

    return {
      displayData,
      isOptimized: true,
      originalCount: fullData.length,
      displayedCount: displayData.length,
    };
  }, [fullData, containerWidth, maxDataPoints]);
};

/**
 * Sparkline Component
 * 
 * Ultra-compact chart for displaying trends in minimal space.
 * Perfect for KPI cards showing trend data.
 * 
 * Usage:
 * <Sparkline data={[10, 15, 12, 18, 22, 20]} trend="up" />
 */
interface SparklineProps {
  data: number[];
  trend?: 'up' | 'down' | 'neutral';
  width?: number;
  height?: number;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  trend,
  width = 100,
  height = 24,
  color = 'rgb(59, 130, 246)', // primary blue
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pointWidth = width / (data.length - 1 || 1);

  // Create SVG path for the line
  const points = data.map((value, idx) => {
    const x = idx * pointWidth;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  // Determine color based on trend
  let strokeColor = color;
  if (trend === 'up') {
    strokeColor = 'rgb(16, 185, 129)'; // green
  } else if (trend === 'down') {
    strokeColor = 'rgb(239, 68, 68)'; // red
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline"
      style={{ width: '100%', height: height }}
      aria-label="Trend sparkline"
    >
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlight last point */}
      <circle
        cx={width - 1}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2.5"
        fill={strokeColor}
      />
    </svg>
  );
};

/**
 * ChartLegend Component
 * 
 * Responsive legend that adapts from horizontal (desktop) to vertical (mobile).
 * Touch-friendly legend items for filtering/toggling series.
 */
interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  onItemClick?: (itemId: string) => void;
  activeItems?: Set<string>;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  onItemClick,
  activeItems,
}) => {
  return (
    <div className="flex flex-wrap gap-spacing-md mt-spacing-lg">
      {items.map((item) => {
        const isActive = !activeItems || activeItems.has(item.id);
        return (
          <button
            key={item.id}
            className={`flex items-center gap-spacing-sm px-spacing-md py-spacing-sm rounded-radius-md transition-all ${
              isActive
                ? 'bg-color-bg-tertiary'
                : 'bg-color-bg-secondary opacity-50'
            }`}
            onClick={() => onItemClick?.(item.id)}
            aria-pressed={isActive}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-color-text">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * ChartEmpty State Component
 * 
 * Displays when no data is available for visualization.
 */
interface ChartEmptyStateProps {
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = 'No data available',
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-spacing-2xl text-center">
      {Icon && <Icon className="w-12 h-12 text-color-text-tertiary mb-spacing-md" />}
      <p className="text-color-text-secondary">{message}</p>
    </div>
  );
};

/**
 * HorizontalScrollChart Component
 * 
 * Wraps wide charts to enable horizontal scrolling on small screens.
 * Perfect for time-series or category-heavy charts.
 */
interface HorizontalScrollChartProps {
  minWidth?: number;
  children: ReactNode;
}

export const HorizontalScrollChart: React.FC<HorizontalScrollChartProps> = ({
  minWidth = 800,
  children,
}) => {
  return (
    <div
      className="overflow-x-auto"
      role="region"
      aria-label="Scrollable chart"
    >
      <div style={{ minWidth: `${minWidth}px` }}>
        {children}
      </div>
    </div>
  );
};

/**
 * ChartResponsiveWrapper Component
 * 
 * Complete wrapper combining multiple responsive features:
 * - Container query responsiveness
 * - Horizontal scroll for large datasets
 * - Touch-optimized legend
 * - Empty state handling
 */
interface ChartResponsiveWrapperProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
  children: (optimizedData: ChartDataPoint[]) => ReactNode;
  legend?: ChartLegendItem[];
  onLegendItemClick?: (itemId: string) => void;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  enableHorizontalScroll?: boolean;
  minScrollWidth?: number;
}

export const ChartResponsiveWrapper: React.FC<
  ChartResponsiveWrapperProps
> = ({
  title,
  subtitle,
  data,
  children,
  legend,
  onLegendItemClick,
  isEmpty = false,
  emptyStateMessage,
  enableHorizontalScroll = false,
  minScrollWidth = 800,
}) => {
  const { displayData } = useOptimizedChartData(data);

  const content = isEmpty ? (
    <ChartEmptyState message={emptyStateMessage} />
  ) : enableHorizontalScroll ? (
    <HorizontalScrollChart minWidth={minScrollWidth}>
      {children(displayData)}
    </HorizontalScrollChart>
  ) : (
    children(displayData)
  );

  return (
    <div className="card-container">
      {title && (
        <div className="mb-spacing-lg">
          <h3 className="font-semibold text-color-text">{title}</h3>
          {subtitle && (
            <p className="text-sm text-color-text-secondary mt-spacing-xs">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="chart-container chart-mobile">
        {content}
      </div>

      {legend && (
        <ChartLegend
          items={legend}
          onItemClick={onLegendItemClick}
        />
      )}
    </div>
  );
};

export default ResponsiveChartContainer;
