import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { ModernDashboardLayout, DashboardGrid, DashboardCard } from './ModernDashboardLayout';
import { 
  KPICard, 
  KPISummaryRow, 
  ProgressiveDisclosure,
  ExpandableSection,
  TabularDataPreview 
} from './ProgressiveDisclosure';
import { 
  ResponsiveChartContainer,
  ChartResponsiveWrapper,
  Sparkline,
  useOptimizedChartData 
} from './ResponsiveChart';
import { User } from '../App';

/**
 * ModernDashboardExample Component
 * 
 * Complete example showing how to integrate all new modern dashboard components:
 * - Mobile-first responsive layout
 * - Container query responsive cards
 * - Progressive disclosure for data
 * - Responsive charts with data optimization
 * - Dark mode support
 * - Neumorphic design elements
 * 
 * This serves as a template for refactoring existing dashboard pages.
 */

interface DashboardData {
  user: User;
  bookings: any[];
  vehicles: any[];
  completedServices: number;
  pendingPayments: number;
  chartData: any[];
}

interface ModernDashboardExampleProps {
  data: DashboardData;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export const ModernDashboardExample: React.FC<ModernDashboardExampleProps> = ({
  data,
  onLogout,
  onTabChange,
  activeTab,
}) => {
  // Calculate KPI metrics
  const metrics = useMemo(() => {
    const active = data.bookings.filter((b) => b.status === 'scheduled').length;
    const completed = data.bookings.filter((b) => b.status === 'completed').length;
    
    return {
      activeBookings: active,
      totalVehicles: data.vehicles.length,
      completedServices: data.completedServices,
      pendingPayments: data.pendingPayments,
      completionRate: data.bookings.length > 0 
        ? Math.round((completed / data.bookings.length) * 100) 
        : 0,
    };
  }, [data]);

  // Sample chart data for trend visualization
  const bookingTrendData = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        label: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 10) + 5,
      })),
    []
  );

  // Optimize chart data based on container width
  const { displayData: optimizedTrendData } = useOptimizedChartData(
    bookingTrendData
  );

  return (
    <ModernDashboardLayout
      user={data.user}
      onLogout={onLogout}
      title="Service Dashboard"
      subtitle={`Welcome back, ${data.user.name.split(' ')[0]}!`}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      {/* SECTION 1: KPI Summary Row
          Progressive Disclosure Pattern:
          - Mobile: KPI cards only (high-level overview)
          - Desktop: Full details visible inline
      */}
      <div className="mb-spacing-2xl">
        <h2 className="text-xl font-bold text-color-text mb-spacing-lg">
          Key Metrics
        </h2>
        
        <KPISummaryRow>
          <KPICard
            label="Active Bookings"
            value={metrics.activeBookings}
            unit="services"
            icon={TrendingUp}
            trend="up"
            trendValue="+2 this week"
          />
          
          <KPICard
            label="My Vehicles"
            value={metrics.totalVehicles}
            unit="cars"
            trend="neutral"
          />
          
          <KPICard
            label="Completed Services"
            value={metrics.completedServices}
            unit="total"
            trend="up"
            trendValue={`${metrics.completionRate}% completion`}
          />
          
          <KPICard
            label="Pending Payments"
            value={`KES ${metrics.pendingPayments.toLocaleString()}`}
            unit="due"
            trend="down"
            trendValue="-15% vs last month"
          />
        </KPISummaryRow>
      </div>

      {/* SECTION 2: Responsive Grid
          Mobile-First: 1 column
          Tablet: 2 columns
          Desktop: Auto-fit grid with min 300px width
      */}
      <div className="mb-spacing-2xl">
        <h2 className="text-xl font-bold text-color-text mb-spacing-lg">
          Overview
        </h2>

        <DashboardGrid>
          {/* Booking Trends Chart */}
          <DashboardCard 
            title="Booking Trends" 
            subtitle="Last 30 days"
            variant="glass"
          >
            <ChartResponsiveWrapper
              data={bookingTrendData}
              isEmpty={bookingTrendData.length === 0}
              emptyStateMessage="No booking data available"
              enableHorizontalScroll={true}
              minScrollWidth={600}
            >
              {(displayData) => (
                <div className="h-60 flex items-end gap-1">
                  {displayData.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-color-primary to-color-primary-light rounded-t"
                      style={{
                        height: `${(point.value / 15) * 100}%`,
                      }}
                      title={`${point.label}: ${point.value}`}
                    />
                  ))}
                </div>
              )}
            </ChartResponsiveWrapper>
          </DashboardCard>

          {/* Latest Services */}
          <DashboardCard 
            title="Latest Services" 
            subtitle="Your recent activities"
          >
            <div className="space-y-spacing-md">
              {data.completedServices > 0 ? (
                <>
                  <div className="flex items-center justify-between p-spacing-md bg-color-bg-tertiary rounded-radius-md">
                    <div>
                      <p className="font-medium text-sm text-color-text">
                        Oil Change Service
                      </p>
                      <p className="text-xs text-color-text-secondary">
                        Completed • 2 days ago
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-color-success">✓</div>
                  </div>

                  <button className="btn-view-more w-full">
                    View All Services ({data.completedServices})
                  </button>
                </>
              ) : (
                <div className="text-center py-spacing-lg">
                  <AlertCircle className="w-8 h-8 text-color-text-tertiary mx-auto mb-spacing-md" />
                  <p className="text-sm text-color-text-secondary">
                    No completed services yet
                  </p>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Quick Stats */}
          <DashboardCard 
            title="This Month" 
            subtitle="Service statistics"
            variant="elevated"
          >
            <div className="space-y-spacing-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-color-text-secondary">
                  Total Spent
                </span>
                <span className="font-bold text-lg text-color-primary">
                  KES 45,000
                </span>
              </div>

              <div className="h-1 bg-color-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-color-success to-color-primary"
                  style={{ width: '72%' }}
                />
              </div>

              <div className="text-xs text-color-text-secondary">
                72% of monthly budget used
              </div>
            </div>
          </DashboardCard>

          {/* Performance Sparklines */}
          <DashboardCard title="Performance" subtitle="7-day trend">
            <div className="space-y-spacing-lg">
              <div>
                <p className="text-xs text-color-text-secondary mb-spacing-sm">
                  Bookings Completed
                </p>
                <Sparkline
                  data={[2, 3, 2, 4, 3, 5, 4]}
                  trend="up"
                  height={40}
                />
              </div>

              <div>
                <p className="text-xs text-color-text-secondary mb-spacing-sm">
                  Avg Service Time
                </p>
                <Sparkline
                  data={[120, 115, 110, 105, 100, 95, 90]}
                  trend="down"
                  height={40}
                />
              </div>
            </div>
          </DashboardCard>
        </DashboardGrid>
      </div>

      {/* SECTION 3: Progressive Disclosure - Detailed Tables
          Mobile: Shows summary only, "View More" to expand
          Desktop: Full table visible, collapse button
      */}
      <div className="mb-spacing-2xl">
        <h2 className="text-xl font-bold text-color-text mb-spacing-lg">
          Detailed Information
        </h2>

        <div className="space-y-spacing-lg">
          {/* Bookings Table with Progressive Disclosure */}
          <ExpandableSection 
            title={`Recent Bookings (${data.bookings.length} total)`}
            defaultOpen={true}
          >
            <TabularDataPreview
              columns={[
                { key: 'date', label: 'Date', width: '25%' },
                { key: 'service', label: 'Service', width: '35%' },
                { key: 'amount', label: 'Amount', width: '20%' },
                { key: 'status', label: 'Status', width: '20%' },
              ]}
              data={data.bookings.slice(0, 10).map((b) => ({
                date: new Date(b.booking_datetime).toLocaleDateString(),
                service: b.service_name || 'Service',
                amount: `KES ${(b.amount || 0).toLocaleString()}`,
                status: (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      b.status === 'completed'
                        ? 'bg-color-success text-white'
                        : b.status === 'scheduled'
                        ? 'bg-color-info text-white'
                        : 'bg-color-warning text-white'
                    }`}
                  >
                    {b.status}
                  </span>
                ),
              }))}
              maxVisibleRows={3}
            />
          </ExpandableSection>

          {/* Vehicles Table with Progressive Disclosure */}
          <ExpandableSection 
            title={`My Vehicles (${data.vehicles.length} total)`}
          >
            <TabularDataPreview
              columns={[
                { key: 'name', label: 'Vehicle', width: '40%' },
                { key: 'plate', label: 'Plate', width: '30%' },
                { key: 'year', label: 'Year', width: '30%' },
              ]}
              data={data.vehicles.map((v) => ({
                name: v.name || 'Unknown',
                plate: v.plate_number || 'N/A',
                year: v.year || 'N/A',
              }))}
              maxVisibleRows={2}
            />
          </ExpandableSection>

          {/* Payment Summary with Progressive Disclosure */}
          <ExpandableSection 
            title="Payment Summary"
            variant="outline"
          >
            <div className="space-y-spacing-md p-spacing-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-color-text-secondary">
                  Total Due
                </span>
                <span className="font-bold text-lg text-color-error">
                  KES {metrics.pendingPayments.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-color-text-secondary">
                  Paid This Month
                </span>
                <span className="font-bold text-lg text-color-success">
                  KES 25,000
                </span>
              </div>

              <button className="btn-view-more w-full mt-spacing-lg">
                View Payment History
              </button>
            </div>
          </ExpandableSection>
        </div>
      </div>
    </ModernDashboardLayout>
  );
};

/**
 * Usage Example:
 * 
 * In your customer-portal.tsx, replace the default dashboard view with:
 * 
 * {activeTab === 'overview' && (
 *   <ModernDashboardExample
 *     data={{
 *       user,
 *       bookings: data.bookings,
 *       vehicles: data.vehicles,
 *       completedServices: data.bookings.filter(b => b.status === 'completed').length,
 *       pendingPayments: calculatePendingPayments(data.bookings),
 *       chartData: generateChartData(data.bookings),
 *     }}
 *     onLogout={onLogout}
 *     onTabChange={setActiveTab}
 *     activeTab={activeTab}
 *   />
 * )}
 */

export default ModernDashboardExample;
