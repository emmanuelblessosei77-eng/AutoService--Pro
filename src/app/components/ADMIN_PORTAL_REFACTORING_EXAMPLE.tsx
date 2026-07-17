import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import {
  bookings as bookingsAPI,
  users as usersAPI,
  services as servicesAPI,
  carParts as carPartsAPI,
  orders as ordersAPI,
  clearCache,
} from '../../services/api';
import { User } from '../App';
import { TailAdminLayout } from './layouts/TailAdminLayout';
import '../styles/mobile-dashboard-utils.css';
import {
  BarChart3, Users, Calendar, CheckCircle2, Edit2, Trash2, Plus,
  Wrench, Clock, Package, ShoppingCart, TrendingUp, DollarSign,
  AlertCircle, X, RefreshCw, ChevronDown, Search, CalendarClock,
  Activity, UserPlus, UserCheck, Download, MessageSquare, ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import SweetAlert from './SweetAlert';

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────
// Types matching real backend API responses
// ─────────────────────────────────────────────
type RawBooking = {
  id: number;
  user_id: number;
  service_id: number;
  vehicle_id: number;
  mechanic_assigned: number | null;
  booking_datetime: string;
  status: string;
  notes: string | null;
  payment_status: string | null;
  total_cost: string | null;
  parts_cost: string | null;
  first_name: string | null;
  last_name: string | null;
  service_name: string | null;
  service_price: string | null;
  created_at: string;
};

type RawUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  specialty: string | null;
  hire_date: string | null;
  created_at: string;
};

type RawPart = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: string;
  stock_quantity: number;
  supplier: string | null;
  image_url: string | null;
  is_available: boolean;
};

type RawService = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  duration_minutes: number | null;
  category: string | null;
  is_active: boolean;
};

