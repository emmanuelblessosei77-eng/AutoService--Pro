import React, { useState } from 'react';
import { LayoutDashboard, Car, Calendar, ShoppingBag, Settings, Moon, Sun } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode | React.ComponentType<any>;
  onClick: () => void;
}

interface ResponsiveNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userName?: string;
  onThemeToggle?: (isDark: boolean) => void;
  isDarkMode?: boolean;
}

/**
 * ResponsiveNavigation Component
 * 
 * Mobile-First Navigation:
 * - Bottom navigation bar on mobile (< 768px)
 * - Converts to horizontal navigation on tablet
 * - Sidebar-style navigation on desktop
 * 
 * Features:
 * - Touch-friendly 48x48px targets
 * - Smooth transitions
 * - Active state indicators
 * - Theme toggle
 */
export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  activeTab,
  onTabChange,
  userName = 'User',
  onThemeToggle,
  isDarkMode = false,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigationItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        onTabChange('overview');
        setIsDrawerOpen(false);
      },
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      onClick: () => {
        onTabChange('vehicles');
        setIsDrawerOpen(false);
      },
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      onClick: () => {
        onTabChange('bookings');
        setIsDrawerOpen(false);
      },
    },
    {
      id: 'parts',
      label: 'Shop',
      icon: ShoppingBag,
      onClick: () => {
        onTabChange('parts');
        setIsDrawerOpen(false);
      },
    },
  ];

  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    if (onThemeToggle) {
      onThemeToggle(newDarkMode);
    }
    // Save preference
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute(
      'data-theme',
      newDarkMode ? 'dark' : 'light'
    );
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Mobile only (< 768px) */}
      <nav className="nav-bottom mobile-only">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-bottom-item ${isActive ? 'active' : ''}`}
              onClick={item.onClick}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {typeof item.icon === 'function' ? <item.icon size={24} /> : item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
        
        {/* Theme Toggle */}
        <button
          className="nav-bottom-item"
          onClick={handleThemeToggle}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          <span className="hidden">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </nav>

      {/* Tablet & Desktop Navigation - Hidden on mobile */}
      <nav className="nav-sidebar mobile-hidden">
        {/* Header */}
        <div className="p-lg border-b border-color-border">
          <h3 className="font-bold text-lg text-color-text">Dashboard</h3>
          <p className="text-sm text-color-text-secondary mt-spacing-sm">
            {userName}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-spacing-sm p-lg">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-sidebar-item ${isActive ? 'active' : ''}`}
                onClick={item.onClick}
                aria-current={isActive ? 'page' : undefined}
              >
                {typeof item.icon === 'function' ? <item.icon size={20} /> : item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section - Theme & Settings */}
        <div className="mt-auto p-lg border-t border-color-border flex flex-col gap-spacing-sm">
          <button
            className="nav-sidebar-item"
            onClick={handleThemeToggle}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay - Hidden if drawer is closed */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-overlay mobile-only"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default ResponsiveNavigation;
