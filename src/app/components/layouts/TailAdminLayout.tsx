import React, { ReactNode, useState, useEffect } from 'react';
import {
  Menu, X, ChevronDown, LogOut, Settings,
  ChevronLeft, ChevronRight, Eye, EyeOff, Lock,
  LayoutDashboard, CalendarDays, Users, Wrench,
  ShoppingBag, TrendingUp, Package, Sun, Moon,
} from 'lucide-react';
import { User } from '../../App';
import BrandLogo from '../BrandLogo';
import { users as usersAPI } from '../../../services/api';

interface TailAdminLayoutProps {
  user: User;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  menuItems?: MenuItem[];
}

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
}

export const TailAdminLayout: React.FC<TailAdminLayoutProps> = ({
  user,
  onLogout,
  title = 'Dashboard',
  subtitle,
  children,
  menuItems,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isApplicationMenuOpen, setIsApplicationMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Settings / change-password modal
  const [showSettings, setShowSettings] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  function openSettings() {
    setPwdForm({ current: '', next: '', confirm: '' });
    setPwdError('');
    setPwdSuccess('');
    setIsApplicationMenuOpen(false);
    setShowSettings(true);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (pwdForm.next.length < 6) { setPwdError('New password must be at least 6 characters.'); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError('New passwords do not match.'); return; }
    setPwdLoading(true);
    try {
      await usersAPI.changePassword(pwdForm.current, pwdForm.next);
      setPwdSuccess('Password changed successfully!');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('400') || msg.toLowerCase().includes('incorrect')) {
        setPwdError('Current password is incorrect.');
      } else {
        setPwdError('Failed to change password. Please try again.');
      }
    } finally {
      setPwdLoading(false);
    }
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Default admin dashboard menu items if not provided
  const defaultMenuItems: MenuItem[] = [
    { label: 'Overview',   icon: LayoutDashboard, active: title === 'Overview' },
    { label: 'Bookings',   icon: CalendarDays,    active: title === 'Bookings' },
    { label: 'Users',      icon: Users,           active: title === 'Users' },
    { label: 'Inventory',  icon: Package,         active: title === 'Inventory' },
    { label: 'Orders',     icon: ShoppingBag,     active: title === 'Orders' },
    { label: 'Services',   icon: Wrench,          active: title === 'Services' },
    { label: 'Analytics',   icon: TrendingUp,      active: title === 'Analytics' },
  ];
  const sidebarMenu = menuItems && menuItems.length > 0 ? menuItems : defaultMenuItems;
  const firstName = ((user as any).first_name || '').toString().trim()
    || (user.name || '').trim().split(/\s+/)[0]
    || (user.email || '').split('@')[0]
    || '';
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : (user.role?.charAt(0).toUpperCase() || 'U');

  const showLabel = isSidebarExpanded || isSidebarHovered;

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="close sidebar"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0
          h-screen transition-all duration-300 ease-in-out
          z-50 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          ${showLabel ? 'lg:w-64' : 'lg:w-[72px]'}
          lg:translate-x-0 lg:z-40
        `}
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #111827 0%, #0f172a 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
          borderRight: isDark ? '1px solid #1f2937' : '1px solid #e5e7eb',
        }}
        onMouseEnter={() => !isSidebarExpanded && setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Sidebar top: logo area + collapse button */}
        <div className="py-3 flex items-center justify-between px-1">
          {showLabel && (
            <div className="flex items-center gap-2 pl-1">
              <BrandLogo
                size={40}
                darkMode={isDark}
                className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]"
              />
            </div>
          )}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`
              hidden lg:flex items-center justify-center w-7 h-7 rounded-lg
              transition-colors flex-shrink-0 ml-auto
              ${isDark
                ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mb-4">
          <div className="space-y-0.5">
            {sidebarMenu.map((item) => {
              const isActive = item.active;
              const inner = (
                <>
                  <item.icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${
                      isActive
                        ? 'text-white'
                        : isDark
                          ? 'text-gray-400 group-hover:text-white'
                          : 'text-gray-600 group-hover:text-blue-700'
                    }`}
                  />
                  {showLabel && (
                    <span
                      className={`text-[13px] font-semibold ${
                        isActive
                          ? 'text-white'
                          : isDark
                            ? 'text-gray-300 group-hover:text-white'
                            : 'text-gray-700 group-hover:text-blue-700'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </>
              );
              const cls = `
                group w-full text-left flex items-center gap-3 px-2.5 py-2.5 rounded-xl
                transition-all duration-150 border-0 cursor-pointer
                ${isActive
                  ? 'bg-blue-600 shadow-sm shadow-blue-200'
                  : isDark
                    ? 'bg-transparent hover:bg-gray-800'
                    : 'bg-transparent hover:bg-blue-50'
                }
              `;
              if (item.path) {
                return <a key={item.label} href={item.path} className={cls}>{inner}</a>;
              }
              return (
                <button key={item.label} onClick={item.onClick} className={cls}>
                  {inner}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div
          className="pt-3 space-y-1 pb-4"
          style={{ borderTop: isDark ? '1px solid #1f2937' : '1px solid #e5e7eb' }}
        >
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`
              w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl
              transition-all duration-150
              ${isDark
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark
              ? <Sun className="w-[18px] h-[18px] flex-shrink-0 text-yellow-400" />
              : <Moon className="w-[18px] h-[18px] flex-shrink-0 text-gray-600" />}
            {showLabel && (
              <span className="text-[13px] font-semibold">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl
              transition-all duration-150
              ${isDark
                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }
            `}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {showLabel && <span className="text-[13px] font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`
          flex flex-col transition-all duration-300 ease-in-out
          ${showLabel ? 'lg:ml-64' : 'lg:ml-[72px]'}
        `}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            {/* Left: mobile toggle + title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="
                  flex items-center justify-center w-9 h-9
                  text-gray-500 dark:text-gray-400 border border-gray-200
                  dark:border-gray-700 rounded-lg lg:hidden
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                "
                aria-label="toggle sidebar"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h1>
                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
              </div>
            </div>

            {/* Right: dark mode + user menu */}
            <div className="flex items-center gap-2">
              {/* Desktop dark mode toggle in header */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsApplicationMenuOpen(!isApplicationMenuOpen)}
                  className="
                    flex items-center gap-2 px-2 py-1.5 rounded-lg
                    text-gray-700 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors
                  "
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-sm font-bold">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isApplicationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={openSettings} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button
                      onClick={() => { onLogout(); setIsApplicationMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* FOOTER */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 md:px-6 text-center text-xs text-gray-400">
          © 2026 Car Service Management. All rights reserved.
        </footer>
      </div>
    </div>

    {/* ── Settings / Change Password Modal ── */}
    {showSettings && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Change Password</h2>
            </div>
            <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {(['current', 'next', 'confirm'] as const).map((field) => {
              const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' };
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{labels[field]}</label>
                  <div className="relative">
                    <input
                      type={showPwd[field] ? 'text' : 'password'}
                      value={pwdForm[field]}
                      onChange={(e) => setPwdForm(prev => ({ ...prev, [field]: e.target.value }))}
                      required
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={field === 'current' ? 'Enter current password' : field === 'next' ? 'Min. 6 characters' : 'Repeat new password'}
                    />
                    <button type="button" onClick={() => setShowPwd(prev => ({ ...prev, [field]: !prev[field] }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPwd[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}

            {pwdError && (
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                <X className="w-3.5 h-3.5 flex-shrink-0" />{pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                {pwdSuccess}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={pwdLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors disabled:opacity-50">
                {pwdLoading ? 'Saving…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default TailAdminLayout;