type RawOrder = {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  total_amount: string;
  status: string;
  items: Array<{ name: string; quantity: number; unit_price: string }> | null;
  item_count?: number | string | null;
  created_at: string;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const BOOKING_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const getOrderItems = (order: RawOrder) => (Array.isArray(order.items) ? order.items : []);

const getOrderItemCount = (order: RawOrder) => {
  if (Array.isArray(order.items)) return order.items.length;
  const fallback = Number(order.item_count ?? 0);
  return Number.isFinite(fallback) ? fallback : 0;
};

// Fixed colors for booking status pie chart (by name, not position)
const STATUS_PIE_COLORS: Record<string, string> = {
  Completed: '#10b981',
  Pending: '#f59e0b',
  Assigned: '#2563eb',
  Cancelled: '#ef4444',
};

function StatusPill({ status, map }: { status: string; map: Record<string, string> }) {
  const cls = map[status] ?? 'bg-gray-100 text-gray-600';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${cls}`}>{status}</span>;
}

function rolePill(role: string) {
  const cls = role === 'admin'
    ? 'bg-red-100 text-red-700'
    : role === 'mechanic'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${cls}`}>{role}</span>;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toDatetimeLocal(d: string | null): string {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fmtMoney(v: string | number | null) {
  if (v === null || v === undefined) return 'GH₵0.00';
  return `GH₵${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fullName(u: { first_name: string | null; last_name: string | null }) {
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
}

function truncLabel(s: string, max = 14) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

// ─────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────
const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

function MiniLineChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MiniBarChart({ data, color = '#10b981' }: { data: Array<{ label: string; value: number }>; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MiniAreaChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v: number) => fmtMoney(v)} />
        <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#areaGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type BookingTrendRange = 'daily' | 'weekly' | 'monthly';

const BOOKING_TREND_META: Record<BookingTrendRange, string> = {
  daily: 'Last 14 Days',
  weekly: 'Last 12 Weeks',
  monthly: 'Last 12 Months',
};

function BookingTrendCard({ bookings }: { bookings: RawBooking[] }) {
  const [range, setRange] = useState<BookingTrendRange>('daily');

  const data = useMemo(() => {
    const today = new Date();
    const getBookingTrendDate = (booking: RawBooking) => {
      const raw = booking.booking_datetime || booking.created_at;
      return raw ? new Date(raw) : null;
    };
    const getWeekStart = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      const day = normalized.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      normalized.setDate(normalized.getDate() + diff);
      return normalized;
    };

    if (range === 'daily') {
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setHours(0, 0, 0, 0);
        d.setDate(today.getDate() - (13 - i));
        const key = d.toISOString().slice(0, 10);
        return {
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: bookings.filter((b) => getBookingTrendDate(b)?.toISOString().slice(0, 10) === key).length,
        };
      });
    }

    if (range === 'weekly') {
      const currentWeekStart = getWeekStart(today);
      return Array.from({ length: 12 }, (_, i) => {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() - ((11 - i) * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: bookings.filter((b) => {
            const bookingDate = getBookingTrendDate(b);
            return bookingDate && bookingDate >= weekStart && bookingDate <= weekEnd;
          }).length,
        };
      });
    }

    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      d.setMonth(today.getMonth() - (11 - i));
      const key = d.toISOString().slice(0, 7);
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: bookings.filter((b) => getBookingTrendDate(b)?.toISOString().slice(0, 7) === key).length,
      };
    });
  }, [bookings, range]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-sm">Bookings ({BOOKING_TREND_META[range]})</CardTitle>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {(['daily', 'weekly', 'monthly'] as const).map((nextRange) => (
            <button
              key={nextRange}
              type="button"
              onClick={() => setRange(nextRange)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                range === nextRange
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {nextRange}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <MiniLineChart data={data} />
      </CardContent>
    </Card>
  );
}

// Pie chart with per-entry colors (for status charts)
function StatusPieChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={75}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={true}
        >
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MiniPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white break-words leading-snug">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl flex-shrink-0 ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Collapsible Card (dropdown accordion)
// ─────────────────────────────────────────────
function CollapsibleCard({ title, icon: Icon, count, children, defaultOpen = true, iconAccent }: {
  title: string; icon: React.ComponentType<{ className?: string }>;
  count?: number; children: React.ReactNode; defaultOpen?: boolean; iconAccent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const iconWrapCls = iconAccent ?? 'bg-gray-100 dark:bg-gray-800';
  const iconCls = iconAccent ? '' : 'text-gray-600 dark:text-gray-400';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-2xl transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconWrapCls}`}>
            <Icon className={`w-4 h-4 ${iconCls}`} />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">{count}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────
function SectionHeader({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

function SubSectionHeader({ title, count, color = 'blue' }: { title: string; count: number; color?: string }) {
  const dotColor = color === 'yellow' ? 'bg-yellow-400' : color === 'green' ? 'bg-green-500' : 'bg-blue-500';
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Table wrapper
// ─────────────────────────────────────────────
function DataTable({ heads, children, empty }: { heads: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full min-w-max text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {heads.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-900">
          {empty ? (
            <tr><td colSpan={heads.length} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500">No data found.</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// Search bar
// ─────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder ?? 'Search…'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
interface AdminPortalProps { user: User; onLogout: () => void; }

function AdminPortalContent({ activeTab }: { user: User; activeTab: string; setActiveTab: (t: string) => void }) {
  const [bookings, setBookings] = useState<RawBooking[]>([]);
  const [users, setUsers] = useState<RawUser[]>([]);
  const [parts, setParts] = useState<RawPart[]>([]);
  const [services, setServices] = useState<RawService[]>([]);
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    // Always bust the bookings cache so actions take effect immediately
    clearCache('/bookings');
    clearCache('/users');
    clearCache('/orders');
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [bData, uData, sData, pData, oData] = await Promise.all([
        bookingsAPI.getAll(),
        usersAPI.getAll(),
        servicesAPI.getAll(),
        carPartsAPI.getAll().catch(() => []),
        ordersAPI.getAll(),
      ]);
      setBookings(Array.isArray(bData) ? bData : []);
      setUsers(Array.isArray(uData) ? uData : []);
      setServices(Array.isArray(sData) ? sData : []);
      setParts(Array.isArray(pData) ? pData : []);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (err: any) {
      const message = err?.message || 'Failed to load data';
      if (message.includes('401')) {
        setError('Orders could not be loaded: unauthorized request. Please sign in again.');
      } else if (message.includes('404')) {
        setError('Orders could not be loaded: orders endpoint mismatch between frontend and backend.');
      } else {
        setError(message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const mechanics = users.filter((u) => u.role === 'mechanic');
  const mechanicMap: Record<number, RawUser> = {};
  mechanics.forEach((m) => { mechanicMap[m.id] = m; });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading dashboard data…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-600">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error}</p>
        <Button size="sm" onClick={() => fetchAll()}><RefreshCw className="w-4 h-4 mr-1" />Retry</Button>
      </div>
    );
  }

  return (
    <>
      {activeTab === 'Overview' && <OverviewTab bookings={bookings} users={users} services={services} orders={orders} parts={parts} />}
      {activeTab === 'Bookings' && <BookingsTab bookings={bookings} setBookings={setBookings} mechanics={mechanics} mechanicMap={mechanicMap} onRefresh={() => fetchAll(true)} />}
      {activeTab === 'Users' && <UsersTab users={users} onRefresh={fetchAll} />}
      {activeTab === 'Inventory' && <InventoryTab parts={parts} setParts={setParts} onRefresh={fetchAll} />}
      {activeTab === 'Orders' && <OrdersTab orders={orders} setOrders={setOrders} onRefresh={fetchAll} />}
      {activeTab === 'Services' && <ServicesTab services={services} onRefresh={fetchAll} />}
      {activeTab === 'Analytics' && <AnalysisTab bookings={bookings} users={users} services={services} parts={parts} orders={orders} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════
function OverviewTab({ bookings, users, services, orders, parts }: { bookings: RawBooking[]; users: RawUser[]; services: RawService[]; orders: RawOrder[]; parts: RawPart[] }) {
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.total_cost || 0), 0);
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const mechanicsList = users.filter((u) => u.role === 'mechanic');
  const mechanics = mechanicsList.length;

  // Mechanic performance metrics
  const mechanicMetrics = mechanicsList.map(m => {
    const mBookings = bookings.filter(b => b.mechanic_assigned === m.id);
    const mCompleted = mBookings.filter(b => b.status === 'completed').length;
    const mRevenue = mBookings.reduce((s, b) => s + Number(b.total_cost || 0), 0);
    return { name: fullName(m), completed: mCompleted, total: mBookings.length, revenue: mRevenue };
  }).sort((a, b) => b.completed - a.completed).slice(0, 5);

  // Active users: had a booking in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeUserIds = new Set(bookings.filter((b) => new Date(b.created_at) > thirtyDaysAgo).map((b) => b.user_id));
  const activeUsers = activeUserIds.size;

  const today = new Date();

  // Top 6 services by booking count — deduplicated
  const svcMap: Record<string, number> = {};
  bookings.forEach((b) => {
    if (b.service_name) {
      const key = b.service_name.trim();
      svcMap[key] = (svcMap[key] || 0) + 1;
    }
  });
  const svcData = Object.entries(svcMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label: truncLabel(label, 14), value }));

  // Booking status pie — group completed+scheduled together
  const statusData = [
    { name: 'Completed', value: bookings.filter((b) => b.status === 'completed' || b.status === 'scheduled').length, color: STATUS_PIE_COLORS.Completed },
    { name: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, color: STATUS_PIE_COLORS.Pending },
    { name: 'Assigned', value: bookings.filter((b) => b.status === 'assigned').length, color: STATUS_PIE_COLORS.Assigned },
    { name: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, color: STATUS_PIE_COLORS.Cancelled },
  ].filter((d) => d.value > 0);

  // Recent users (last 5 registered)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // User role breakdown
  const userCustomers = users.filter((u) => u.role === 'customer').length;
  const userMechanics = users.filter((u) => u.role === 'mechanic').length;
  const userAdmins = users.filter((u) => u.role === 'admin').length;
  const userRoleChartData = [
    { name: 'Customers', value: userCustomers },
    { name: 'Mechanics', value: userMechanics },
    { name: 'Admins', value: userAdmins },
  ].filter((d) => d.value > 0);

  // New user registrations per month (last 12 months)
  const userGrowthData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (11 - i));
    const key = d.toISOString().slice(0, 7);
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      value: users.filter((u) => u.created_at?.slice(0, 7) === key).length,
    };
  });

  const overviewActiveVsInactive = [
    { label: 'Active (30d)', value: activeUsers },
    { label: 'Inactive', value: Math.max(0, users.length - activeUsers) },
  ];

  // Recent activities (last 6 bookings)
  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // Recent transactions (last 5 paid / completed bookings with cost)
  const recentTransactions = [...bookings]
    .filter((b) => b.total_cost && Number(b.total_cost) > 0 && (b.payment_status === 'paid' || b.status === 'completed'))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const downloadAdminReportPDF = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const currency = (v: number) => `GHS ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const pct = (n: number, d: number) => d > 0 ? `${Math.round((n / d) * 100)}%` : '0%';

      // ---- chart drawing helpers ----
      const hexToRgb = (hex: string) => {
        const h = hex.replace('#', '');
        return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
      };

      const drawDonutChart = (data: { name: string; value: number; color: string }[], bx: number, by: number, bw: number, bh: number) => {
        const total = data.reduce((s, d) => s + d.value, 0);
        if (total === 0) { doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text('No data', bx + bw / 2, by + bh / 2, { align: 'center' }); return; }
        const cx = bx + bw * 0.40; const cy = by + bh * 0.52;
        const outerR = Math.min(bw, bh) * 0.32; const innerR = outerR * 0.55;
        let startAngle = -Math.PI / 2;
        data.forEach(item => {
          if (item.value <= 0) return;
          const sliceAngle = (item.value / total) * Math.PI * 2;
          const steps = Math.max(24, Math.ceil(sliceAngle * 20));
          const { r, g, b } = hexToRgb(item.color);
          const pts: number[][] = [];
          for (let i = 0; i <= steps; i++) { const a = startAngle + (sliceAngle * i / steps); pts.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]); }
          for (let i = steps; i >= 0; i--) { const a = startAngle + (sliceAngle * i / steps); pts.push([cx + innerR * Math.cos(a), cy + innerR * Math.sin(a)]); }
          const vectors: number[][] = [];
          for (let i = 1; i < pts.length; i++) vectors.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
          doc.setFillColor(r, g, b); doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.8);
          (doc as any).lines(vectors, pts[0][0], pts[0][1], [1, 1], 'FD', true);
          startAngle += sliceAngle;
        });
        let ly = by + 14; const lx = bx + bw * 0.66;
        data.forEach(item => {
          const { r, g, b } = hexToRgb(item.color);
          doc.setFillColor(r, g, b); doc.rect(lx, ly - 5, 8, 8, 'F');
          doc.setFontSize(7.5); doc.setTextColor(50, 50, 50);
          doc.text(`${item.name}: ${item.value} (${Math.round((item.value / total) * 100)}%)`, lx + 11, ly + 1);
          ly += 15;
        });
      };

      const drawLineChart = (data: { label: string; value: number }[], bx: number, by: number, bw: number, bh: number, cr = 37, cg = 99, cb = 235) => {
        const pad = { t: 20, r: 12, b: 26, l: 32 };
        const cx = bx + pad.l; const cy = by + pad.t; const cw = bw - pad.l - pad.r; const ch = bh - pad.t - pad.b;
        const maxVal = Math.max(...data.map(d => d.value), 1);
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
        for (let i = 0; i <= 4; i++) {
          const gy = cy + ch - (ch * i / 4);
          doc.line(cx, gy, cx + cw, gy);
          doc.setFontSize(6); doc.setTextColor(160, 160, 160);
          doc.text(String(Math.round(maxVal * i / 4)), cx - 3, gy + 2, { align: 'right' });
        }
        const pt = (idx: number, val: number) => ({
          px: cx + (data.length > 1 ? (idx / (data.length - 1)) * cw : cw / 2),
          py: cy + ch - (val / maxVal) * ch,
        });
        doc.setDrawColor(cr, cg, cb); doc.setLineWidth(1.5);
        for (let i = 1; i < data.length; i++) { const p1 = pt(i - 1, data[i - 1].value); const p2 = pt(i, data[i].value); doc.line(p1.px, p1.py, p2.px, p2.py); }
        doc.setFillColor(cr, cg, cb);
        data.forEach((d, i) => { const { px, py } = pt(i, d.value); doc.circle(px, py, 2, 'F'); });
        const step = Math.max(1, Math.ceil(data.length / 7));
        data.forEach((d, i) => { if (i % step === 0 || i === data.length - 1) { const { px } = pt(i, 0); doc.setFontSize(5.5); doc.setTextColor(130, 130, 130); doc.text(d.label.slice(0, 7), px, cy + ch + 10, { align: 'center' }); } });
      };

      const drawBarChart = (data: { label: string; value: number }[], bx: number, by: number, bw: number, bh: number, cr = 99, cg = 102, cb = 241) => {
        if (data.length === 0) { doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text('No data', bx + bw / 2, by + bh / 2, { align: 'center' }); return; }
        const pad = { t: 20, r: 12, b: 28, l: 32 };
        const cx = bx + pad.l; const cy = by + pad.t; const cw = bw - pad.l - pad.r; const ch = bh - pad.t - pad.b;
        const maxVal = Math.max(...data.map(d => d.value), 1);
        const gw = cw / data.length; const bwBar = gw * 0.6;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
        for (let i = 0; i <= 4; i++) {
          const gy = cy + ch - (ch * i / 4);
          doc.line(cx, gy, cx + cw, gy);
          doc.setFontSize(6); doc.setTextColor(160, 160, 160);
          doc.text(String(Math.round(maxVal * i / 4)), cx - 3, gy + 2, { align: 'right' });
        }
        data.forEach((item, idx) => {
          const barX = cx + idx * gw + (gw - bwBar) / 2; const barH = (item.value / maxVal) * ch;
          doc.setFillColor(cr, cg, cb); doc.rect(barX, cy + ch - barH, bwBar, barH, 'F');
          if (barH > 10) { doc.setFontSize(6); doc.setTextColor(50, 50, 50); doc.text(String(item.value), barX + bwBar / 2, cy + ch - barH - 2, { align: 'center' }); }
          doc.setFontSize(5.5); doc.setTextColor(100, 100, 100);
          doc.text(item.label.slice(0, 8), barX + bwBar / 2, cy + ch + 10, { align: 'center' });
        });
      };

      const drawAreaChart = (data: { label: string; value: number }[], bx: number, by: number, bw: number, bh: number) => {
        const pad = { t: 20, r: 12, b: 26, l: 48 };
        const cx = bx + pad.l; const cy = by + pad.t; const cw = bw - pad.l - pad.r; const ch = bh - pad.t - pad.b;
        const maxVal = Math.max(...data.map(d => d.value), 1);
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
        for (let i = 0; i <= 4; i++) {
          const gy = cy + ch - (ch * i / 4);
          doc.line(cx, gy, cx + cw, gy);
          const lbl = maxVal * i / 4 >= 1000 ? `${((maxVal * i / 4) / 1000).toFixed(1)}k` : String(Math.round(maxVal * i / 4));
          doc.setFontSize(5.5); doc.setTextColor(160, 160, 160);
          doc.text(lbl, cx - 3, gy + 2, { align: 'right' });
        }
        const pt = (idx: number, val: number) => ({
          px: cx + (data.length > 1 ? (idx / (data.length - 1)) * cw : cw / 2),
          py: cy + ch - (val / maxVal) * ch,
        });
        doc.setDrawColor(37, 99, 235); doc.setLineWidth(1.5);
        for (let i = 1; i < data.length; i++) { const p1 = pt(i - 1, data[i - 1].value); const p2 = pt(i, data[i].value); doc.line(p1.px, p1.py, p2.px, p2.py); }
        doc.setFillColor(37, 99, 235);
        data.forEach((d, i) => { const { px, py } = pt(i, d.value); doc.circle(px, py, 2, 'F'); });
        const step = Math.max(1, Math.ceil(data.length / 7));
        data.forEach((d, i) => { if (i % step === 0 || i === data.length - 1) { const { px } = pt(i, 0); doc.setFontSize(5.5); doc.setTextColor(130, 130, 130); doc.text(d.label.slice(0, 7), px, cy + ch + 10, { align: 'center' }); } });
      };
      // ---- end helpers ----

      // ── Compute all chart / analysis data ──
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now); d.setMonth(now.getMonth() - (11 - i));
        const key = d.toISOString().slice(0, 7);
        return { label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), value: bookings.filter(b => b.booking_datetime?.slice(0, 7) === key).reduce((s, b) => s + Number(b.total_cost || 0), 0) };
      });

      const svcRevMap: Record<string, { revenue: number; count: number }> = {};
      bookings.forEach(b => { const k = b.service_name?.trim() || 'Unknown'; if (!svcRevMap[k]) svcRevMap[k] = { revenue: 0, count: 0 }; svcRevMap[k].revenue += Number(b.total_cost || 0); svcRevMap[k].count += 1; });
      const svcRevenueData = Object.entries(svcRevMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6).map(([label, d]) => ({ label: truncLabel(label, 14), value: Math.round(d.revenue) }));

      const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const bookingsByDay = Array.from({ length: 7 }, (_, i) => ({ label: DOW_LABELS[i], value: bookings.filter(b => b.booking_datetime && new Date(b.booking_datetime).getDay() === i).length }));

      const customerGrowth = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now); d.setMonth(now.getMonth() - (11 - i));
        const key = d.toISOString().slice(0, 7);
        return { label: d.toLocaleDateString('en-US', { month: 'short' }), value: users.filter(u => u.created_at?.slice(0, 7) === key).length };
      });

      const orderRevenueByMonth = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now); d.setMonth(now.getMonth() - (5 - i));
        const key = d.toISOString().slice(0, 7);
        return { label: d.toLocaleDateString('en-US', { month: 'short' }), value: orders.filter(o => o.created_at?.slice(0, 7) === key).reduce((s, o) => s + Number(o.total_amount || 0), 0) };
      });

      const partSalesMap: Record<string, { qty: number; revenue: number }> = {};
      orders.forEach(o => { getOrderItems(o).forEach(item => { const k = item.name.trim(); if (!partSalesMap[k]) partSalesMap[k] = { qty: 0, revenue: 0 }; partSalesMap[k].qty += item.quantity; partSalesMap[k].revenue += Number(item.unit_price) * item.quantity; }); });
      const fastMovingParts = Object.entries(partSalesMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8).map(([label, d]) => ({ label: truncLabel(label, 14), value: d.qty, revenue: d.revenue }));

      const mechPerfMap: Record<number, { name: string; jobs: number; completed: number }> = {};
      bookings.forEach(b => { if (!b.mechanic_assigned) return; if (!mechPerfMap[b.mechanic_assigned]) mechPerfMap[b.mechanic_assigned] = { name: `Mechanic #${b.mechanic_assigned}`, jobs: 0, completed: 0 }; mechPerfMap[b.mechanic_assigned].jobs += 1; if (b.status === 'completed') mechPerfMap[b.mechanic_assigned].completed += 1; });
      users.filter(u => u.role === 'mechanic').forEach(u => { if (mechPerfMap[u.id]) mechPerfMap[u.id].name = [u.first_name, u.last_name].filter(Boolean).join(' ') || `Mechanic #${u.id}`; });
      const mechLeaderboard = Object.values(mechPerfMap).sort((a, b) => b.completed - a.completed);
      const mechCompRate = Object.values(mechPerfMap).map(m => ({ label: m.name.split(' ')[0], value: m.jobs > 0 ? Math.round((m.completed / m.jobs) * 100) : 0 })).sort((a, b) => b.value - a.value).slice(0, 8);

      const svcPerfMap: Record<string, { bookings: number; revenue: number }> = {};
      bookings.forEach(b => { const k = b.service_name?.trim() || 'Unknown'; if (!svcPerfMap[k]) svcPerfMap[k] = { bookings: 0, revenue: 0 }; svcPerfMap[k].bookings += 1; svcPerfMap[k].revenue += Number(b.total_cost || 0); });
      const svcPerformance = Object.entries(svcPerfMap).sort((a, b) => b[1].revenue - a[1].revenue);

      const completedBookingsCount = bookings.filter(b => b.status === 'completed').length;
      const completedRev = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + Number(b.total_cost || 0), 0);
      const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
      const paidCount = bookings.filter(b => b.payment_status === 'paid').length;
      const totalOrderRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
      const lowStockCount = parts.filter(p => p.stock_quantity <= 5).length;

      const userCustomers = users.filter(u => u.role === 'customer').length;
      const userMechanics = users.filter(u => u.role === 'mechanic').length;
      const userAdmins = users.filter(u => u.role === 'admin').length;
      const userOthers = users.length - userCustomers - userMechanics - userAdmins;
      const userRoleData = [
        { name: 'Customers', value: userCustomers, color: '#3b82f6' },
        { name: 'Mechanics', value: userMechanics, color: '#10b981' },
        { name: 'Admins', value: userAdmins, color: '#f59e0b' },
        ...(userOthers > 0 ? [{ name: 'Others', value: userOthers, color: '#94a3b8' }] : []),
      ].filter(d => d.value > 0);

      const monthlyUserReg = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now); d.setMonth(now.getMonth() - (11 - i));
        const key = d.toISOString().slice(0, 7);
        return { label: d.toLocaleDateString('en-US', { month: 'short' }), value: users.filter(u => u.created_at?.slice(0, 7) === key).length };
      });

      const trendData = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (13 - i));
        const key = d.toISOString().slice(0, 10);
        return {
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: bookings.filter(b => (b.booking_datetime || b.created_at || '').slice(0, 10) === key).length,
        };
      });

      const activeVsInactive = [
        { label: 'Active (30d)', value: activeUsers },
        { label: 'Inactive', value: Math.max(0, users.length - activeUsers) },
      ];

      const drawChartPage = (title: string, charts: { title: string; draw: (x: number, y: number) => void }[]) => {
        doc.addPage();
        doc.setFontSize(14); doc.setTextColor(0, 0, 0);
        doc.text(title, 40, 40);
        const positions = [{ x: 40, y: 60 }, { x: 420, y: 60 }, { x: 40, y: 300 }, { x: 420, y: 300 }];
        charts.forEach(({ title: ct, draw }, i) => {
          const { x, y } = positions[i];
          doc.setDrawColor(226, 232, 240); doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, y, 340, 210, 10, 10, 'FD');
          doc.setFontSize(10); doc.setTextColor(30, 41, 59);
          doc.text(ct, x + 14, y + 18);
          doc.setTextColor(0, 0, 0);
          draw(x, y);
        });
      };

      const addTablePage = (title: string, head: string[][], body: string[][], fontSize = 7.5, left = 30) => {
        doc.addPage();
        doc.setFontSize(14); doc.setTextColor(0, 0, 0);
        doc.text(title, 40, 40);
        autoTable(doc, { startY: 58, head, body, styles: { fontSize, cellPadding: fontSize < 8 ? 3.5 : 4 }, headStyles: { fillColor: [30, 41, 59] }, margin: { left, right: left } });
      };

      // ── Page 1: KPI Summary ──
      doc.setFontSize(18); doc.setTextColor(0, 0, 0);
      doc.text('Admin Dashboard — Full Report', 40, 40);
      doc.setFontSize(10); doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${now.toLocaleString()}`, 40, 58);
      doc.text(now.toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 620, 58, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: 76,
        head: [['Metric', 'Value', 'Metric', 'Value']],
        body: [
          ['Total Bookings', String(bookings.length), 'Total Revenue', currency(totalRevenue)],
          ['Completed Bookings', String(completedBookingsCount), 'Completed Revenue', currency(completedRev)],
          ['Pending Bookings', String(pending), 'Avg Booking Value', currency(Math.round(bookings.length ? totalRevenue / bookings.length : 0))],
          ['Cancelled Bookings', String(cancelledCount), 'Paid Bookings', String(paidCount)],
          ['Total Users', String(users.length), 'Completion Rate', pct(completedBookingsCount, bookings.length)],
          ['Active Users (30d)', String(activeUsers), 'Cancellation Rate', pct(cancelledCount, bookings.length)],
          ['Total Mechanics', String(mechanics), 'Avg Jobs / Mechanic', mechanics > 0 ? (mechLeaderboard.reduce((s, m) => s + m.jobs, 0) / mechanics).toFixed(1) : '0'],
          ['Active Services', String(services.filter(s => s.is_active).length), 'Store Revenue', currency(totalOrderRevenue)],
          ['Total Orders', String(orders.length), 'Completed Orders', String(completedOrdersCount)],
          ['Total Parts (SKUs)', String(parts.length), '', ''],
        ],
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 160 }, 1: { cellWidth: 130 }, 2: { fontStyle: 'bold', cellWidth: 160 }, 3: { cellWidth: 130 } },
        margin: { left: 40, right: 40 },
      });

      // ── Page 2: Overview Charts ──
      drawChartPage('Overview Charts', [
        { title: 'Booking Status Distribution', draw: (x, y) => drawDonutChart(statusData, x + 8, y + 24, 324, 178) },
        { title: '14-Day Booking Trend', draw: (x, y) => drawLineChart(trendData, x + 8, y + 24, 324, 178) },
        { title: 'Top Services (by Bookings)', draw: (x, y) => drawBarChart(svcData, x + 8, y + 24, 324, 178) },
        { title: '12-Month Revenue Trend', draw: (x, y) => drawAreaChart(monthlyRevenue, x + 8, y + 24, 324, 178) },
      ]);

      // ── Page 3: Revenue & Customer Charts ──
      drawChartPage('Revenue & Customer Analysis', [
        { title: 'Revenue by Service (Top 6)', draw: (x, y) => drawBarChart(svcRevenueData, x + 8, y + 24, 324, 178, 37, 99, 235) },
        { title: 'Bookings by Day of Week', draw: (x, y) => drawBarChart(bookingsByDay, x + 8, y + 24, 324, 178, 99, 102, 241) },
        { title: 'New Customers per Month (12mo)', draw: (x, y) => drawLineChart(customerGrowth, x + 8, y + 24, 324, 178) },
        { title: 'Store Revenue — Last 6 Months', draw: (x, y) => drawAreaChart(orderRevenueByMonth, x + 8, y + 24, 324, 178) },
      ]);

      // ── Page 4: User Analytics Charts ──
      drawChartPage('User Analytics', [
        { title: 'User Role Distribution', draw: (x, y) => drawDonutChart(userRoleData, x + 8, y + 24, 324, 178) },
        { title: 'Monthly User Registrations (12mo)', draw: (x, y) => drawBarChart(monthlyUserReg, x + 8, y + 24, 324, 178, 59, 130, 246) },
        { title: 'Active vs Inactive Users', draw: (x, y) => drawBarChart(activeVsInactive, x + 8, y + 24, 324, 178, 16, 185, 129) },
      ]);

      // ── Page 5: Mechanic & Parts Charts ──
      drawChartPage('Mechanic & Parts Performance', [
        { title: 'Fast-Moving Parts (Units Sold)', draw: (x, y) => drawBarChart(fastMovingParts, x + 8, y + 24, 324, 178, 245, 158, 11) },
        { title: 'Mechanic Completion Rate (%)', draw: (x, y) => drawBarChart(mechCompRate, x + 8, y + 24, 324, 178, 16, 185, 129) },
      ]);

      // ── Page 6: Bookings Table ──
      addTablePage(`Bookings (${bookings.length})`, [['ID', 'Customer', 'Service', 'Mechanic', 'Date', 'Status', 'Payment', 'Amount']],
        bookings.map(b => [String(b.id), `${b.first_name || ''} ${b.last_name || ''}`.trim() || '—', b.service_name || '—', b.mechanic_assigned ? `#${b.mechanic_assigned}` : 'Unassigned', b.booking_datetime ? new Date(b.booking_datetime).toLocaleDateString() : '—', b.status, b.payment_status || '—', currency(Number(b.total_cost || 0))]));

      // ── Page 7: Users Table ──
      addTablePage(`Users (${users.length})`, [['ID', 'Name', 'Email', 'Role', 'Phone', 'Joined']],
        users.map(u => [String(u.id), [u.first_name, u.last_name].filter(Boolean).join(' ') || '—', u.email, u.role, u.phone || '—', fmtDate(u.created_at)]));

      // ── Page 7: Parts Inventory ──
      addTablePage(`Parts Inventory (${parts.length})`, [['ID', 'Part Name', 'Category', 'Price', 'Stock', 'Available']],
        parts.map(p => [String(p.id), p.name, p.category || '—', currency(Number(p.price)), String(p.stock_quantity), p.is_available ? 'Yes' : 'No']));

      // ── Page 8: Orders Table ──
      addTablePage(`Orders (${orders.length})`, [['ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date']],
        orders.map(o => [`#${o.id}`, `${o.first_name || ''} ${o.last_name || ''}`.trim() || '—', o.email || '—', String(getOrderItemCount(o)), currency(Number(o.total_amount || 0)), o.status, fmtDate(o.created_at)]));

      // ── Page 9: Services Table ──
      addTablePage(`Services (${services.length})`, [['ID', 'Service Name', 'Category', 'Price', 'Duration (min)', 'Status']],
        services.map(s => [String(s.id), s.name, s.category || '—', currency(Number(s.price)), s.duration_minutes ? String(s.duration_minutes) : '—', s.is_active ? 'Active' : 'Inactive']), 8.5, 40);

      // ── Page 10: Service Performance Breakdown ──
      addTablePage('Service Performance Breakdown', [['Service', 'Bookings', 'Revenue', 'Avg Value']],
        svcPerformance.map(([name, d]) => [name, String(d.bookings), currency(d.revenue), currency(d.bookings > 0 ? Math.round(d.revenue / d.bookings) : 0)]), 9, 40);

      // ── Page 11: Mechanic Leaderboard ──
      addTablePage('Mechanic Leaderboard', [['#', 'Mechanic', 'Total Jobs', 'Completed', 'Rate']],
        mechLeaderboard.length > 0
          ? mechLeaderboard.map((m, i) => [String(i + 1), m.name, String(m.jobs), String(m.completed), pct(m.completed, m.jobs)])
          : [['—', 'No mechanic data', '', '', '']], 9, 40);

      // ── Page 12: Fast-Moving Parts Sales Summary ──
      if (fastMovingParts.length > 0) {
        addTablePage('Fast-Moving Parts — Sales Summary', [['Part Name', 'Units Sold', 'Revenue']],
          fastMovingParts.map(p => [p.label, String(p.value), currency(p.revenue)]), 9, 40);
      }

      doc.save(`admin_full_report_${dateStr}.pdf`);
    } catch (err) {
      console.error('Error generating admin report:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap" onClick={downloadAdminReportPDF}>
            <Download size={16} /> Download Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={bookings.length} icon={Calendar} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard label="Total Revenue" value={fmtMoney(totalRevenue)} icon={TrendingUp} accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard label="Pending" value={pending} icon={Clock} accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <StatCard label="Total Users" value={users.length} icon={Users} accent="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard label="Active Users (30d)" value={activeUsers} icon={UserCheck} accent="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" />
        <StatCard label="Mechanics" value={mechanics} icon={Wrench} accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        <StatCard label="Services" value={services.filter((s) => s.is_active).length} icon={Package} accent="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" />
        <StatCard label="Orders" value={orders.length} icon={ShoppingCart} accent="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
      </div>

      {/* Recent Activities — collapsible */}
      <CollapsibleCard title="Recent Activities" icon={MessageSquare} count={recentActivity.length} defaultOpen={true} iconAccent="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
        {recentActivity.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
          : (
            <div className="space-y-1">
              {recentActivity.map((b) => (
                <div key={b.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${b.status === 'completed' ? 'bg-green-500' : b.status === 'assigned' ? 'bg-blue-500' : b.status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      <span className="font-semibold">{`${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Customer'}</span>
                      <span className="text-gray-400"> booked </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{b.service_name || 'a service'}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(b.created_at)} · <span className={`capitalize font-medium ${b.status === 'completed' ? 'text-green-600' : b.status === 'assigned' ? 'text-blue-600' : b.status === 'cancelled' ? 'text-red-500' : 'text-yellow-600'}`}>{b.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </CollapsibleCard>

      {/* Recent Transactions — collapsible */}
      <CollapsibleCard title="Recent Transactions" icon={ShoppingBag} count={recentTransactions.length} defaultOpen={true} iconAccent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
        {recentTransactions.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">No transactions yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 px-2 font-semibold text-gray-900 dark:text-white">{`${b.first_name || ''} ${b.last_name || ''}`.trim() || '—'}</td>
                      <td className="py-2.5 px-2 text-gray-500">{b.service_name || '—'}</td>
                      <td className="py-2.5 px-2 text-gray-400 text-xs whitespace-nowrap">{fmtDate(b.created_at)}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-green-600 dark:text-green-400">{fmtMoney(b.total_cost)}</td>
                      <td className="py-2.5 px-2"><StatusPill status={b.status} map={BOOKING_COLORS} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </CollapsibleCard>

      {/* Recently Joined Users — collapsible */}
      <CollapsibleCard title="Recently Joined Users" icon={UserCheck} count={recentUsers.length} defaultOpen={true} iconAccent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        {recentUsers.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">No users yet.</p>
          : (
            <div className="space-y-1">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{u.role} · joined {fmtDate(u.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </CollapsibleCard>

      {/* Revenue Over Time */}
      <RevenueOverTime bookings={bookings} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BookingTrendCard bookings={bookings} />
        <Card>
          <CardHeader><CardTitle className="text-sm">Bookings by Status</CardTitle></CardHeader>
          <CardContent>
            {statusData.length === 0
              ? <p className="text-sm text-gray-400 py-4 text-center">No data</p>
              : <StatusPieChart data={statusData} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Top Services (by Bookings)</CardTitle></CardHeader>
          <CardContent>
            {svcData.length === 0
              ? <p className="text-sm text-gray-400 py-4 text-center">No data</p>
              : <MiniBarChart data={svcData} color="#6366f1" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">User Role Distribution</CardTitle></CardHeader>
          <CardContent>
            {userRoleChartData.length === 0
              ? <p className="text-sm text-gray-400 py-4 text-center">No data</p>
              : (
                <>
                  <MiniPieChart data={userRoleChartData} />
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                    {userRoleChartData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ['#2563eb', '#10b981', '#f59e0b', '#6366f1'][i % 4] }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{d.name}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">New Users per Month (12mo)</CardTitle></CardHeader>
          <CardContent><MiniLineChart data={userGrowthData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Active vs Inactive Users</CardTitle></CardHeader>
          <CardContent><MiniBarChart data={overviewActiveVsInactive} color="#10b981" /></CardContent>
        </Card>
      </div>

      {/* Mechanic Performance */}
      {mechanicMetrics.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-500" />
            Mechanic Performance
          </h3>
          <div className="space-y-3">
            {mechanicMetrics.map((m, i) => {
              const rate = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{m.completed}/{m.total} jobs</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{rate}%</p>
                    <p className="text-xs text-gray-400">{fmtMoney(m.revenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS TAB — split into Unassigned / Assigned / Completed
// ═══════════════════════════════════════════════════════════════
function BookingsTab({ bookings, setBookings, mechanics, mechanicMap, onRefresh }: {
  bookings: RawBooking[]; setBookings: React.Dispatch<React.SetStateAction<RawBooking[]>>;
  mechanics: RawUser[]; mechanicMap: Record<number, RawUser>; onRefresh: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeBookingTab, setActiveBookingTab] = useState<'Unassigned' | 'Assigned' | 'Completed' | 'Cancelled'>('Unassigned');
  const [assignModal, setAssignModal] = useState<RawBooking | null>(null);
  const [assignMecId, setAssignMecId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<RawBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = bookings.filter((b) => {
    const name = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
    const svc = (b.service_name || '').toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || svc.includes(q);
  });

  const unassigned = filtered.filter((b) => b.status === 'pending' || b.status === 'scheduled');
  const assigned = filtered.filter((b) => b.status === 'assigned');
  const completed = filtered.filter((b) => b.status === 'completed');
  const cancelled = filtered.filter((b) => b.status === 'cancelled');

  const tabCounts = { Unassigned: unassigned.length, Assigned: assigned.length, Completed: completed.length, Cancelled: cancelled.length };
  const fullActiveList = activeBookingTab === 'Unassigned' ? unassigned : activeBookingTab === 'Assigned' ? assigned : activeBookingTab === 'Completed' ? completed : cancelled;
  const totalPages = Math.ceil(fullActiveList.length / PAGE_SIZE);
  const activeList = fullActiveList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAssignModal(b: RawBooking) {
    setAssignModal(b);
    setAssignMecId(b.mechanic_assigned ? String(b.mechanic_assigned) : '');
  }

  async function handleAssign() {
    if (!assignModal || !assignMecId) return;
    setAssignLoading(true);
    try {
      await bookingsAPI.update(String(assignModal.id), { mechanic_assigned: Number(assignMecId), status: 'assigned' });
      clearCache(`/bookings/mechanic/${assignMecId}`);
      // Optimistic update — no page reload needed
      setBookings(prev => prev.map(b =>
        b.id === assignModal.id ? { ...b, mechanic_assigned: Number(assignMecId), status: 'assigned' } : b
      ));
      setAssignModal(null);
      setAssignMecId('');
      onRefresh(); // sync in background
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleMarkComplete(bookingId: number) {
    setStatusLoading(bookingId);
    try {
      await bookingsAPI.update(String(bookingId), { status: 'completed' });
      // Optimistic update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
      onRefresh(); // sync in background
    } finally {
      setStatusLoading(null);
    }
  }

  async function handleReschedule() {
    if (!reschedulingBooking || !rescheduleDate) return;
    setRescheduleLoading(true);
    const newDatetime = new Date(rescheduleDate).toISOString();
    try {
      await bookingsAPI.update(String(reschedulingBooking.id), { booking_datetime: newDatetime });
      setBookings(prev => prev.map(b =>
        b.id === reschedulingBooking.id ? { ...b, booking_datetime: newDatetime } : b
      ));
      setReschedulingBooking(null);
      setRescheduleDate('');
      onRefresh();
    } finally {
      setRescheduleLoading(false);
    }
  }

  function openReschedule(b: RawBooking) {
    setReschedulingBooking(b);
    setRescheduleDate(toDatetimeLocal(b.booking_datetime));
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this booking?')) return;
    await bookingsAPI.delete(String(id));
    setBookings(prev => prev.filter(b => b.id !== id));
    onRefresh();
  }

  const showAssign = activeBookingTab === 'Unassigned' || activeBookingTab === 'Assigned';
  const isCompleted = activeBookingTab === 'Completed';

  const BookingRow = ({ b }: { b: RawBooking }) => {
    const mec = b.mechanic_assigned ? mechanicMap[b.mechanic_assigned] : null;
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td className="px-4 py-3">
          <span className="font-medium text-gray-900 dark:text-white">{`${b.first_name || ''} ${b.last_name || ''}`.trim() || '—'}</span>
        </td>
        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{b.service_name || '—'}</td>
        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(b.booking_datetime)}</td>
        <td className="px-4 py-3">
          {showAssign ? (
            <button
              onClick={() => openAssignModal(b)}
              className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                mec
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-100 border border-dashed border-yellow-300 dark:border-yellow-700/50'
              }`}
            >
              <Wrench className="w-3 h-3" />
              {mec ? fullName(mec) : 'Assign Mechanic'}
            </button>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-300">{mec ? fullName(mec) : '—'}</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {!isCompleted && b.status === 'assigned' && (
              <button
                onClick={() => handleMarkComplete(b.id)}
                disabled={statusLoading === b.id}
                className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors disabled:opacity-50"
                title="Mark Complete"
              >
                {statusLoading === b.id
                  ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />}
              </button>
            )}
            {isCompleted ? (
              <span className="p-1.5 text-gray-300 dark:text-gray-600 cursor-not-allowed" title="Cannot reschedule completed booking">
                <CalendarClock className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => openReschedule(b)}
                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                title="Reschedule"
              >
                <CalendarClock className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const tabAccentMap: Record<string, string> = {
    Unassigned: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    Assigned: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    Completed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    Cancelled: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bookings</h2>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={bookings.length} icon={Calendar} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard label="Unassigned" value={unassigned.length} icon={Clock} accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <StatCard label="Assigned" value={assigned.length} icon={Wrench} accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by customer or service…" />

      {/* Tab Toggle */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {(['Unassigned', 'Assigned', 'Completed', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveBookingTab(tab); setPage(1); }}
            className={`flex-1 min-w-fit text-sm px-4 py-2 rounded-lg font-medium transition-all ${
              activeBookingTab === tab
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              activeBookingTab === tab ? tabAccentMap[tab] : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
            }`}>{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable heads={['Customer', 'Service', 'Date & Time', 'Mechanic', 'Actions']} empty={activeList.length === 0}>
        {activeList.map((b) => <BookingRow key={b.id} b={b} />)}
      </DataTable>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, fullActiveList.length)} of {fullActiveList.length}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-xs font-medium px-2">{page} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Assign Mechanic Modal */}
      {assignModal && (
        <Modal title="Assign Mechanic" onClose={() => { setAssignModal(null); setAssignMecId(''); }}>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {`${assignModal.first_name || ''} ${assignModal.last_name || ''}`.trim() || 'Customer'}
              </p>
              <p className="text-xs text-gray-500">{assignModal.service_name || 'Service'}</p>
              <p className="text-xs text-gray-400">{fmtDateTime(assignModal.booking_datetime)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Select Mechanic</label>
              <select
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assignMecId}
                onChange={(e) => setAssignMecId(e.target.value)}
              >
                <option value="">Choose a mechanic…</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {fullName(m)}{m.specialty ? ` — ${m.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {mechanics.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-2 rounded-lg">
                No mechanics found. Add mechanics from the Users tab first.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => { setAssignModal(null); setAssignMecId(''); }}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignLoading || !assignMecId}>
              {assignLoading ? 'Assigning…' : 'Assign Mechanic'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <Modal title="Reschedule Booking" onClose={() => setReschedulingBooking(null)}>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {`${reschedulingBooking.first_name || ''} ${reschedulingBooking.last_name || ''}`.trim() || 'Customer'}
              </p>
              <p className="text-xs text-gray-500">{reschedulingBooking.service_name || 'Service'}</p>
              <p className="text-xs text-gray-400">Current: {fmtDateTime(reschedulingBooking.booking_datetime)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">New Date & Time</label>
              <input
                type="datetime-local"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => setReschedulingBooking(null)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={rescheduleLoading || !rescheduleDate}>
              {rescheduleLoading ? 'Saving…' : 'Reschedule'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════
function UsersTab({ users, onRefresh }: { users: RawUser[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const name = fullName(u).toLowerCase();
    const matchSearch = !q || name.includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const today = new Date().toISOString().slice(0, 10);
  const newToday = users.filter((u) => u.created_at?.slice(0, 10) === today).length;
  const customers = users.filter((u) => u.role === 'customer').length;
  const mechanics = users.filter((u) => u.role === 'mechanic').length;
  const admins = users.filter((u) => u.role === 'admin').length;

  async function handleRoleChange(userId: number, newRole: string) {
    setUpdatingId(userId);
    try {
      await usersAPI.updateRole(userId, newRole);
      onRefresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Users</h2>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} accent="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard label="New Today" value={newToday} icon={UserPlus} accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <StatCard label="Customers" value={customers} icon={Users} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard label="Mechanics" value={mechanics} icon={Wrench} accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
        <select
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none min-w-40"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles ({users.length})</option>
          <option value="customer">Customers ({customers})</option>
          <option value="mechanic">Mechanics ({mechanics})</option>
          <option value="admin">Admins ({admins})</option>
        </select>
      </div>

      <DataTable heads={['Name', 'Email', 'Role', 'Joined', 'Change Role']} empty={filtered.length === 0}>
        {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((u) => (
          <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(u.first_name || '?').charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{fullName(u)}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
            <td className="px-4 py-3">{rolePill(u.role)}</td>
            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(u.created_at)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <select
                  className="text-xs border rounded-lg px-2 py-1 bg-white dark:bg-gray-700"
                  value={u.role}
                  disabled={updatingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="admin">Admin</option>
                </select>
                {updatingId === u.id && <span className="text-xs text-gray-400">Saving…</span>}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Users pagination */}
      {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-xs font-medium px-2">{page} / {Math.ceil(filtered.length / PAGE_SIZE)}</span>
            <Button size="sm" variant="outline" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY TAB
// ═══════════════════════════════════════════════════════════════
type PartForm = { name: string; description: string; category: string; price: string; stock_quantity: string };
const emptyPartForm: PartForm = { name: '', description: '', category: '', price: '', stock_quantity: '' };

function InventoryTab({ parts, setParts, onRefresh }: { parts: RawPart[]; setParts: React.Dispatch<React.SetStateAction<RawPart[]>>; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RawPart | null>(null);
  const [form, setForm] = useState<PartForm>(emptyPartForm);
  const [saving, setSaving] = useState(false);
  const [localParts, setLocalParts] = useState<RawPart[]>(parts);

  useEffect(() => { setLocalParts(parts); }, [parts]);

  // Available parts first, then unavailable; within each group sort by name
  const filtered = localParts
    .filter((p) => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.is_available !== b.is_available) return a.is_available ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  function openAdd() { setEditing(null); setForm(emptyPartForm); setShowModal(true); }
  function openEdit(p: RawPart) {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', category: p.category || '', price: p.price, stock_quantity: String(p.stock_quantity) });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description, category: form.category, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0 };
      if (editing) {
        const updated = await carPartsAPI.update(String(editing.id), payload);
        const merged = { ...editing, ...payload, ...(updated || {}) };
        setLocalParts(prev => prev.map(p => p.id === editing.id ? merged as RawPart : p));
        setParts(prev => prev.map(p => p.id === editing.id ? merged as RawPart : p));
      } else {
        const created = await carPartsAPI.create(payload);
        if (created) {
          setLocalParts(prev => [...prev, created as RawPart]);
          setParts(prev => [...prev, created as RawPart]);
        }
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this part?')) return;
    await carPartsAPI.delete(String(id));
    setLocalParts(prev => prev.filter(p => p.id !== id));
    setParts(prev => prev.filter(p => p.id !== id));
  }

  async function handleToggleAvail(p: RawPart) {
    const newVal = !p.is_available;
    await carPartsAPI.update(String(p.id), { is_available: newVal });
    setLocalParts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: newVal } : x));
    setParts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: newVal } : x));
  }

  const stockColor = (q: number) => q <= 0 ? 'text-red-600 font-bold' : q <= 5 ? 'text-yellow-600 font-semibold' : 'text-green-600';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Parts Inventory</h2>
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{localParts.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openAdd} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950"><Plus className="w-4 h-4 mr-1" />Add Part</Button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or category…" />

      <DataTable heads={['Part Name', 'Category', 'Price', 'In Stock', 'Actions']} empty={filtered.length === 0}>
        {filtered.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                  {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
            <td className="px-4 py-3 font-semibold">{fmtMoney(p.price)}</td>
            <td className="px-4 py-3">
              <span className={stockColor(p.stock_quantity)}>{p.stock_quantity}</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {showModal && (
        <Modal title={editing ? 'Edit Part' : 'Add New Part'} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Part Name *</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Brake Pad Set" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Brakes" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price (GH₵) *</label>
              <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Quantity in Stock</label>
              <Input type="number" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.price}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Part'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════
function OrdersTab({ orders, setOrders, onRefresh }: { orders: RawOrder[]; setOrders: React.Dispatch<React.SetStateAction<RawOrder[]>>; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [completing, setCompleting] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeOrderTab, setActiveOrderTab] = useState<'pending' | 'completed'>('pending');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [localOrders, setLocalOrders] = useState<RawOrder[]>(orders);

  // Keep local orders in sync when parent fetches new data
  useEffect(() => { setLocalOrders(orders); }, [orders]);

  const filtered = localOrders.filter((o) => {
    const name = `${o.first_name || ''} ${o.last_name || ''}`.toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || String(o.id).includes(q) || (o.email || '').toLowerCase().includes(q);
  });

  async function handleMarkComplete(id: number) {
    setCompleting(id);
    try {
      await ordersAPI.update(String(id), { status: 'delivered' });
      // Update local state immediately — no waiting for parent refresh
      setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'delivered' } : o));
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'delivered' } : o));
      setToast({ type: 'success', message: 'Order marked as completed!' });
    } catch {
      setToast({ type: 'error', message: 'Failed to update order. Please try again.' });
    } finally {
      setCompleting(null);
    }
  }

  const pendingOrders = filtered.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = filtered.filter(o => o.status === 'delivered');

  const OrderRow = ({ o }: { o: RawOrder }) => (
    <React.Fragment key={o.id}>
      <tr
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
      >
        <td className="px-4 py-3 font-mono text-xs text-gray-400">#{o.id}</td>
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{`${o.first_name || ''} ${o.last_name || ''}`.trim() || '—'}</p>
            <p className="text-xs text-gray-400">{o.email || ''}</p>
          </div>
        </td>
        <td className="px-4 py-3 text-center text-sm">{getOrderItemCount(o)} item{getOrderItemCount(o) !== 1 ? 's' : ''}</td>
        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">{fmtMoney(o.total_amount)}</td>
        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(o.created_at)}</td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {o.status !== 'delivered' && o.status !== 'cancelled' ? (
            <button
              onClick={() => handleMarkComplete(o.id)}
              disabled={completing === o.id}
              className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-lg disabled:opacity-50 whitespace-nowrap font-medium"
            >
              {completing === o.id ? '…' : 'Mark Complete'}
            </button>
          ) : (
            <span className="text-xs text-green-600 font-medium">Completed</span>
          )}
        </td>
      </tr>
      {expandedId === o.id && getOrderItems(o).length > 0 && (
        <tr>
          <td colSpan={6} className="bg-gray-50 dark:bg-gray-800/30 px-8 py-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Order Items</p>
            <div className="space-y-1.5">
              {getOrderItems(o).map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                  <span className="font-semibold">{fmtMoney(Number(item.unit_price) * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-600 pt-1.5 mt-1.5">
                <span>Total</span>
                <span>{fmtMoney(o.total_amount)}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );

  const tableHeads = ['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Action'];
  const visibleOrders = activeOrderTab === 'pending' ? pendingOrders : completedOrders;

  return (
    <div className="space-y-5">
      {toast && <SweetAlert type={toast.type} message={toast.message} duration={3000} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h2>
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{orders.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Pending Orders" value={pendingOrders.length} icon={Clock} accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <StatCard label="Completed Orders" value={completedOrders.length} icon={CheckCircle2} accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {(['pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveOrderTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeOrderTab === tab
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'pending' ? 'Pending' : 'Completed'}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeOrderTab === tab ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {tab === 'pending' ? pendingOrders.length : completedOrders.length}
            </span>
          </button>
        ))}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by customer or order ID…" />

      <DataTable heads={tableHeads} empty={visibleOrders.length === 0}>
        {visibleOrders.map((o) => <OrderRow key={o.id} o={o} />)}
      </DataTable>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SERVICES TAB — max 6, deduplicated, no duration
// ═══════════════════════════════════════════════════════════════
type ServiceForm = { name: string; description: string; category: string; price: string };
const emptySvcForm: ServiceForm = { name: '', description: '', category: '', price: '' };

function ServicesTab({ services, onRefresh }: { services: RawService[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RawService | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptySvcForm);
  const [saving, setSaving] = useState(false);

  // Deduplicate by name (case-insensitive), keep first occurrence
  const deduped = useMemo(() => {
    const seen = new Set<string>();
    return services.filter((s) => {
      const key = s.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  }, [services]);

  const filtered = deduped.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q);
  });

  function openAdd() { setEditing(null); setForm(emptySvcForm); setShowModal(true); }
  function openEdit(s: RawService) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', category: s.category || '', price: s.price });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description, category: form.category, price: parseFloat(form.price) };
      if (editing) {
        await servicesAPI.update(String(editing.id), payload);
      } else {
        await servicesAPI.create(payload);
      }
      setShowModal(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(s: RawService) {
    await servicesAPI.update(String(s.id), { is_active: !s.is_active });
    onRefresh();
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this service?')) return;
    await servicesAPI.delete(String(id));
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Services</h2>
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{deduped.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openAdd} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950"><Plus className="w-4 h-4 mr-1" />Add Service</Button>
        </div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or category…" />

      <DataTable heads={['Service Name', 'Category', 'Price', 'Status', 'Actions']} empty={filtered.length === 0}>
        {filtered.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="px-4 py-3">
              <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
              {s.description && <p className="text-xs text-gray-400 truncate max-w-xs">{s.description}</p>}
            </td>
            <td className="px-4 py-3 text-gray-500 capitalize">{s.category || '—'}</td>
            <td className="px-4 py-3 font-semibold">{fmtMoney(s.price)}</td>
            <td className="px-4 py-3">
              <button onClick={() => handleToggleActive(s)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.is_active ? 'Active' : 'Inactive'}
              </button>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {showModal && (
        <Modal title={editing ? 'Edit Service' : 'Add New Service'} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Service Name *</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Oil Change" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Maintenance" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price (GH₵) *</label>
              <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.price}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REVENUE OVER TIME (with daily/weekly/monthly toggle)
// ═══════════════════════════════════════════════════════════════
type RevPeriod = 'daily' | 'weekly' | 'monthly';

function RevenueOverTime({ bookings }: { bookings: RawBooking[] }) {
  const [period, setPeriod] = useState<RevPeriod>('monthly');
  const today = new Date();

  const data = useMemo(() => {
    if (period === 'daily') {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        const value = bookings
          .filter((b) => b.booking_datetime?.slice(0, 10) === key)
          .reduce((s, b) => s + Number(b.total_cost || 0), 0);
        return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value };
      });
    }
    if (period === 'weekly') {
      return Array.from({ length: 12 }, (_, i) => {
        const wEnd = new Date(today);
        wEnd.setDate(today.getDate() - i * 7);
        const wStart = new Date(wEnd);
        wStart.setDate(wEnd.getDate() - 6);
        const value = bookings.filter((b) => {
          if (!b.booking_datetime) return false;
          const d = new Date(b.booking_datetime);
          return d >= wStart && d <= wEnd;
        }).reduce((s, b) => s + Number(b.total_cost || 0), 0);
        return {
          label: wStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value,
        };
      }).reverse();
    }
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(today.getMonth() - (11 - i));
      const key = d.toISOString().slice(0, 7);
      const value = bookings
        .filter((b) => b.booking_datetime?.slice(0, 7) === key)
        .reduce((s, b) => s + Number(b.total_cost || 0), 0);
      return { label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), value };
    });
  }, [bookings, period]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm">Revenue Over Time</CardTitle>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 gap-0.5">
            {(['daily', 'weekly', 'monthly'] as RevPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-md capitalize font-medium transition-all ${
                  period === p
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `GH₵${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
            <Tooltip formatter={(v: number) => [fmtMoney(v), 'Revenue']} />
            <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANALYSIS TAB
// ═══════════════════════════════════════════════════════════════
function AnalysisTab({ bookings, users, parts, orders }: { bookings: RawBooking[]; users: RawUser[]; services: RawService[]; parts: RawPart[]; orders: RawOrder[] }) {
  const today = new Date();

  const totalRevenue = bookings.reduce((s, b) => s + Number(b.total_cost || 0), 0);
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const completedRevenue = completedBookings.reduce((s, b) => s + Number(b.total_cost || 0), 0);
  const avgValue = bookings.length ? totalRevenue / bookings.length : 0;
  const completionRate = bookings.length ? (completedBookings.length / bookings.length) * 100 : 0;
  const paidCount = bookings.filter((b) => b.payment_status === 'paid').length;
  const pendingPayCount = bookings.filter((b) => !b.payment_status || b.payment_status === 'pending').length;

  // Revenue by service (top 6)
  const svcRevenue: Record<string, { revenue: number; count: number }> = {};
  bookings.forEach((b) => {
    const k = b.service_name?.trim() || 'Unknown';
    if (!svcRevenue[k]) svcRevenue[k] = { revenue: 0, count: 0 };
    svcRevenue[k].revenue += Number(b.total_cost || 0);
    svcRevenue[k].count += 1;
  });
  const svcRevenueData = Object.entries(svcRevenue)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6)
    .map(([label, d]) => ({ label: truncLabel(label, 14), value: d.revenue }));

  // Booking status dist — completed includes scheduled, no Assigned slice
  const statusDist = [
    { name: 'Completed', value: bookings.filter((b) => b.status === 'completed' || b.status === 'scheduled').length, color: STATUS_PIE_COLORS.Completed },
    { name: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, color: STATUS_PIE_COLORS.Pending },
    { name: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, color: STATUS_PIE_COLORS.Cancelled },
  ].filter((d) => d.value > 0);

  // Fast-moving parts (most ordered by total quantity)
  const partSales: Record<string, { qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    getOrderItems(o).forEach((item) => {
      const key = item.name.trim();
      if (!partSales[key]) partSales[key] = { qty: 0, revenue: 0 };
      partSales[key].qty += item.quantity;
      partSales[key].revenue += Number(item.unit_price) * item.quantity;
    });
  });
  const fastMovingParts = Object.entries(partSales)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 8)
    .map(([label, d]) => ({ label: truncLabel(label, 14), value: d.qty, revenue: d.revenue }));

  // Store breakdown: orders stats
  const totalOrderRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const orderRevenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      value: orders.filter((o) => o.created_at?.slice(0, 7) === key).reduce((s, o) => s + Number(o.total_amount || 0), 0),
    };
  });

  // Customer growth
  const customerGrowth = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (11 - i));
    const key = d.toISOString().slice(0, 7);
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      value: users.filter((u) => u.created_at?.slice(0, 7) === key).length,
    };
  });

  // User analytics
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const activeUsersSet = new Set(bookings.filter((b) => new Date(b.created_at) > thirtyDaysAgo).map((b) => b.user_id));
  const activeUsersCount = activeUsersSet.size;
  const userCustomers = users.filter((u) => u.role === 'customer').length;
  const userMechanicsCount = users.filter((u) => u.role === 'mechanic').length;
  const userAdminsCount = users.filter((u) => u.role === 'admin').length;
  const userRoleData = [
    { name: 'Customers', value: userCustomers },
    { name: 'Mechanics', value: userMechanicsCount },
    { name: 'Admins', value: userAdminsCount },
  ].filter((d) => d.value > 0);

  const activeVsInactive = [
    { label: 'Active (30d)', value: activeUsersCount },
    { label: 'Inactive', value: Math.max(0, users.length - activeUsersCount) },
  ];

  // Bookings by day of week
  const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bookingsByDay = Array.from({ length: 7 }, (_, i) => ({
    label: DOW_LABELS[i],
    value: bookings.filter((b) => b.booking_datetime && new Date(b.booking_datetime).getDay() === i).length,
  }));

  // Mechanic performance
  const mechPerf: Record<number, { name: string; jobs: number; completed: number }> = {};
  bookings.forEach((b) => {
    if (!b.mechanic_assigned) return;
    if (!mechPerf[b.mechanic_assigned]) {
      mechPerf[b.mechanic_assigned] = { name: `Mechanic #${b.mechanic_assigned}`, jobs: 0, completed: 0 };
    }
    mechPerf[b.mechanic_assigned].jobs += 1;
    if (b.status === 'completed') mechPerf[b.mechanic_assigned].completed += 1;
  });
  users.filter((u) => u.role === 'mechanic').forEach((u) => {
    if (mechPerf[u.id]) mechPerf[u.id].name = fullName(u) || `Mechanic #${u.id}`;
  });
  const mechPerfData = Object.values(mechPerf)
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 8)
    .map((m) => ({ label: m.name.split(' ')[0], value: m.jobs, completed: m.completed }));

  // Mechanic specialization: derived from most-worked service per mechanic
  const mechanics = users.filter((u) => u.role === 'mechanic');
  // Build service-count map per mechanic from their bookings
  const mechServiceMap: Record<number, Record<string, number>> = {};
  bookings.forEach((b) => {
    if (!b.mechanic_assigned || !b.service_name) return;
    if (!mechServiceMap[b.mechanic_assigned]) mechServiceMap[b.mechanic_assigned] = {};
    const svc = b.service_name.trim();
    mechServiceMap[b.mechanic_assigned][svc] = (mechServiceMap[b.mechanic_assigned][svc] || 0) + 1;
  });
  const getMechTopService = (mechId: number): string => {
    const svcCounts = mechServiceMap[mechId];
    if (!svcCounts || Object.keys(svcCounts).length === 0) return 'No jobs yet';
    return Object.entries(svcCounts).sort((a, b) => b[1] - a[1])[0][0];
  };
  // Specialization breakdown: group mechanics by their most-common service type
  const specialtyMap: Record<string, number> = {};
  mechanics.forEach((m) => {
    const spec = getMechTopService(m.id);
    if (spec === 'No jobs yet') return;
    specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
  });
  const specialtyData = Object.entries(specialtyMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Mechanic completion rates
  const mechCompRate = Object.values(mechPerf).map((m) => ({
    label: m.name.split(' ')[0],
    value: m.jobs > 0 ? Math.round((m.completed / m.jobs) * 100) : 0,
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Avg jobs per mechanic
  const avgJobsPerMechanic = mechanics.length
    ? (Object.values(mechPerf).reduce((s, m) => s + m.jobs, 0) / mechanics.length).toFixed(1)
    : '0';

  const cancellationRate = bookings.length
    ? ((bookings.filter((b) => b.status === 'cancelled').length / bookings.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics &amp; Reports</h2>
      </div>

      {/* ── ALL KPI CARDS AT THE TOP ── */}

      {/* KPI Row 1 — Revenue */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Revenue</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={fmtMoney(totalRevenue)} icon={TrendingUp} accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
          <StatCard label="Completed Revenue" value={fmtMoney(completedRevenue)} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
          <StatCard label="Avg Booking Value" value={fmtMoney(Math.round(avgValue))} icon={TrendingUp} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
          <StatCard label="Paid Bookings" value={paidCount} icon={CheckCircle2} accent="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" />
        </div>
      </div>

      {/* KPI Row 2 — Bookings & Ops (Awaiting Payment removed) */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Bookings &amp; Operations</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Completion Rate" value={`${completionRate.toFixed(1)}%`} icon={BarChart3} accent="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
          <StatCard label="Cancellation Rate" value={`${cancellationRate}%`} icon={AlertCircle} accent="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
          <StatCard label="Avg Jobs / Mechanic" value={avgJobsPerMechanic} icon={Wrench} accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        </div>
      </div>

      {/* KPI Row 3 — Users */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Users</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={users.length} icon={Users} accent="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
          <StatCard label="Active Users (30d)" value={activeUsersCount} icon={UserCheck} accent="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" />
          <StatCard label="Customers" value={userCustomers} icon={Users} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
          <StatCard label="Mechanics" value={userMechanicsCount} icon={Wrench} accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        </div>
      </div>

      {/* KPI Row 4 — Store & Parts */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Store &amp; Parts</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Store Revenue" value={fmtMoney(totalOrderRevenue)} icon={ShoppingCart} accent="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
          <StatCard label="Total Orders" value={orders.length} icon={Package} accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
          <StatCard label="Completed Orders" value={completedOrders} icon={CheckCircle2} accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
          <StatCard label="Pending Orders" value={pendingOrders} icon={Clock} accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        </div>
      </div>

      {/* Revenue Over Time */}
      <RevenueOverTime bookings={bookings} />

      {/* Charts Row 1 — Bookings */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Booking Trends</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BookingTrendCard bookings={bookings} />
          <Card>
            <CardHeader><CardTitle className="text-sm">Revenue by Service</CardTitle></CardHeader>
            <CardContent>
              {svcRevenueData.length === 0
                ? <p className="text-sm text-gray-400 py-4 text-center">No data</p>
                : <MiniBarChart data={svcRevenueData} color="#2563eb" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Booking Status Distribution</CardTitle></CardHeader>
            <CardContent>
              {statusDist.length === 0
                ? <p className="text-sm text-gray-400 py-4 text-center">No data</p>
                : <StatusPieChart data={statusDist} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Bookings by Day of Week</CardTitle></CardHeader>
            <CardContent><MiniBarChart data={bookingsByDay} color="#6366f1" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">New Customers per Month</CardTitle></CardHeader>
            <CardContent><MiniLineChart data={customerGrowth} /></CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row — User Analytics */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">User Analytics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">User Role Distribution</CardTitle></CardHeader>
            <CardContent>
              {userRoleData.length === 0
                ? <p className="text-sm text-gray-400 py-4 text-center">No data</p>
                : (
                  <>
                    <MiniPieChart data={userRoleData} />
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                      {userRoleData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ['#2563eb', '#10b981', '#f59e0b', '#6366f1'][i % 4] }} />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{d.name}</span>
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">New Users per Month (12mo)</CardTitle></CardHeader>
            <CardContent><MiniLineChart data={customerGrowth} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Monthly User Registrations (12mo)</CardTitle></CardHeader>
            <CardContent><MiniBarChart data={customerGrowth} color="#6366f1" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Active vs Inactive Users</CardTitle></CardHeader>
            <CardContent><MiniBarChart data={activeVsInactive} color="#10b981" /></CardContent>
          </Card>
        </div>
      </div>

      {/* Store / Parts Breakdown — Charts Only */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Store &amp; Parts Charts</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fastMovingParts.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Fast-Moving Parts (by Qty Sold)</CardTitle></CardHeader>
              <CardContent>
                <MiniBarChart data={fastMovingParts} color="#f59e0b" />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-sm">Store Revenue (Last 6 Months)</CardTitle></CardHeader>
            <CardContent>
              {orderRevenueByMonth.every((d) => d.value === 0)
                ? <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
                : <MiniAreaChart data={orderRevenueByMonth} />}
            </CardContent>
          </Card>
          {fastMovingParts.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm">Fast-Moving Parts — Sales Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Part Name</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Units Sold</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fastMovingParts.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white">{p.label}</td>
                          <td className="py-2.5 px-2 text-right font-semibold">{p.value}</td>
                          <td className="py-2.5 px-2 text-right text-green-600 dark:text-green-400 font-semibold">{fmtMoney(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mechanic Jobs Chart */}
      {mechPerfData.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Mechanic Performance</p>
          <Card>
            <CardHeader><CardTitle className="text-sm">Jobs — Total vs Completed per Mechanic</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mechPerfData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Total Jobs" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mechanic Section */}
      {mechanics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Mechanic Insights</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completion Rate per Mechanic */}
            {mechCompRate.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Mechanic Completion Rate (%)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mechCompRate} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Mechanic Leaderboard */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-sm">Mechanic Performance Leaderboard</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mechanic</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialization</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jobs</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(mechPerf)
                        .sort((a, b) => b.completed - a.completed)
                        .map((m, i) => {
                          const mechUser = users.find((u) => u.role === 'mechanic' && fullName(u) === m.name);
                          const rate = m.jobs > 0 ? Math.round((m.completed / m.jobs) * 100) : 0;
                          const topService = mechUser ? getMechTopService(mechUser.id) : 'No jobs yet';
                          return (
                            <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                              <td className="py-2.5 px-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                              <td className="py-2.5 px-2 font-semibold text-gray-900 dark:text-white">{m.name}</td>
                              <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400 text-xs">{topService}</td>
                              <td className="py-2.5 px-2 text-right">{m.jobs}</td>
                              <td className="py-2.5 px-2 text-right text-green-600 dark:text-green-400 font-semibold">{m.completed}</td>
                              <td className="py-2.5 px-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-14 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${rate}%` }} />
                                  </div>
                                  <span className="text-xs font-medium w-8 text-right">{rate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Ideal Mechanic per Service Type */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Ideal Mechanic per Service Type</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Best mechanic for each service based on completed jobs and completion rate</p>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Build: for each service, which mechanic has the most completions?
                  const svcMechMap: Record<string, Record<number, { name: string; completed: number; total: number }>> = {};
                  bookings.forEach((b) => {
                    if (!b.mechanic_assigned || !b.service_name) return;
                    const svc = b.service_name.trim();
                    if (!svcMechMap[svc]) svcMechMap[svc] = {};
                    const mId = b.mechanic_assigned;
                    if (!svcMechMap[svc][mId]) {
                      const mu = users.find((u) => u.id === mId);
                      svcMechMap[svc][mId] = { name: mu ? fullName(mu) : `Mechanic #${mId}`, completed: 0, total: 0 };
                    }
                    svcMechMap[svc][mId].total += 1;
                    if (b.status === 'completed') svcMechMap[svc][mId].completed += 1;
                  });

                  const rows = Object.entries(svcMechMap).map(([svc, mechs]) => {
                    const best = Object.values(mechs).sort((a, b) => b.completed !== a.completed ? b.completed - a.completed : b.total - a.total)[0];
                    const rate = best.total > 0 ? Math.round((best.completed / best.total) * 100) : 0;
                    return { svc, best, rate };
                  }).sort((a, b) => a.svc.localeCompare(b.svc));

                  if (rows.length === 0) {
                    return <p className="text-sm text-gray-400 py-4 text-center">No booking data available yet</p>;
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700">
                            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Type</th>
                            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ideal Mechanic</th>
                            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jobs Done</th>
                            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completion Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(({ svc, best, rate }, i) => (
                            <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                              <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white">{svc}</td>
                              <td className="py-2.5 px-2">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200">{best.name}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-right text-gray-600 dark:text-gray-400">{best.completed} / {best.total}</td>
                              <td className="py-2.5 px-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-14 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${rate}%` }} />
                                  </div>
                                  <span className="text-xs font-medium w-8 text-right">{rate}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Service Performance Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Service Performance Breakdown</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(svcRevenue).length === 0
            ? <p className="text-sm text-gray-400 py-4 text-center">No booking data available</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bookings</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(svcRevenue)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([svc, d]) => (
                        <tr key={svc} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="py-2.5 px-2 font-medium">{svc}</td>
                          <td className="py-2.5 px-2 text-right">{d.count}</td>
                          <td className="py-2.5 px-2 text-right font-semibold text-green-600 dark:text-green-400">{fmtMoney(d.revenue)}</td>
                          <td className="py-2.5 px-2 text-right text-gray-500">{fmtMoney(d.count ? Math.round(d.revenue / d.count) : 0)}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                      <td className="py-2.5 px-2 font-bold">Total</td>
                      <td className="py-2.5 px-2 text-right font-bold">{bookings.length}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-green-600 dark:text-green-400">{fmtMoney(totalRevenue)}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-gray-500">{fmtMoney(Math.round(avgValue))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════
export function AdminPortal({ user, onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState('Overview');

  const menuItems = [
    { label: 'Overview', icon: BarChart3, active: activeTab === 'Overview', onClick: () => setActiveTab('Overview') },
    { label: 'Bookings', icon: Calendar, active: activeTab === 'Bookings', onClick: () => setActiveTab('Bookings') },
    { label: 'Users', icon: Users, active: activeTab === 'Users', onClick: () => setActiveTab('Users') },
    { label: 'Inventory', icon: Package, active: activeTab === 'Inventory', onClick: () => setActiveTab('Inventory') },
    { label: 'Orders', icon: ShoppingCart, active: activeTab === 'Orders', onClick: () => setActiveTab('Orders') },
    { label: 'Services', icon: Wrench, active: activeTab === 'Services', onClick: () => setActiveTab('Services') },
    { label: 'Analytics', icon: TrendingUp, active: activeTab === 'Analytics', onClick: () => setActiveTab('Analytics') },
  ];

  return (
    <TailAdminLayout user={user} onLogout={onLogout} title="Admin Dashboard" menuItems={menuItems}>
      <AdminPortalContent user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
    </TailAdminLayout>
  );
}

export default AdminPortal;
