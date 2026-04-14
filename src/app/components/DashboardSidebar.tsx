import { useState, ReactNode } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  userName: string;
  onLogout: () => void;
  children?: ReactNode;
}

export function DashboardSidebar({
  items,
  activeItem,
  onItemClick,
  userName,
  onLogout,
  children,
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (id: string) => {
    onItemClick?.(id);
    setIsOpen(false); // Close mobile menu after clicking
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        {/* Logo Section */}
        <div className="flex items-center justify-center border-b border-gray-200 px-6 py-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <BrandLogo size={50} className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">LOGGED IN AS</p>
            <p className="text-sm font-semibold text-gray-900 truncate mt-1">{userName}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>

            {/* Mobile Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1"
            >
              <BrandLogo size={42} className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
            </Link>

            {/* Placeholder for mobile user menu */}
            <div className="w-8 h-8"></div>
          </div>
        </header>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Navigation Items */}
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">LOGGED IN AS</p>
              <p className="text-sm font-semibold text-gray-900 truncate mt-1">{userName}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
