import React, { ReactNode, useState } from 'react';
import { User } from '../App';
import { LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { ResponsiveNavigation } from './ResponsiveNavigation';
import { useTheme } from '../contexts/ThemeContext';

interface ModernDashboardLayoutProps {
  user: User;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * ModernDashboardLayout Component
 * 
 * Mobile-first, responsive dashboard layout using modern CSS techniques:
 * - CSS Grid with fluid columns
 * - Container Queries for component-level responsiveness
 * - Bottom navigation on mobile (< 768px)
 * - Sidebar navigation on desktop
 * - Dark mode support
 * - Neumorphic design with CSS variables
 * 
 * Layout Structure:
 * Mobile (< 768px):
 *   - Header with logo, title, user menu
 *   - Main content area (full width)
 *   - Bottom navigation bar
 * 
 * Tablet/Desktop (≥ 768px):
 *   - Header
 *   - Sidebar navigation (left)
 *   - Main content area
 */
export const ModernDashboardLayout: React.FC<ModernDashboardLayoutProps> = ({
  user,
  onLogout,
  title,
  subtitle,
  children,
  activeTab,
  onTabChange,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="dashboard-container min-h-screen bg-color-bg">
      {/* Header */}
      <header className="sticky top-0 z-z-sticky bg-color-bg border-b border-color-border shadow-shadow-light">
        <div className="flex items-center justify-between px-spacing-lg py-spacing-md md:px-spacing-xl md:py-spacing-lg">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-spacing-md flex-1">
            <div className="w-10 h-10 rounded-radius-md bg-color-primary flex items-center justify-center">
              <span className="text-white font-bold">AS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-color-text">
                {title || 'Dashboard'}
              </h1>
              {subtitle && (
                <p className="text-xs text-color-text-secondary">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center gap-spacing-md">
            {/* Theme Toggle */}
            <button
              className="theme-toggle hidden sm:flex"
              onClick={toggleTheme}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM5 8a1 1 0 100-2H4a1 1 0 100 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex-center gap-spacing-sm p-spacing-sm rounded-radius-md hover:bg-color-bg-tertiary transition-colors"
                aria-haspopup="true"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 rounded-radius-full bg-color-primary flex-center text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-color-text">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-color-text-secondary capitalize">
                    {user.role}
                  </p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-spacing-sm w-48 bg-color-bg border border-color-border rounded-radius-lg shadow-shadow-heavy z-z-dropdown">
                  <div className="p-spacing-md border-b border-color-border">
                    <p className="font-medium text-sm text-color-text">
                      {user.name}
                    </p>
                    <p className="text-xs text-color-text-secondary">
                      {user.email}
                    </p>
                  </div>

                  <button className="w-full flex items-center gap-spacing-md px-spacing-md py-spacing-md text-color-text hover:bg-color-bg-tertiary transition-colors text-sm">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-spacing-md px-spacing-md py-spacing-md text-color-error hover:bg-color-bg-tertiary transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-var(--header-height))]">
        {/* Mobile Bottom Navigation */}
        <ResponsiveNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          userName={user.name}
          onThemeToggle={toggleTheme}
          isDarkMode={isDark}
        />

        {/* Desktop Sidebar Navigation */}
        <nav className="nav-sidebar mobile-hidden md:flex md:flex-col md:w-64 bg-color-bg-secondary border-r border-color-border">
          {/* User Info */}
          <div className="p-spacing-lg border-b border-color-border">
            <h3 className="font-bold text-color-text">Dashboard</h3>
            <p className="text-sm text-color-text-secondary mt-spacing-sm">
              {user.name}
            </p>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-spacing-sm p-spacing-lg flex-1">
            <NavSidebarLink
              label="Dashboard"
              icon="📊"
              isActive={activeTab === 'overview'}
              onClick={() => onTabChange('overview')}
            />
            <NavSidebarLink
              label="Vehicles"
              icon="🚗"
              isActive={activeTab === 'vehicles'}
              onClick={() => onTabChange('vehicles')}
            />
            <NavSidebarLink
              label="Bookings"
              icon="📅"
              isActive={activeTab === 'bookings'}
              onClick={() => onTabChange('bookings')}
            />
            <NavSidebarLink
              label="Shop"
              icon="🛒"
              isActive={activeTab === 'parts'}
              onClick={() => onTabChange('parts')}
            />
          </div>

          {/* Bottom Actions */}
          <div className="p-spacing-lg border-t border-color-border">
            <button className="w-full flex items-center justify-center gap-spacing-md px-spacing-md py-spacing-sm rounded-radius-md bg-color-bg-tertiary hover:bg-color-border transition-colors text-sm font-medium text-color-text">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="dashboard-main-content flex-1 w-full">
          <div className="p-spacing-lg md:p-spacing-xl max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * NavSidebarLink Component
 * Helper for sidebar navigation items
 */
interface NavSidebarLinkProps {
  label: string;
  icon: string | React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

const NavSidebarLink: React.FC<NavSidebarLinkProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        nav-sidebar-item
        ${isActive ? 'active' : ''}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
};

/**
 * DashboardGrid Component
 * 
 * Responsive grid container for dashboard cards.
 * Uses CSS Grid with auto-fit and container queries.
 * 
 * Responsive behavior:
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1024px): 2 columns
 * - Desktop (1024px+): 3-4 columns (auto-fit, min-width 300px)
 */
interface DashboardGridProps {
  children: ReactNode;
  columns?: number;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="dashboard-grid">
      {children}
    </div>
  );
};

/**
 * DashboardCard Component
 * 
 * Neumorphic card with container query support.
 * Adapts content based on container width.
 */
interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'minimal';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const variantClass = variant !== 'default' ? ` ${variant}` : '';

  return (
    <div
      className={`card-modern${variantClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {title && (
        <div className="mb-spacing-md">
          <h3 className="font-semibold text-color-text">{title}</h3>
          {subtitle && (
            <p className="text-xs text-color-text-secondary mt-spacing-xs">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default ModernDashboardLayout;
