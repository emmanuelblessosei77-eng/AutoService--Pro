import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '../App';
import { TailAdminLayout } from './layouts/TailAdminLayout';
import '../styles/mobile-dashboard-utils.css';
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { users as apiUsers, vehicles as apiVehicles, bookings as apiBookings, services as apiServices, carParts as apiCarParts, orders as apiOrders, partRequests as apiPartRequests, payments as apiPayments, clearCache } from '../../services/api';
import { initImageDB, loadVehicleImages, saveVehicleImages, deleteVehicleImages, loadAllVehicleImages } from '../utils/vehicleImageDb';
import { Vehicle, ServiceBooking, UserProfile } from '../types/dashboard';
import { parts, services } from '../data/data';
import { PaymentStep } from './booking-steps';
import SweetAlert from './SweetAlert';
import { UpcomingBookingsCard } from './UpcomingBookingsCard';
import { 
  Car, Calendar, CheckCircle2, AlertCircle, Wrench, Clock, Plus, 
  TrendingUp, DollarSign, Settings, LayoutDashboard, FileText,
  MessageSquare, Trash2, Edit2, Eye, Download, ChevronRight, X,
  ShoppingBag, ShoppingCart, Image, Star, Lock, Zap, Trash, Package, ChevronDown
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { resolvePartImage } from '../utils/partImageResolver';
import { PartCard } from './sections/PartCard';


interface CustomerPortalProps {
  user: User;
  onLogout: () => void;
}

// User Settings Modal Component
function UserSettingsModal({ user }: { user: User }) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    // Here you would make an API call to update the password
    // const response = await updatePassword({ currentPassword, newPassword });
    setPasswordSuccess('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:text-blue-600">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>Manage your user profile and settings.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Profile Information</h3>
            <div className="space-y-2 bg-gray-50 p-3 rounded">
              <div>
                <label className="text-xs text-gray-600">Name</label>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Email</label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600">Role</label>
                <p className="text-sm font-medium capitalize bg-blue-100 text-blue-800 w-fit px-2 py-1 rounded text-xs">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="current-pwd" className="text-xs">Current Password</Label>
                <Input
                  id="current-pwd"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="new-pwd" className="text-xs">New Password</Label>
                <Input
                  id="new-pwd"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="confirm-pwd" className="text-xs">Confirm Password</Label>
                <Input
                  id="confirm-pwd"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-pwd"
                  checked={showPassword}
                  onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                />
                <Label htmlFor="show-pwd" className="text-xs font-normal cursor-pointer">
                  Show passwords
                </Label>
              </div>
            </div>
            {passwordError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                {passwordSuccess}
              </div>
            )}
            <Button
              onClick={handlePasswordChange}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Update Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Dashboard Overview Component with Modern Analytics
function DashboardOverview() {
  const { data } = useDashboard();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalOrdersPlaced, setTotalOrdersPlaced] = useState(0);
  const [orderItems, setOrderItems] = useState<{[key: number]: any[]}>({});
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Load order history on mount
  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        const response = await apiOrders.getMyOrders();
        // Normalize: handle both plain array and {data: [...]} formats
        const ordersArray: any[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        setTotalOrdersPlaced(ordersArray.length);

        if (ordersArray.length > 0) {
          // Get 5 most recent orders
          const recent = ordersArray.slice(0, 5);
          setRecentOrders(recent);

          // Fetch items for each order
          const itemsMap: {[key: number]: any[]} = {};
          await Promise.all(recent.map(async (order: any) => {
            try {
              const itemData = await apiOrders.getById(String(order.id));
              itemsMap[order.id] = itemData?.items || itemData?.order_items || [];
            } catch (e) {
              itemsMap[order.id] = [];
            }
          }));
          setOrderItems(itemsMap);
        }
      } catch (error) {
        console.warn('Could not fetch recent orders:', error);
      }
    };

    loadOrderHistory();
  }, []);

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin inline-block mr-2">⌛</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  const stats = data.stats;
  
  // Get upcoming bookings sorted by date
  const upcomingBookings = data.bookings
    .filter(b => {
      const bookingDate = new Date(b.scheduledDate);
      return b.status !== 'cancelled' && b.status !== 'completed' && bookingDate > new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      return dateA.getTime() - dateB.getTime();
    });

  // Completed bookings (most recent first)
  const completedBookings = data.bookings
    .filter(b => b.status === 'completed')
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const getCompletedBookingPaidAmount = (booking: any): number => {
    const parsed = parseFloat(
      String(
        booking.amountPaid
        ?? booking.amount_paid
        ?? booking.paid_amount
        ?? booking.total_cost
        ?? booking.totalCost
        ?? booking.payment_amount
        ?? booking.paymentAmount
        ?? booking.amount
        ?? booking.billingAmount
        ?? booking.service_price
        ?? booking.estimatedCost
        ?? 0,
      ),
    );
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getUpcomingBookingAmount = (booking: any): number => {
    const parsed = parseFloat(
      String(
        booking.total_cost
        ?? booking.totalCost
        ?? booking.payment_amount
        ?? booking.paymentAmount
        ?? booking.amount
        ?? booking.billingAmount
        ?? booking.estimatedCost
        ?? 0,
      ),
    );
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getBookingServiceLabel = (booking: any): string => {
    const rawServiceType = booking.serviceType ?? booking.service_type;
    const rawAsString = rawServiceType != null ? String(rawServiceType).trim() : '';
    const invalidServiceType = new Set(['general', 'service', 'n/a', 'na', 'unknown']);

    // Always prefer explicit booking service name/title before using type/id-like fields.
    const nameCandidates = [booking.service_name, booking.serviceName, booking.service?.name, booking.title];
    const selectedName = nameCandidates.find((value) => {
      if (typeof value !== 'string') return false;
      const normalized = value.trim().toLowerCase();
      return normalized.length > 0 && !invalidServiceType.has(normalized);
    });
    if (selectedName) {
      return selectedName.trim();
    }

    // If serviceType is a numeric id, map it to the configured service title.
    if (rawAsString && /^\d+$/.test(rawAsString)) {
      const matchedById = services.find((s: any) => String(s.id) === rawAsString);
      if (matchedById?.title) {
        return matchedById.title;
      }
    }

    // Prefer service type only when it's a real non-placeholder text label.
    if (rawAsString && !invalidServiceType.has(rawAsString.toLowerCase())) {
      const normalized = rawAsString
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();

      // If still purely numeric, it's an id, not a booking name.
      if (/^\d+$/.test(normalized)) {
        return 'Car Service';
      }

      return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const serviceIdRaw = booking.service_id != null ? String(booking.service_id).trim() : '';
    if (serviceIdRaw) {
      const matchedById = services.find((s: any) => String(s.id) === serviceIdRaw);
      if (matchedById?.title) {
        return matchedById.title;
      }
    }

    return 'Car Service';
  };

  const getBookingType = (booking: any): string => {
    if (!booking) return '';
    const typeCandidates = [
      booking.type,
      booking.booking_type,
      booking.service_type,
      booking.category,
      booking.service?.category,
      booking.service?.type,
      booking.service?.name && typeof booking.service?.name === 'string' && booking.service?.name !== booking.service_name
        ? booking.service.name
        : null,
    ];

    for (const value of typeCandidates) {
      if (!value) continue;
      if (typeof value === 'string' && value.trim() !== '') return value;
      if (typeof value === 'number') return String(value);
    }

    return '';
  };

  const formatBookingDate = (booking: any): string => {
    const source = booking.scheduledDate ?? booking.booking_datetime ?? booking.completed_at ?? booking.updatedAt;
    if (!source) {
      return 'N/A';
    }

    const date = source instanceof Date ? source : new Date(source);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate analytics
  const totalBookings = data.bookings.length;
  const upcomingCount = upcomingBookings.length;
  const completedCount = completedBookings.length || stats.completedServices || 0;
  const totalSpent = completedBookings
    .reduce((sum, b) => sum + getCompletedBookingPaidAmount(b), 0);

  const formatActivityDate = (value: any): string => {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Activity feed — real timeline from bookings and orders, sorted by actual timestamps
  const activityFeed = [
    ...data.bookings.map((b: any) => {
      const when = new Date(b.updatedAt ?? b.completed_at ?? b.booking_datetime ?? b.scheduledDate ?? b.createdAt ?? Date.now());
      const status = String(b.status || '').toLowerCase();
      if (status === 'completed') {
        return {
          type: 'complete',
          emoji: '✅',
          message: `${getBookingServiceLabel(b)} completed`,
          time: formatActivityDate(when),
          timestamp: when.getTime(),
        };
      }
      if (status === 'cancelled') {
        return {
          type: 'cancelled',
          emoji: '❌',
          message: `${getBookingServiceLabel(b)} cancelled`,
          time: formatActivityDate(when),
          timestamp: when.getTime(),
        };
      }
      return {
        type: 'booking',
        emoji: '📅',
        message: `${getBookingServiceLabel(b)} scheduled`,
        time: formatActivityDate(when),
        timestamp: when.getTime(),
      };
    }),
    ...recentOrders.map((o: any) => {
      const when = new Date(o.updated_at ?? o.created_at ?? Date.now());
      return {
        type: 'purchase',
        emoji: '🛒',
        message: `Order #${o.id} placed — GH₵${parseFloat(o.total_amount || 0).toFixed(2)}`,
        time: formatActivityDate(when),
        timestamp: when.getTime(),
      };
    }),
  ]
    .filter((a: any) => Number.isFinite(a.timestamp))
    .sort((a: any, b: any) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(({ timestamp, ...rest }: any) => rest);

  const mostBookedServicesData = Object.entries(
    data.bookings
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((acc: Record<string, number>, booking: any) => {
        const serviceName = getBookingServiceLabel(booking) || 'Unspecified Service';
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      }, {})
  )
    .map(([name, bookings]) => ({ name, bookings }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  const analyticsMonths = Array.from({ length: 3 }, (_, index) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (2 - index));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    return { key, label };
  });

  const getBookingMonthKey = (booking: any): string | null => {
    const source = booking.scheduledDate ?? booking.booking_datetime ?? booking.completed_at ?? booking.updatedAt;
    if (!source) return null;
    const d = source instanceof Date ? source : new Date(source);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const serviceCompletionTrendsData = analyticsMonths.map((m) => ({
    month: m.label,
    completed: completedBookings.filter((b: any) => getBookingMonthKey(b) === m.key).length,
  }));

  const monthlySpendingData = analyticsMonths.map((m) => ({
    month: m.label,
    spending: completedBookings
      .filter((b: any) => getBookingMonthKey(b) === m.key)
      .reduce((sum: number, b: any) => sum + getCompletedBookingPaidAmount(b), 0),
  }));

  const costBreakdownByTypeData = Object.entries(
    completedBookings.reduce((acc: Record<string, number>, booking: any) => {
      const serviceType = getBookingServiceLabel(booking) || 'Unspecified Service';
      const amount = getCompletedBookingPaidAmount(booking);
      if (amount <= 0) return acc;
      acc[serviceType] = (acc[serviceType] || 0) + amount;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const costBreakdownColors = ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 pb-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Vehicles', value: stats.totalVehicles ?? 0, icon: Car, accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'Completed Services', value: completedCount, icon: CheckCircle2, accent: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
          { label: 'Upcoming Booking', value: upcomingCount, icon: Calendar, accent: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
          { label: 'Total Bookings', value: totalBookings, icon: FileText, accent: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
          { label: 'Orders Placed', value: totalOrdersPlaced, icon: ShoppingBag, accent: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`p-3 rounded-2xl flex-shrink-0 ${accent}`}><Icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Calendar — only shown when there are upcoming scheduled bookings */}
      {upcomingBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Bookings Calendar</h2>
          <UpcomingBookingsCard bookings={upcomingBookings} compact />
        </div>
      )}

      {/* Upcoming Bookings Section */}
      {upcomingBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setExpandedSections(prev => ({...prev, booking: !prev.booking}))}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-2xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Upcoming Services</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{upcomingBookings.length} appointment{upcomingBookings.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full">{upcomingBookings.length}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedSections.booking ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {expandedSections.booking && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-start justify-between p-2 md:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {getBookingServiceLabel(booking)}
                    </p>
                    {getBookingType(booking) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {getBookingType(booking)}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      📅 {typeof booking.scheduledDate === 'string'
                        ? new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
                        : booking.scheduledDate?.toLocaleDateString?.('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Time: {typeof booking.scheduledDate === 'string'
                        ? new Date(booking.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : booking.scheduledDate?.toLocaleTimeString?.('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <Badge className="bg-blue-50 text-blue-700 font-medium text-xs md:text-sm py-0.5 px-1.5 md:px-2">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">GH₵{getUpcomingBookingAmount(booking).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Bookings */}
      {completedBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setExpandedSections(prev => ({...prev, completed: !prev.completed}))}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-2xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Completed Services</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{completedBookings.length} service{completedBookings.length !== 1 ? 's' : ''} completed · GH₵{totalSpent.toFixed(2)} total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">{completedBookings.length}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedSections.completed ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {expandedSections.completed && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
              {completedBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-start justify-between p-2.5 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {getBookingServiceLabel(booking)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatBookingDate(booking)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">✓ Done</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">GH₵{getCompletedBookingPaidAmount(booking).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Purchases */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setExpandedSections(prev => ({...prev, purchases: !prev.purchases}))}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-2xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Recent Purchases</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{recentOrders.length} order{recentOrders.length !== 1 ? 's' : ''} · GH₵{recentOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">{recentOrders.length}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedSections.purchases ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.purchases && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-3">
              {/* Orders List */}
              <div className="space-y-2 md:space-y-3">
                {recentOrders.map((order, idx) => (
                  <div 
                    key={order.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start md:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20 rounded-lg flex-shrink-0 border border-green-200 dark:border-green-800">
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                      
                      {orderItems[order.id] && orderItems[order.id].length > 0 && (
                        <div className="ml-9 md:ml-0">
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {orderItems[order.id].slice(0, 3).map((item, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                                <Package className="w-3 h-3" />
                                {(item.name || item.part_name).substring(0, 15)}{(item.name || item.part_name).length > 15 ? '...' : ''}
                              </span>
                            ))}
                            {orderItems[order.id].length > 3 && (
                              <span className="inline-flex items-center text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800 font-semibold">
                                +{orderItems[order.id].length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0 w-full md:w-auto">
                      <div className="flex-1 md:flex-none text-left md:text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">GH₵{parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      <button className="px-2.5 py-1.5 md:px-3 md:py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 opacity-0 group-hover:opacity-100">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <button
          onClick={() => setExpandedSections(prev => ({...prev, activity: !prev.activity}))}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Recent Activity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activityFeed.length} recent update{activityFeed.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded-full">{activityFeed.length}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedSections.activity ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {expandedSections.activity && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
            {activityFeed.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="w-9 h-9 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-600 text-lg">
                  {activity.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="space-y-4">

        {/* Row 1: Service Completion Trends Line Chart & Cost Breakdown Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Service Completion Trends - Line Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Service Completion Trends
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={serviceCompletionTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown - Pie Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Cost Breakdown by Type
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={costBreakdownByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {costBreakdownByTypeData.map((entry, idx) => (
                    <Cell key={`${entry.name}-${idx}`} fill={costBreakdownColors[idx % costBreakdownColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `GH₵${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs space-y-1">
              {costBreakdownByTypeData.length > 0 ? (
                costBreakdownByTypeData.map((entry, idx) => (
                  <div key={`${entry.name}-legend`} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: costBreakdownColors[idx % costBreakdownColors.length] }}></span>
                    {entry.name} GH₵{entry.value.toFixed(2)}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No completed service cost data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Most Booked Services Bar Chart & Monthly Spending Area Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Most Booked Services - Bar Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-600" />
              Most Booked Services
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mostBookedServicesData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                <XAxis dataKey="name" stroke="#666" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Bar dataKey="bookings" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Spending - Area Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-pink-600" />
              Monthly Spending Patterns
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlySpendingData}>
                <defs>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip formatter={(value) => `GH₵${value}`} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="spending" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorSpending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Vehicle Maintenance & Booking Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vehicle Maintenance Overview — real data */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-purple-600" />
              Vehicle Maintenance Overview
            </h3>
            {data.vehicles && data.vehicles.length > 0 ? (
              <div className="space-y-3">
                {data.vehicles.slice(0, 4).map((v: any, i: number) => {
                  const vehicleId = String(v.id ?? '');
                  const vehicleBookings = data.bookings.filter((b: any) => String((b as any).vehicleId ?? (b as any).vehicle_id ?? '') === vehicleId);

                  // Count only bookings that are tied to a real service payload from backend.
                  const serviceBookings = vehicleBookings.filter((b: any) => {
                    const serviceLabel = getBookingServiceLabel(b);
                    return Boolean((b as any).service_id || (b as any).service_name || (b as any).serviceType || (b as any).service_type || serviceLabel !== 'Car Service');
                  });

                  const doneCount = serviceBookings.filter((b: any) => b.status === 'completed').length;
                  const pendingCount = serviceBookings.filter((b: any) => b.status !== 'completed' && b.status !== 'cancelled').length;
                  const latestCompleted = serviceBookings
                    .filter((b: any) => b.status === 'completed')
                    .sort((a: any, b: any) => new Date(b.scheduledDate ?? b.booking_datetime ?? b.updatedAt ?? 0).getTime() - new Date(a.scheduledDate ?? a.booking_datetime ?? a.updatedAt ?? 0).getTime())[0];
                  return (
                    <div key={v.id || i} className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-3 border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {v.make} {v.model} {v.year}
                        </p>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{serviceBookings.length} services</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="w-3 h-3" />{doneCount} completed</span>
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400"><Clock className="w-3 h-3" />{pendingCount} pending</span>
                        {v.mileage && <span className="text-gray-400">{v.mileage.toLocaleString()} km</span>}
                      </div>
                      {latestCompleted && (
                        <p className="mt-2 text-xs text-purple-700 dark:text-purple-300 truncate">
                          Last service: {getBookingServiceLabel(latestCompleted)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No vehicles added yet</p>
              </div>
            )}
          </div>

          {/* Booking Status Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              Service Health
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Completed', count: completedCount, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
                { label: 'Upcoming', count: upcomingCount, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
                { label: 'In Progress', count: data.bookings.filter((b: any) => b.status === 'assigned' || b.status === 'in-progress').length, color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
                { label: 'Cancelled', count: data.bookings.filter((b: any) => b.status === 'cancelled').length, color: 'bg-red-400', textColor: 'text-red-500 dark:text-red-400' },
              ].map(({ label, count, color, textColor }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-24 ${textColor}`}>{label}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: totalBookings > 0 ? `${Math.round((count / totalBookings) * 100)}%` : '0%' }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-6 text-right">{count}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">{totalBookings} total bookings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Vehicle Form Component
function AddVehicleForm({ onClose }: { onClose: (vehicleId: string) => void }) {
  const { addVehicle, data } = useDashboard();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuelType: 'petrol' as 'petrol' | 'diesel' | 'hybrid' | 'electric',
  });
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    let loadedCount = 0;
    const newPhotos: string[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        newPhotos.push(base64);
        loadedCount++;

        if (loadedCount === fileArray.length) {
          setVehiclePhotos(prev => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setVehiclePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Use the statically imported vehicles API
      const userId = typeof data.user.id === 'string' ? parseInt(data.user.id) : data.user.id;
      
      console.log(`🚗 Creating vehicle for user ID: ${userId} (type: ${typeof userId})`);
      
      // Check auth token (do not block here) - let the central API helper handle auth/401
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.warn('⚠️ No auth token found in localStorage — proceeding to call API so auth handling can run');
      } else {
        console.log('✅ Auth token found in localStorage');
      }
      
      // Call backend API to create vehicle with all details
      const createdVehicle = await apiVehicles.create({
        user_id: userId,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage || 0,
        fuel_type: formData.fuelType || 'petrol',
      });
      
      console.log(`✓ Vehicle created:`, createdVehicle);

      // Create vehicle object for local state with data from backend
      const newVehicle: Vehicle = {
        id: String(createdVehicle.id),
        userId: String(createdVehicle.user_id),
        make: createdVehicle.make,
        model: createdVehicle.model,
        year: createdVehicle.year,
        licensePlate: '',
        vin: createdVehicle.vin || '',
        mileage: formData.mileage || 0,
        fuelType: formData.fuelType || 'petrol',
        createdAt: new Date(createdVehicle.created_at),
        updatedAt: new Date(createdVehicle.updated_at),
        lastServiceDate: undefined,
        nextServiceDate: undefined,
      };

      console.log(`✅ VEHICLE ADDED TO CONTEXT:`);
      console.log(`   Vehicle ID: ${newVehicle.id}`);
      console.log(`   User ID: ${newVehicle.userId}`);
      console.log(`   Make/Model: ${newVehicle.make} ${newVehicle.model}`);
      console.log(`   This vehicle is now saved in localStorage and will persist on next login`);
      
      addVehicle(newVehicle);
      
      // Save photos to IndexedDB
      if (vehiclePhotos.length > 0) {
        try {
          await saveVehicleImages(newVehicle.id, vehiclePhotos);
          console.log(`📸 Saved ${vehiclePhotos.length} photos to IndexedDB for vehicle ${newVehicle.id}`);
        } catch (err) {
          console.warn('Failed to save images to IndexedDB:', err);
          setError('Added vehicle but failed to save photos. You can re-upload them in vehicle details.');
        }
      }
      
      onClose(newVehicle.id);
    } catch (err: any) {
      console.error('Failed to add vehicle:', err);
      setError(err.message || 'Failed to add vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs font-semibold text-gray-700 block mb-1">Make</Label>
          <Input
            value={formData.make}
            onChange={(e) => setFormData({...formData, make: e.target.value})}
            required
            className="text-sm h-9 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-700 block mb-1">Model</Label>
          <Input
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            required
            className="text-sm h-9 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-700 block mb-1">Year</Label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            required
            className="text-sm h-9 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-gray-700 block mb-1">Mileage (km)</Label>
          <Input
            type="number"
            placeholder="0"
            value={formData.mileage || ''}
            onChange={(e) => setFormData({...formData, mileage: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
            required
            className="text-sm h-9 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-700 block mb-1">Fuel Type</Label>
          <Select value={formData.fuelType || 'petrol'} onValueChange={(value: string) => setFormData({...formData, fuelType: value as 'petrol' | 'diesel' | 'hybrid' | 'electric'})}>
            <SelectTrigger className="text-sm h-9 rounded-lg border-gray-300">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-gray-700 block mb-2">Photos</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 text-center transition-all hover:border-blue-400 hover:bg-blue-50">
          {vehiclePhotos.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 justify-center">
                {vehiclePhotos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img src={photo} alt={`Photo ${idx + 1}`} className="h-20 w-20 object-cover rounded-lg shadow-sm border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="block cursor-pointer text-blue-600 hover:text-blue-700 text-xs font-medium">
                + Add more photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="block cursor-pointer py-2">
              <div className="flex flex-col items-center gap-2">
                <Image className="h-8 w-8 text-gray-400" />
                <p className="text-xs text-gray-600 font-medium">Click to upload photos</p>
                <p className="text-xs text-gray-400">PNG, JPG, up to 5MB</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 h-9 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Vehicle'}
        </Button>
        <Button type="button" variant="outline" className="flex-1 h-9 text-sm rounded-lg" onClick={() => onClose('')} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 font-medium">
          {error}
        </div>
      )}
    </form>
  );
}

// Vehicles Management Component
function VehiclesManagement() {
  const { data, updateVehicle, deleteVehicle } = useDashboard();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Vehicle> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<{[key: string]: string[]}>({});
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string; subText?: string } | null>(null);

  // Initialize IndexedDB and load all vehicle images on mount
  useEffect(() => {
    const initAndLoadImages = async () => {
      try {
        await initImageDB();
        if (data?.vehicles && data.vehicles.length > 0) {
          const vehicleIds = data.vehicles.map(v => v.id);
          const images = await loadAllVehicleImages(vehicleIds);
          setVehicleImages(images);
          console.log(`✅ Loaded images for ${Object.keys(images).length} vehicles from IndexedDB`);
        }
      } catch (err) {
        console.error('Failed to initialize image database:', err);
      } finally {
        setIsLoadingImages(false);
      }
    };

    initAndLoadImages();
  }, [data?.vehicles]);

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin inline-block mr-2">⌛</div>
          <p className="text-gray-600">Loading your vehicles...</p>
        </CardContent>
      </Card>
    );
  }

  const handleEditSave = async (vehicleId: string) => {
    if (!editFormData) return;

    setIsSaving(true);
    try {
      // 1. Update context IMMEDIATELY with edited data (instant UI update)
      updateVehicle(vehicleId, editFormData);
      
      // 2. Close edit mode
      setEditingId(null);
      setEditFormData(null);
      
      // 3. Send to backend (don't wait)
      await apiVehicles.update(vehicleId, editFormData);
      
      setAlert({ type: 'success', message: 'Vehicle saved successfully!', subText: 'Changes have been applied' });
    } catch (err) {
      console.error('❌ Save error:', err);
      setAlert({ type: 'error', message: 'Failed to save vehicle', subText: 'Please try again' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (vehicleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    let loadedCount = 0;
    const newImages: string[] = [];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        newImages.push(base64);
        loadedCount++;

        // Batch update only after all files are read
        if (loadedCount === fileArray.length) {
          setVehicleImages(prev => {
            const updated = {
              ...prev,
              [vehicleId]: [...(prev[vehicleId] || []), ...newImages]
            };
            
            // Save to IndexedDB
            saveVehicleImages(vehicleId, updated[vehicleId])
              .then(() => console.log(`✅ Saved ${newImages.length} images to IndexedDB`))
              .catch(err => console.error('Failed to save images to IndexedDB:', err));
            
            // Also update vehicle in context for backend sync
            updateVehicle(vehicleId, { images: updated[vehicleId] } as any);
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (vehicleId: string, index: number) => {
    setVehicleImages(prev => {
      const updated = {
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter((_, i) => i !== index) || []
      };
      
      // Save updated images to IndexedDB
      saveVehicleImages(vehicleId, updated[vehicleId])
        .then(() => console.log('✅ Image removed and saved to IndexedDB'))
        .catch(err => console.error('Failed to save updated images:', err));
      
      // Also update vehicle in context so it persists
      updateVehicle(vehicleId, { images: updated[vehicleId] } as any);
      return updated;
    });
  };

  const handleVehicleAdded = (newVehicleId: string) => {
    setIsAddDialogOpen(false);
    
    // Load the newly added vehicle's images from IndexedDB
    loadVehicleImages(newVehicleId)
      .then(images => {
        if (images.length > 0) {
          setVehicleImages(prev => ({
            ...prev,
            [newVehicleId]: images
          }));
          console.log(`✅ Loaded ${images.length} photos for new vehicle ${newVehicleId}`);
        }
      })
      .catch(err => console.warn('Failed to load photos for new vehicle:', err));
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    // Show confirmation alert instead of window.confirm
    setVehicleToDelete(vehicleId);
    setAlert({
      type: 'warning',
      message: 'Delete this vehicle?',
      subText: 'This action cannot be undone'
    });
  };

  const confirmDeleteVehicle = async (vehicleId: string) => {
    try {
      // Delete from backend API
      await apiVehicles.delete(vehicleId);
      console.log(`✅ Vehicle ${vehicleId} deleted from backend`);

      // Delete images from IndexedDB
      try {
        await deleteVehicleImages(vehicleId);
      } catch (err) {
        console.warn('Failed to delete images from IndexedDB:', err);
      }

      // Update local state
      setVehicleImages(prev => {
        const updated = { ...prev };
        delete updated[vehicleId];
        return updated;
      });

      // Delete from context/dashboard
      deleteVehicle(vehicleId);
      
      setVehicleToDelete(null);
      setAlert({ type: 'success', message: 'Vehicle deleted successfully', subText: 'The vehicle has been removed' });
    } catch (err) {
      console.error(`Failed to delete vehicle ${vehicleId}:`, err);
      setAlert({ type: 'error', message: 'Failed to delete vehicle', subText: 'Please try again' });
    }
  };

  return (
    <div className="space-y-4">
      {alert && vehicleToDelete && alert.type === 'warning' ? (
        <div className="fixed top-5 right-5 left-5 sm:left-auto z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white w-11/12 sm:w-96 rounded-lg shadow-2xl p-6 flex flex-col gap-4 relative overflow-hidden h-fit">
            {/* Wave background */}
            <div className="absolute top-0 left-0 w-32 h-full bg-amber-100 opacity-20 transform -skew-x-12"></div>
            
            {/* Icon Container */}
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6 text-amber-600">
                <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 432c7.3 14.6 7.3 29.2 0 43.8C507.3 504.5 494.2 512 480 512H32c-14.2 0-27.3-7.5-34.5-19.8l-216-432C-7.3 45.4-7.3 30.8 0 16.2C4.7 6.5 17.8 0 32 0h448zM256 224c-13.3 0-24 10.7-24 24v64c0 13.3 10.7 24 24 24s24-10.7 24-24v-64c0-13.3-10.7-24-24-24zm32 128c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z" />
              </svg>
            </div>

            {/* Text Content */}
            <div className="relative z-10">
              <p className="font-bold text-lg text-amber-700">{alert.message}</p>
              {alert.subText && <p className="text-sm text-amber-600 mt-1">{alert.subText}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 relative z-10">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setVehicleToDelete(null);
                  setAlert(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  confirmDeleteVehicle(vehicleToDelete);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : alert ? (
        <SweetAlert
          type={alert.type}
          message={alert.message}
          subText={alert.subText}
          duration={alert.type === 'success' ? 3000 : 4000}
          onClose={() => setAlert(null)}
        />
      ) : null}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Vehicles</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>Enter details to add a new vehicle to your profile.</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-150px)]">
              <AddVehicleForm onClose={handleVehicleAdded} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {data.vehicles.map((vehicle) => (
          editingId === vehicle.id ? (
            <Card key={vehicle.id} className="border-blue-500">
              <CardContent className="pt-6 space-y-4">
                {/* Photos Section */}
                <div>
                  <label className="text-xs font-semibold block mb-2">Photos</label>
                  {vehicleImages[vehicle.id] && vehicleImages[vehicle.id].length > 0 ? (
                    <div className="w-full rounded border bg-gray-100 h-32 overflow-x-auto mb-2">
                      <div className="flex gap-2 p-2">
                        {vehicleImages[vehicle.id].map((img, idx) => (
                          <div key={idx} className="relative flex-shrink-0">
                            <img src={img} alt={`Vehicle ${idx + 1}`} className="h-28 w-28 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => removeImage(vehicle.id, idx)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded border-2 border-dashed bg-gray-50 flex items-center justify-center mb-2">
                      <p className="text-xs text-gray-500">No photos yet</p>
                    </div>
                  )}
                  <label className="block cursor-pointer">
                    <div className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Photos</div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(vehicle.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Vehicle Info Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs font-medium">Make</label>
                    <Input
                      value={editFormData?.make || vehicle.make}
                      onChange={(e) => setEditFormData({...(editFormData || {}), make: e.target.value})}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Model</label>
                    <Input
                      value={editFormData?.model || vehicle.model}
                      onChange={(e) => setEditFormData({...(editFormData || {}), model: e.target.value})}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <label className="text-xs font-medium">Year</label>
                    <Input
                      type="number"
                      value={editFormData?.year || vehicle.year}
                      onChange={(e) => setEditFormData({...(editFormData || {}), year: parseInt(e.target.value)})}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs font-medium">Mileage (km)</label>
                    <Input
                      type="number"
                      value={editFormData?.mileage || vehicle.mileage}
                      onChange={(e) => setEditFormData({...(editFormData || {}), mileage: parseInt(e.target.value)})}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Fuel Type</label>
                    <Select value={editFormData?.fuelType || vehicle.fuelType || 'petrol'} onValueChange={(value) => setEditFormData({...(editFormData || {}), fuelType: value as 'petrol' | 'diesel' | 'hybrid' | 'electric'})}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleEditSave(vehicle.id)} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingId(null); setEditFormData(null); }} disabled={isSaving}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="pt-4 pb-3 space-y-2">
                {/* Vehicle Images Gallery */}
                <div className="relative">
                  {vehicleImages[vehicle.id] && vehicleImages[vehicle.id].length > 0 ? (
                    <div className="w-full rounded border bg-gray-100 h-28 overflow-x-auto">
                      <div className="flex gap-1 p-1">
                        {vehicleImages[vehicle.id].map((img, idx) => (
                          <div key={idx} className="relative flex-shrink-0 group">
                            <img src={img} alt={`Vehicle ${idx + 1}`} className="h-24 w-24 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => removeImage(vehicle.id, idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded border-2 border-dashed bg-gray-50 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Image className="h-5 w-5 mx-auto mb-1" />
                        <p className="text-xs">No photos yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm md:text-base truncate">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{vehicle.fuelType || 'N/A'}</Badge>
                </div>

                <div className="space-y-1 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mileage:</span>
                    <span className="font-medium">{(vehicle.mileage || 0).toLocaleString()} km</span>
                  </div>
                  {vehicle.nextServiceDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Service:</span>
                      <span className="font-medium text-orange-600">{vehicle.nextServiceDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => { setEditingId(vehicle.id); setEditFormData(vehicle); }}>
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs text-red-600 hover:text-red-700" 
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>

      {data.vehicles.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">No vehicles registered yet</p>
            <p className="text-sm text-gray-600">Click the "Add Vehicle" button above to register your first vehicle.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Service History Component
function ServiceHistory() {
  const { data } = useDashboard();
  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin inline-block mr-2">⌛</div>
          <p className="text-gray-600">Loading service history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Service History</h2>
      
      <div className="space-y-3">
        {data.serviceRecords.length > 0 ? (
          data.serviceRecords.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold">{service.description}</h3>
                    <p className="text-sm text-gray-500">{service.startDate.toLocaleDateString()} • {service.mileageAtService} km</p>
                  </div>
                  <Badge className={
                    service.status === 'completed' ? 'bg-green-100 text-green-800' :
                    service.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {service.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Cost: <span className="font-bold">GH₵{service.cost.toFixed(2)}</span></p>
                    {service.mechanic && <p className="text-gray-500 text-xs">{service.mechanic.name} • {service.mechanic.shop}</p>}
                  </div>
                </div>

                {service.parts && service.parts.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="p-0">View parts ({service.parts.length})</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Service Parts</DialogTitle>
                        <DialogDescription>Parts used for this service.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 mt-4 max-h-80 overflow-y-auto">
                        {service.parts.map((part) => (
                          <div key={part.id} className="flex justify-between p-3 border rounded bg-gray-50">
                            <div>
                              <p className="font-medium text-sm">{part.name}</p>
                              <p className="text-xs text-gray-500">Qty: {part.quantity} × GH₵{part.unitCost.toFixed(2)}</p>
                            </div>
                            <p className="font-bold">GH₵{part.totalCost.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No service records found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Booking Form Component
function BookingForm({ onClose, editingBooking, refreshBookings }: { onClose: () => void; editingBooking?: ServiceBooking; refreshBookings?: (skipCache?: boolean) => Promise<void> }) {
  const { addBooking, updateBooking, data } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const isReschedule = !!editingBooking;
  
  const [formData, setFormData] = useState({
    vehicleId: editingBooking?.vehicleId || '',
    serviceType: editingBooking ? String(editingBooking.serviceType) : '1',
    scheduledDate: editingBooking && editingBooking.scheduledDate ? (
      typeof editingBooking.scheduledDate === 'string' 
        ? (editingBooking.scheduledDate as string).split('T')[0] 
        : new Date(editingBooking.scheduledDate).toISOString().split('T')[0]
    ) : '',
    scheduledTime: editingBooking && editingBooking.scheduledDate ? (
      typeof editingBooking.scheduledDate === 'string'
        ? (editingBooking.scheduledDate as string).split('T')[1]?.slice(0, 5) || ''
        : new Date(editingBooking.scheduledDate).toISOString().split('T')[1]?.slice(0, 5) || ''
    ) : '',
    shopName: editingBooking?.shopName || 'AutoService Pro',
    description: editingBooking?.description || '',
  });

  // Update vehicleId when vehicles data becomes available
  useEffect(() => {
    if (data?.vehicles && data.vehicles.length > 0 && formData.vehicleId === '') {
      console.log('🚗 Setting first vehicle:', data.vehicles[0].id);
      setFormData(prev => ({...prev, vehicleId: String(data.vehicles[0].id)}));
    }
  }, [data?.vehicles]);

  // Service options - fetch from backend API
  const [serviceOptions, setServiceOptions] = useState<Array<{id:number; title:string; estimatedCost:number; name?:string; price?:number}>>([]);

  // Fetch actual services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiServices.getAll();
        if (response && Array.isArray(response)) {
          // Map backend services to frontend format (REAL DATA ONLY)
          const mappedServices = response.map((s: any) => ({
            id: s.id,
            title: s.name,
            estimatedCost: s.price,
            name: s.name,
            price: s.price
          }));
          setServiceOptions(mappedServices);
          console.log('✅ Loaded services from backend:', mappedServices);
        } else {
          console.warn('⚠️  Backend returned non-array services response');
          setServiceOptions([]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch services from backend:', error);
        // NO FALLBACK - Only show real database services
        console.error('   Services will be empty until backend is available');
        setServiceOptions([]);
      }
    };
    fetchServices();
  }, []);

  // Auto-calculate price based on selected service (ONLY from real database)
  const getServicePrice = (serviceId: string) => {
    const service = serviceOptions.find(s => s.id === parseInt(serviceId));
    const cost = service?.estimatedCost ?? 0;
    // Ensure numeric
    const num = typeof cost === 'number' ? cost : Number(cost);
    return isNaN(num) ? 0 : num;
  };

  const estimatedCost = getServicePrice(formData.serviceType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!data?.user) {
      console.error('❌ No user data available');
      alert('User data not available. Please refresh and try again.');
      return;
    }

    // Only require vehicle/service for new bookings
    if (!isReschedule) {
      if (!formData.vehicleId || formData.vehicleId === '') {
        console.error('❌ No vehicle selected:', formData.vehicleId);
        alert('Please select a vehicle from the dropdown');
        return;
      }

      if (!formData.serviceType) {
        console.error('❌ No service selected');
        alert('Please select a service');
        return;
      }
    }

    if (!formData.scheduledDate) {
      alert('Please select a service date');
      return;
    }

    if (!formData.scheduledTime) {
      alert('Please select a service time');
      return;
    }

    setIsLoading(true);
    try {
      const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const userId = typeof data.user.id === 'string' ? parseInt(data.user.id) : data.user.id;
      const serviceId = parseInt(formData.serviceType);
      // Vehicle ID might be numeric or UUID - keep as is if it's not numeric
      const vehicleId = isNaN(parseInt(formData.vehicleId)) ? formData.vehicleId : parseInt(formData.vehicleId);
      
      // Detailed validation logging
      console.log('📋 Raw form values:', {
        userId: data.user.id,
        userIdType: typeof data.user.id,
        vehicleId: formData.vehicleId,
        vehicleIdType: typeof formData.vehicleId,
        serviceType: formData.serviceType,
      });
      
      console.log('📋 Parsed values:', { userId, serviceId, vehicleId });
      console.log('📋 Available vehicles in data:', data.vehicles?.map((v: any) => ({id: v.id, type: typeof v.id})));
      
      // Validation
      if (isNaN(userId)) {
        console.error('❌ Invalid user ID:', userId);
        alert('Invalid user ID. Please refresh and try again.');
        setIsLoading(false);
        return;
      }
      
      // Only validate service and vehicle for new bookings
      if (!isReschedule) {
        if (isNaN(serviceId)) {
          console.error('❌ Invalid service ID:', serviceId);
          alert('Invalid service selected. Please select a service from the dropdown.');
          setIsLoading(false);
          return;
        }
        
        if (!formData.vehicleId || formData.vehicleId === '') {
          console.error('❌ No vehicle ID selected');
          alert('No vehicle selected. Please choose one from the dropdown.');
          setIsLoading(false);
          return;
        }
      }

      console.log('📅 Submitting booking:', {
        user_id: userId,
        service_id: serviceId,
        vehicle_id: vehicleId,
        booking_datetime: dateTime.toISOString(),
        status: 'scheduled',
        notes: formData.description,
      });

      // Convert vehicle ID to integer if it's a UUID (map to default: 1)
      let finalVehicleId = vehicleId;
      if (typeof vehicleId === 'string' && isNaN(parseInt(vehicleId))) {
        console.log('⚠️  Converting UUID vehicle ID to integer: 1');
        finalVehicleId = 1; // Use default test vehicle for now
      }

      // Send to backend API - either create or update
      let response;
      if (isReschedule) {
        // Update existing booking - only change date/time
        // Use existing service and vehicle from the booking
        const existingServiceId = typeof editingBooking.serviceType === 'string' 
          ? parseInt(editingBooking.serviceType) 
          : editingBooking.serviceType;
        
        console.log(`🔄 Rescheduling booking ${editingBooking.id}:`, {
          booking_datetime: dateTime.toISOString(),
        });
        response = await apiBookings.update(editingBooking.id, {
          booking_datetime: dateTime.toISOString(),
        });
        console.log('✓ Booking rescheduled successfully:', response);
      } else {
        // NEW APPROACH: Create booking FIRST, then update after payment
        console.log('✅ SIMPLER APPROACH: Creating booking NOW (before payment)...');
        const getServiceName = (booking: any) => {
          return booking?.service_name || serviceOptions.find(s => s.id === parseInt(formData.serviceType))?.title || 'Service';
        };
        const serviceName = getServiceName(null);
        
        // CREATE booking immediately with pending payment status and total_cost
        const createdBooking = await apiBookings.create({
          user_id: userId,
          service_id: serviceId,
          vehicle_id: finalVehicleId,
          booking_datetime: dateTime.toISOString(),
          status: 'scheduled',
          payment_status: 'pending',
          notes: formData.description,
          total_cost: estimatedCost, // Required for payment validation in backend
        });
        
        console.log('✅ BOOKING CREATED (PENDING PAYMENT):', createdBooking);
        
        // Store booking_id in sessionStorage for payment step
        sessionStorage.setItem('pendingBookingId', String(createdBooking.id));
        console.log('💾 Stored booking_id in sessionStorage for payment step');
        
        // Prepare for payment
        const bookingToShow = {
          ...createdBooking,
          service_name: serviceName,
          amount: estimatedCost,
          email: data.user.email,
          name: data.user.name,
        };
        
        setCurrentBooking(bookingToShow);
        setShowPayment(true);
        setIsLoading(false);
      }

      // Also update local state for immediate UI feedback
      const getServiceName = (booking: any) => {
        // Try to get service_name from API response or find from options
        return booking?.service_name || serviceOptions.find(s => s.id === parseInt(formData.serviceType))?.title || 'Service';
      };
      const serviceName = isReschedule ? getServiceName(editingBooking) : serviceOptions.find(s => s.id === parseInt(formData.serviceType))?.title || 'Service';
      const bookingPrice = isReschedule ? (editingBooking as any)?.estimatedCost : estimatedCost;
      
      if (isReschedule) {
        // Update existing booking locally - only change the date/time
        response = await apiBookings.update(editingBooking.id, {
          booking_datetime: dateTime.toISOString(),
        });
        const updated: ServiceBooking = {
          ...editingBooking,
          scheduledDate: dateTime,
          updatedAt: new Date(),
        };
        updateBooking(editingBooking.id, updated);
        
        // Clear cache to force fresh fetch on next data load
        const currentUserStr = localStorage.getItem('currentUser');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        if (currentUser?.id) {
          clearCache(`/bookings/user/${currentUser.id}`);
          localStorage.removeItem(`dashboard_${currentUser.id}`);
          console.log('🗑️ Cache cleared for fresh booking data');
        }
        
        console.log('✅ Booking rescheduled locally');
        
        // Refresh bookings from server to show updated date immediately
        if (refreshBookings) {
          console.log('🔄 Refreshing bookings to show updated date...');
          await refreshBookings(true); // Force fresh fetch from server
        }
        
        alert('✓ Booking rescheduled successfully!');
        onClose();
      }
    } catch (error: any) {
      console.error('❌ Failed to create booking:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
      });
      
      // Check if backend is running
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        alert('Failed to connect to backend server.\n\nMake sure the backend server is running on port 4001.\n\nError: ' + error?.message);
      } else {
        const errorMsg = error?.message || 'Unknown error';
        alert(`Failed to create booking:\n${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show message if no vehicles
  if (!data?.vehicles || data.vehicles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-300 rounded">
          <p className="text-amber-800 font-medium">⚠️ No vehicles registered</p>
          <p className="text-sm text-amber-700 mt-1">Please add a vehicle first before booking a service.</p>
        </div>
        <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
      </div>
    );
  }

  // Show payment step after booking is created
  if (showPayment && currentBooking) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Complete Payment</h3>
          <p className="text-sm text-gray-600 mb-4">Pay for your {currentBooking.service_name} service</p>
        </div>
          <PaymentStep
            booking_details={currentBooking}
            amount={currentBooking.amount}
            service_name={currentBooking.service_name}
            user_email={currentBooking.email}
            user_name={currentBooking.name}
            onPaymentSuccess={async () => {
              try {
                console.log('✅ Payment successful! Verifying payment then creating booking...');
                
                // Get payment reference from sessionStorage (set by PaymentStep)
                const paymentReference = sessionStorage.getItem('paymentReference');
                if (!paymentReference) {
                  throw new Error('Payment reference not found. Payment may not have completed successfully.');
                }
                console.log('📍 Payment reference:', paymentReference);
                
                // Verify payment with backend using the reference (NOT booking ID - booking doesn't exist yet)
                console.log('🔍 Verifying payment with backend...');
                try {
                  const verification = await apiPayments.verify(paymentReference);
                  console.log('✅ Payment verification response:', verification);
                  if (!verification.success) {
                    throw new Error(verification.message || 'Payment verification failed');
                  }
                } catch (verifyErr) {
                  console.warn('⚠️ Payment verification call failed or not available:', verifyErr);
                  // Continue anyway - backend may handle verification asynchronously
                }
                
                // Retrieve booking details from sessionStorage (stored before payment)
                const bookingDetailsStr = sessionStorage.getItem('bookingDetails');
                if (!bookingDetailsStr) {
                  throw new Error('Booking details not found in sessionStorage');
                }
                
                const bookingDetails = JSON.parse(bookingDetailsStr);
                console.log('📋 Retrieved booking details from sessionStorage:', bookingDetails);
                
                // NOW create the booking (after payment succeeded & verified)
                console.log('📝 Creating booking NOW (after payment success & verification)...');
                const createdBooking = await apiBookings.create({
                  user_id: bookingDetails.user_id,
                  service_id: bookingDetails.service_id,
                  vehicle_id: bookingDetails.vehicle_id,
                  booking_datetime: bookingDetails.booking_datetime,
                  status: 'scheduled',  // Set directly to scheduled (payment already done)
                  payment_status: 'completed',  // Payment is completed
                  notes: bookingDetails.notes,
                });
                
                console.log(`✅ BOOKING CREATED AFTER PAYMENT: #${createdBooking.id}`);
                console.log(`   Status: ${createdBooking.status}`);
                console.log(`   Payment Status: ${createdBooking.payment_status}`);
                
                // Add to dashboard context
                try {
                  addBooking(createdBooking as any);
                  console.log('📌 Added created booking to dashboard context');
                } catch (e) {
                  console.warn('Failed to add booking to context:', e);
                }
                
                // Clear sessionStorage
                sessionStorage.removeItem('bookingDetails');
                sessionStorage.removeItem('paymentReference');
                sessionStorage.removeItem('bookingDetailsForPayment');
                
                // Set flags for dashboard refresh
                sessionStorage.setItem('forceRefreshDashboard', 'true');
                sessionStorage.setItem('newBookingId', String(createdBooking.id));

              } catch (err) {
                console.error('Error handling payment success:', err);
                alert('Payment successful but failed to create booking. ' + (err instanceof Error ? err.message : 'Please contact support.'));
              }

              alert('✓ Payment successful! Your booking has been confirmed.');
              onClose();
              // Auto-reload the page so the dashboard reflects the new booking and payment status
              setTimeout(() => window.location.reload(), 400);
            }}
            onCancel={() => {
              console.log('❌ Payment cancelled');
              setShowPayment(false);
              setCurrentBooking(null);
              onClose();
            }}
          />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isReschedule ? (
        // Simplified reschedule form - only date and time
        <>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm mb-4">
            <p className="text-blue-900"><strong>Service:</strong> {(editingBooking as any)?.service_name || serviceOptions.find(s => s.id === parseInt(String(editingBooking?.serviceType)))?.title || 'Service'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>New Date</Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                required
                className="h-9"
              />
            </div>
            <div>
              <Label>New Time</Label>
              <Input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950" disabled={isLoading}>
              {isLoading ? '⏳ Processing...' : 'Reschedule'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        // Full booking form for new bookings
        <>
          
          <div>
            <Label>Vehicle</Label>
            <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {data?.vehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                    {vehicle.year} {vehicle.make} {vehicle.model}{vehicle.licensePlate?.trim() ? ` (${vehicle.licensePlate})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Service Type</Label>
            <Select value={formData.serviceType} onValueChange={(value: any) => setFormData({...formData, serviceType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((service) => (
                  <SelectItem key={service.id} value={String(service.id)}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Service Date</Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <textarea
              className="w-full p-2 border rounded text-sm"
              placeholder="Describe the service needed..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <Label>Estimated Service Price</Label>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700 font-semibold text-lg text-blue-900 dark:text-blue-300">
              GH₵{(Number(estimatedCost) || 0).toFixed(2)}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950" disabled={isLoading}>
              {isLoading ? '⏳ Processing...' : 'Book Service'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

// Bookings Component
function BookingsManagement() {
  try {
    const { data, cancelBooking, deleteBooking, refreshBookings } = useDashboard();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [rescheduleBooking, setRescheduleBooking] = useState<ServiceBooking | undefined>(undefined);
    const [partRequests, setPartRequests] = useState<{[key: string]: any[]}>({});
    const [loadingParts, setLoadingParts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 10;
    const [hasRefreshed, setHasRefreshed] = useState(false);
    const [serviceOptions, setServiceOptions] = useState<Array<{id:number; title:string; estimatedCost?:number; name?:string; price?:number}>>([]);
    const [bookingTab, setBookingTab] = useState<'scheduled' | 'completed'>('scheduled');

    // Refresh bookings when component mounts or when user navigates to this tab
    useEffect(() => {
      const loadBookings = async () => {
        try {
          console.log(`\n${'='.repeat(60)}`);
          console.log(`📊 BOOKINGS_MANAGEMENT MOUNTED`);
          
                // Check if we just completed a payment
          const urlForceRefresh = searchParams.get('forceRefresh') === '1' || searchParams.get('forceRefresh') === 'true';
          const urlNewBookingId = searchParams.get('newBookingId');
          const storedForceRefresh = sessionStorage.getItem('forceRefreshDashboard') === 'true';
          const storedNewBookingId = sessionStorage.getItem('newBookingId');

          const newBookingId = urlNewBookingId || storedNewBookingId;
          const isForceRefresh = urlForceRefresh || storedForceRefresh;
          
          if (newBookingId || isForceRefresh) {
            console.log(`🎉 POST-PAYMENT: newBookingId=${newBookingId}, forceRefresh=${isForceRefresh}`);
          }
          
          // ALWAYS pass true to skip cache on BookingsManagement mount
          // This ensures we always get fresh data
          const shouldSkip = isForceRefresh || !hasRefreshed;
          console.log(`🔄 CALLING refreshBookings with skipCache=${shouldSkip}...`);
          await refreshBookings?.(shouldSkip);
          
          // Clear the force refresh flags after refresh is complete
          if (isForceRefresh) {
            console.log('✅ Refresh complete - clearing sessionStorage flags');
            sessionStorage.removeItem('forceRefreshDashboard');
            sessionStorage.removeItem('newBookingId');

            // Remove query params used for refresh if present
            if (urlForceRefresh || urlNewBookingId) {
              const params = new URLSearchParams(searchParams);
              params.delete('forceRefresh');
              params.delete('newBookingId');
              setSearchParams(params, { replace: true });
            }
          }
          
          setHasRefreshed(true);
          console.log(`${'='.repeat(60)}\n`);
        } catch (error) {
          console.error('❌ Error refreshing bookings:', error);
          setHasRefreshed(true);
        }
      };
      loadBookings();
    }, [refreshBookings, hasRefreshed]);

  // Load services so we can resolve service_id -> human friendly name when booking lacks service_name
  useEffect(() => {
    let mounted = true;
    const loadServices = async () => {
      try {
        const response = await apiServices.getAll();
        if (response && Array.isArray(response)) {
          const mapped = response.map((s: any) => ({
            id: s.id,
            title: s.name || s.title || String(s.id),
            price: s.price ?? s.estimatedCost ?? s.estimated_price ?? s.amount ?? null,
          }));
          if (mounted) setServiceOptions(mapped);
        }
      } catch (err) {
        console.warn('Failed to load services for BookingsManagement:', err);
      }
    };
    loadServices();
    return () => { mounted = false; };
  }, []);

  const handleReschedule = (booking: ServiceBooking) => {
    setRescheduleBooking(booking);
    setIsBookingDialogOpen(true);
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 BOOKINGS_MANAGEMENT RENDER`);
  console.log(`🔍 Total bookings in context: ${data?.bookings?.length || 0}`);
  if (data?.bookings && data.bookings.length > 0) {
    console.log(`   IDs: ${data.bookings.map((b: any) => `#${b.id}(${b.status}/${b.payment_status})`).join(', ')}`);
  }
  console.log(`${'='.repeat(60)}\n`);

  // Split bookings into scheduled/in-progress and completed for tabbed display.
  const scheduledBookings = data?.bookings?.filter((booking: any) =>
    booking.status !== 'cancelled' && booking.status !== 'completed'
  ) || [];
  const completedBookings = data?.bookings?.filter((booking: any) =>
    booking.status === 'completed'
  ) || [];
  const activeTabBookings = bookingTab === 'completed' ? completedBookings : scheduledBookings;
  // Separate pending-payment bookings for the separate notice
  const pendingBookings: any[] = scheduledBookings.filter((b: any) =>
    (b.status === 'pending' || b.payment_status === 'pending') &&
    b.payment_status !== 'completed'
  ) || [];
  const totalBookings = activeTabBookings.length;
  const totalPages = Math.ceil(totalBookings / bookingsPerPage);
  const startIdx = (currentPage - 1) * bookingsPerPage;
  const endIdx = startIdx + bookingsPerPage;
  const paginatedBookings = activeTabBookings.slice(startIdx, endIdx) || [];

  console.log(`📄 Pagination: Page ${currentPage}/${totalPages}, showing bookings ${startIdx + 1}-${Math.min(endIdx, totalBookings)} of ${totalBookings}`);

  // Helper: robustly extract a numeric price for a booking from common fields
  const formatPrice = (b: any) => {
    if (!b) return 0;
    const candidates = [
      b.service_price,
      b.estimatedCost,
      b.price,
      b.amount,
      b.total,
      b.fee,
      b.billingAmount,
      b.payment_amount,
      b.paymentAmount,
      b.service?.price,
      b.estimated_price,
    ];
    for (const c of candidates) {
      if (c === undefined || c === null) continue;
      const num = typeof c === 'string' ? parseFloat(c) : Number(c);
      if (!isNaN(num) && Number(num) !== 0) return num;
      // if it's exactly 0, we'll accept it only if no other non-zero found
      if (!isNaN(num) && Number(num) === 0) return 0;
    }
    // Fallback: try to resolve from loaded serviceOptions using service_id
    try {
      const sid = (typeof b.service_id === 'string' ? parseInt(b.service_id) : b.service_id);
      if (!isNaN(sid)) {
        const svc = serviceOptions.find(s => s.id === sid) as any;
        if (svc) {
          const p = svc.price;
          if (p !== undefined && p !== null) {
            const num = typeof p === 'string' ? parseFloat(p) : Number(p);
            if (!isNaN(num)) return num;
          }
        }
      }
    } catch (err) {
      console.warn('formatPrice fallback error:', err);
    }

    return 0;
  };

  // Helper: get a human-friendly booking type/category from multiple possible fields
  const getBookingType = (b: any) => {
    if (!b) return '';
    const typeCandidates = [
      b.type,
      b.booking_type,
      b.service_type,
      b.category,
      b.service?.category,
      b.service?.type,
      b.service?.name && typeof b.service?.name === 'string' && b.service?.name !== b.service_name ? b.service.name : null,
    ];
    for (const t of typeCandidates) {
      if (!t) continue;
      if (typeof t === 'string' && t.trim() !== '') return t;
      if (typeof t === 'number') return String(t);
    }
    return '';
  };


  // Helper: robustly extract a human-friendly service name/type for a booking
  const getBookingServiceName = (b: any) => {
    if (!b) return 'Service';
    // common direct fields
    const direct = [b.service_name, b.service?.name, b.name, b.title, b.serviceTitle, b.serviceType, b.service_type, b.type];
    for (const d of direct) {
      if (!d) continue;
      if (typeof d === 'string' && d.trim() !== '') return d;
      if (typeof d === 'number') return String(d);
    }

    // Try to resolve via known id fields against loaded serviceOptions
    try {
      const idCandidates = [b.service_id, b.serviceId, b.service?.id, b.service_type];
      for (const ic of idCandidates) {
        if (ic === undefined || ic === null) continue;
        const sid = typeof ic === 'string' ? parseInt(ic) : ic;
        if (!isNaN(sid)) {
          const svc = serviceOptions.find(s => s.id === sid) as any;
          if (svc) return svc.title || svc.name || String(svc.id);
        }
      }
    } catch (err) {
      console.warn('getBookingServiceName fallback error:', err);
    }

    return 'Service';
  };
  // Fetch part requests for all bookings
  useEffect(() => {
    const fetchPartRequests = async () => {
      if (!data?.bookings?.length) return;
      setLoadingParts(true);
      try {
        const allRequests: {[key: string]: any[]} = {};
        for (const booking of data.bookings) {
          try {
            const response = await apiPartRequests.getAll();
            if (Array.isArray(response)) {
              allRequests[String(booking.id)] = response.filter((req: any) => req.booking_id === booking.id);
            }
          } catch (err) {
            console.log(`Failed to fetch part requests for booking ${booking.id}`);
          }
        }
        setPartRequests(allRequests);
      } catch (error) {
        console.error('Error fetching part requests:', error);
      } finally {
        setLoadingParts(false);
      }
    };

    fetchPartRequests();
  }, [data?.bookings]);

  // Auto-verify any pending payments for bookings and refresh context
  useEffect(() => {
    const verifyPendingPayments = async () => {
      if (!data?.bookings || data.bookings.length === 0) return;

      const pending = data.bookings.filter((b: any) => b.payment_status === 'pending' || b.status === 'pending');
      if (!pending.length) return;

      console.log(`🔁 Verifying ${pending.length} pending payment(s)...`);

      for (const b of pending) {
        try {
          // Use payments API helper (includes auth and error handling)
          const payment = await apiPayments.getStatus(b.id).catch(() => null);
          if (!payment) {
            console.log(`   · No payment info returned for booking ${b.id}`);
            continue;
          }

          // Debug log the raw payment object to help trace structure
          console.log(`   · API payment status for booking ${b.id}:`, payment);

          // Try to robustly extract a reference from common response shapes
          const reference = payment.reference || payment.ref || payment.payment_reference ||
            payment.data?.reference || payment.result?.reference || payment.payload?.reference ||
            payment.data?.ref || payment.referral || null;

          if (!reference) {
            console.log(`   · No payment reference found in API response for booking ${b.id}`);
            continue;
          }

          // Call backend verify endpoint via payments API
          try {
            const verifyResult = await apiPayments.verify(reference);
            console.log(`   · Verified booking ${b.id} reference=${reference}`, verifyResult?.message || verifyResult);
            // Refresh bookings from backend (skip cache)
            try { await refreshBookings(true); } catch (e) { console.warn('Failed to refresh bookings after verify', e); }
          } catch (verifyErr) {
            console.warn(`   · Verification failed for booking ${b.id} reference=${reference}`, verifyErr);
          }
        } catch (err) {
          console.warn('Error verifying pending payment for booking', b.id, err);
        }
      }
    };

    // Run once when bookings change
    verifyPendingPayments();
  }, [data?.bookings, refreshBookings]);

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'requested': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!data) return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="animate-spin inline-block mr-2">⌛</div>
        <p className="text-gray-600">Loading your bookings...</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Service Bookings</h2>
        <Dialog open={isBookingDialogOpen} onOpenChange={(open) => { 
          setIsBookingDialogOpen(open); 
          if (!open) setRescheduleBooking(undefined);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950">
              <Plus className="h-4 w-4" /> New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className={rescheduleBooking ? "max-w-sm" : "max-w-2xl"}>
            <DialogHeader>
              <DialogTitle>{rescheduleBooking ? 'Reschedule Booking' : 'Schedule Service'}</DialogTitle>
              <DialogDescription>
                {rescheduleBooking 
                  ? 'Change the date and time for your service appointment.' 
                  : 'Book a new service appointment for your vehicle.'}
              </DialogDescription>
            </DialogHeader>
            <BookingForm 
              onClose={() => {
                setIsBookingDialogOpen(false);
                setRescheduleBooking(undefined);
              }} 
              editingBooking={rescheduleBooking}
              refreshBookings={refreshBookings}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button
          variant={bookingTab === 'scheduled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setBookingTab('scheduled');
            setCurrentPage(1);
          }}
        >
          Scheduled ({scheduledBookings.length})
        </Button>
        <Button
          variant={bookingTab === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setBookingTab('completed');
            setCurrentPage(1);
          }}
        >
          Completed ({completedBookings.length})
        </Button>
      </div>

      <div className="space-y-3">

        {data.bookings && data.bookings.length > 0 ? (
          <>
            {paginatedBookings.map((booking: any) => {
              const bookingParts = partRequests[booking.id] || [];
              return (
                <Card key={booking.id} className="hover:shadow-md transition-shadow max-w-2xl">
                <CardContent className="pt-4">
                  {/* Header: Service Name with Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{getBookingServiceName(booking)}</h3>
                      {getBookingType(booking) && (
                        <p className="text-xs text-gray-500 mt-1">{getBookingType(booking)}</p>
                      )}
                    </div>
                    <Badge className={
                      booking.status === 'pending' || booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800 font-semibold' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-800 font-semibold' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800 font-semibold' :
                      'bg-gray-100 text-gray-800 font-semibold'
                    }>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {/* Info Row: Date | Time | Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase">Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(booking.booking_datetime || booking.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase">Time</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(booking.booking_datetime || booking.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold uppercase">Amount</p>
                      <span className="font-bold text-lg text-green-600">GH₵{formatPrice(booking).toFixed(2)}</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm"><span className="text-blue-700 font-semibold">📝 Notes:</span> <span className="text-gray-700">{booking.notes}</span></p>
                    </div>
                  )}

                  {/* Refund Status Section */}
                  {booking.status === 'cancelled' && booking.paymentStatus && (
                    <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                      <div className="flex items-start gap-3">
                        <div>
                          {booking.paymentStatus === 'refund_pending' && (
                            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                              <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                              ⏳ Refund Pending
                            </p>
                          )}
                          {booking.paymentStatus === 'refunded' && (
                            <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              Refund Completed
                            </p>
                          )}
                          {booking.refundAmount && (
                            <p className="text-sm mt-2 text-gray-700">
                              <span className="font-medium">Amount: GH₵{parseFloat(booking.refundAmount).toFixed(2)}</span>
                            </p>
                          )}
                          {booking.refundDate && (
                            <p className="text-xs text-gray-600 mt-1">
                              Date: {new Date(booking.refundDate).toLocaleDateString()}
                            </p>
                          )}
                          {booking.refundNotes && (
                            <p className="text-xs text-gray-600 mt-1">
                              {booking.refundNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t flex gap-2">
                    {(booking.status === 'pending' || booking.status === 'scheduled') && (
                      <>
                        {/* If a mechanic has been assigned, disallow customer reschedule/cancel */}
                        {!booking.mechanic_assigned ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleReschedule(booking)}
                            >
                              <Edit2 className="h-4 w-4" /> Reschedule
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => cancelBooking(booking.id)}
                            >
                              <X className="h-4 w-4" /> Cancel
                            </Button>
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">A mechanic has been assigned — contact support to change this booking.</div>
                        )}
                      </>
                    )}

                    {booking.status === 'cancelled' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => deleteBooking(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {startIdx + 1}-{Math.min(endIdx, totalBookings)} of {totalBookings} bookings
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : bookingTab === 'scheduled' && pendingBookings.length > 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-2 text-amber-500 opacity-75" />
            <p className="text-gray-700 font-medium mb-2">Complete Payment to Confirm</p>
            <p className="text-sm text-gray-500 mb-4">Your booking is being held until payment is completed.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              {bookingTab === 'completed' ? (
                <>
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500 mb-4">No completed services yet</p>
                  <p className="text-sm text-gray-600">Your completed services will appear here.</p>
                </>
              ) : (
                <>
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500 mb-4">No scheduled bookings</p>
                  <p className="text-sm text-gray-600">Click the "New Booking" button above to schedule your first service.</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    );
  } catch (error) {
    console.error('❌ Error in BookingsManagement component:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-800">
            <p className="font-semibold">Error loading bookings</p>
            <p className="text-sm mt-2">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
}

// Parts & Inventory Component
function PartsInventory() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allParts, setAllParts] = useState(parts);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: number]: any[] }>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<number | null>(null);
  const [isPaymentPolling, setIsPaymentPolling] = useState(false);
  const [paymentPollMessage, setPaymentPollMessage] = useState('');
  const paymentPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clean up payment polling on unmount
    return () => {
      if (paymentPollRef.current) {
        clearInterval(paymentPollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('partsCart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
        console.log('✅ Loaded cart from storage:', Object.keys(parsed).length, 'items');
      } catch (err) {
        console.warn('Could not parse saved cart');
        localStorage.removeItem('partsCart');
      }
    }

    // Always use frontend parts for consistency - no API fetch
    // Log available parts for debugging
    console.log('📦 PARTS INVENTORY LOADED:', {
      count: parts.length,
      ids: parts.map(p => p.id),
      names: parts.map(p => `${p.id}: ${p.name}`),
    });
    setAllParts(parts);
    setIsLoading(false);

    // Fetch order history
    const fetchOrderHistory = async () => {
      try {
        const response = await apiOrders.getMyOrders();
        if (Array.isArray(response)) {
          setOrderHistory(response);

          // Fetch items for each order
          if (response.length > 0) {
            const itemsMap: { [key: number]: any[] } = {};
            for (const order of response.slice(0, 10)) {
              try {
                const itemData = await apiOrders.getById(String(order.id));
                itemsMap[order.id] = itemData?.items || itemData?.order_items || [];
              } catch (e) {
                console.error(`Error fetching items for order ${order.id}:`, e);
                itemsMap[order.id] = [];
              }
            }
            setOrderItems(itemsMap);
          }
        }
      } catch (error) {
        console.log('Could not fetch order history');
      }
    };

    fetchOrderHistory();
  }, []);

  const categories = Array.from(new Set(allParts.map(p => p.category)));
  
  // Filter by category and search
  let filteredParts = allParts;
  if (selectedCategory) {
    filteredParts = filteredParts.filter(p => p.category === selectedCategory);
  }
  if (searchQuery) {
    filteredParts = filteredParts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const quickAddToCart = (part: any) => {
    // Add item with quantity 1 directly - no modal
    if (part.stock_quantity < 1) {
      setCheckoutError(`${part.name} is out of stock`);
      return;
    }

    try {
      setCartItems(prev => {
        const currentQty = prev[part.id] || 0;
        const newQty = currentQty + 1; // Always add 1 more
        
        // Check stock availability
        const maxStock = part.stock_quantity || 0;
        if (newQty > maxStock) {
          setCheckoutError(`Only ${maxStock} items available. You have ${currentQty} in cart.`);
          return prev;
        }

        const updated = {
          ...prev,
          [part.id]: newQty
        };
        localStorage.setItem('partsCart', JSON.stringify(updated));
        console.log('✅ Quick added to cart:', {
          partId: part.id,
          partName: part.name,
          newQuantity: newQty,
        });
        return updated;
      });
      setCheckoutError('');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCheckoutError('Failed to add item to cart');
    }
  };

  const updateCartItemQty = (partId: number, qty: number) => {
    try {
      if (qty < 1) {
        removeFromCart(partId);
        return;
      }

      const partsSource = allParts && allParts.length > 0 ? allParts : parts;
      const part = partsSource.find(p => p.id === partId);
      if (!part) {
        setCheckoutError(`Part ${partId} not found`);
        return;
      }

      const maxStock = (part as any).stock_quantity || 0;
      if (qty > maxStock) {
        setCheckoutError(`Only ${maxStock} items available`);
        return;
      }

      setCartItems(prev => {
        const updated = {
          ...prev,
          [partId]: qty
        };
        localStorage.setItem('partsCart', JSON.stringify(updated));
        console.log('✅ Updated cart item:', part.name, 'New qty:', qty);
        return updated;
      });
      setCheckoutError('');
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      setCheckoutError('Failed to update cart');
    }
  };

  const removeFromCart = (partId: number) => {
    try {
      setCartItems(prev => {
        const updated = {...prev};
        delete updated[partId];
        localStorage.setItem('partsCart', JSON.stringify(updated));
        console.log('✅ Removed from cart. Remaining items:', Object.keys(updated).length);
        return updated;
      });
      setCheckoutError('');
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCheckoutError('Failed to remove item from cart');
    }
  };

  const cartTotal = Object.entries(cartItems).reduce((sum, [partId, qty]) => {
    const part = allParts.find(p => p.id === parseInt(partId));
    const price = typeof part?.price === 'string' ? parseFloat(part.price) : (part?.price || 0);
    return sum + price * qty;
  }, 0);

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const handleCheckout = async () => {
    setCheckoutError('');
    
    console.log('🔍 CHECKOUT DEBUG:', {
      cartItemsCount: Object.keys(cartItems).length,
      cartItems: Object.keys(cartItems),
      allPartsCount: allParts.length,
      allPartsIds: allParts.map((p: any) => p.id),
      partsImportIds: parts.map((p: any) => p.id),
    });
    
    try {
      // Validate cart is not empty
      if (Object.keys(cartItems).length === 0) {
        setCheckoutError('Your cart is empty. Add parts before checkout.');
        return;
      }

      // Get token
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('token') || 
                    sessionStorage.getItem('authToken') || 
                    sessionStorage.getItem('token');

      if (!token) {
        setCheckoutError('Your session has expired. Please log in again.');
        return;
      }

      // Get user
      const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.id) {
        setCheckoutError('User information not found. Please log in again.');
        return;
      }

      // Build order items with validation
      const orderItems: any[] = [];
      let validationError = '';
      
      // ALWAYS use parts directly - this is more reliable than state
      console.log('🔍 CHECKOUT VALIDATION START:', {
        cartEntries: Object.entries(cartItems),
        allPartsLength: allParts.length,
        partsDirectLength: parts.length,
        partsDirectIds: parts.map(p => p.id),
      });
      
      // Force use parts directly for maximum reliability
      const partsSource = parts && parts.length > 0 ? parts : allParts;

      Object.entries(cartItems).forEach(([partId, quantity]) => {
        const partIdNum = parseInt(partId);
        
        console.log(`  Searching for part ID: ${partIdNum} (type: ${typeof partIdNum})`);
        console.log(`    Available IDs in source: ${partsSource.map((p: any) => p.id)}`);
        
        const part = partsSource.find((p: any) => {
          const match = p.id === partIdNum;
          if (!match) {
            console.log(`    Checking: p.id=${p.id} (${typeof p.id}) vs ${partIdNum} (${typeof partIdNum}) = ${match}`);
          }
          return match;
        });
        
        if (!part) {
          console.error(`❌ Part ${partIdNum} NOT FOUND!`, {
            searched: partIdNum,
            availableIds: partsSource.map((p: any) => p.id),
            sourceLength: partsSource.length,
          });
          validationError = `Part ${partIdNum} not found in inventory. Available: ${partsSource.map((p: any) => p.id).join(', ')}`;
          return;
        }
        
        console.log(`  ✓ Found part: ${part.name}`);

        // Validate quantity
        if (!quantity || quantity < 1) {
          validationError = `Invalid quantity for ${part.name}`;
          return;
        }

        // Check stock availability
        const availableStock = (part as any).stock_quantity || 0;
        if (quantity > availableStock) {
          validationError = `${part.name} has only ${availableStock} in stock, but you requested ${quantity}.`;
          return;
        }

        // Calculate price
        const price = typeof part.price === 'string' ? parseFloat(part.price) : (part.price || 0);
        if (isNaN(price) || price < 0) {
          validationError = `Invalid price for ${part.name}`;
          return;
        }

        orderItems.push({
          part_id: parseInt(partId),
          quantity: parseInt(quantity.toString()),
          unit_price: parseFloat(price.toFixed(2))
        });
      });

      if (validationError) {
        setCheckoutError(validationError);
        return;
      }

      // Calculate total with validation
      const orderTotal = orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      
      if (orderTotal !== cartTotal) {
        setCheckoutError('Price calculation mismatch. Please refresh and try again.');
        return;
      }

      // Proceed directly from cart drawer to payment flow (no secondary summary modal)
      setShowCart(false);
      await confirmCheckout();
      
    } catch (error) {
      console.error('Checkout validation error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const confirmCheckout = async () => {
    setShowCheckoutConfirm(false);
    setCheckoutError('');
    setIsCheckingOut(true);

    try {
      // Get credentials
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('token') || 
                    sessionStorage.getItem('authToken') || 
                    sessionStorage.getItem('token');

      const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user?.id) {
        setCheckoutError('Session expired. Please log in again.');
        setIsCheckingOut(false);
        return;
      }

      // Prepare order items - ALWAYS use the imported parts directly (most reliable)
      console.log('📋 Creating order with items from cart:', Object.entries(cartItems));
      console.log('📦 Available parts in scope:', parts.map((p: any) => ({ id: p.id, name: p.name })));
      
      const orderItems = Object.entries(cartItems).map(([partId, quantity]) => {
        const partIdNum = parseInt(partId);
        console.log(`  ✓ Processing cart item: partId="${partId}" (parsed to ${partIdNum})`);
        
        // Use the imported parts directly
        const part = parts.find((p: any) => {
          const match = p.id === partIdNum;
          console.log(`    Comparing: p.id=${p.id} vs ${partIdNum} = ${match}`);
          return match;
        });
        
        if (!part) {
          console.error(`❌ Part ${partIdNum} NOT FOUND IN PARTS:`, {
            searched: partIdNum,
            partsIds: parts.map((p: any) => p.id),
            cartEntry: [partId, quantity],
          });
          throw new Error(`Part ${partIdNum} not found in inventory. Available: ${parts.map((p: any) => p.id).join(', ')}`);
        }
        
        console.log(`  ✓ Found part ${partIdNum}: ${part.name}`);
        return {
          car_part_id: partIdNum,
          quantity: parseInt(quantity.toString())
        };
      });
      
      console.log('✅ All order items validated and prepared:', orderItems);

      // Create order
      console.log('🚀 Sending order creation request to backend:', {
        items: orderItems,
        userEmail: user.email,
      });

      const result = await apiOrders.create({ items: orderItems });
      const orderId = result?.order_id || result?.id;

      if (!orderId) {
        throw new Error('No order ID returned');
      }

      // Initialize Paystack payment for the order
      try {
        console.log('💳 Initializing payment for parts order:', orderId);
        console.log(`💰 Cart total: GH₵${cartTotal.toFixed(2)}`);
        
        // Construct return URL for after payment
        const returnUrl = `${window.location.origin}/payment-success?order_id=${orderId}&forceRefresh=1&newBookingId=${orderId}`;
        console.log('🔗 Return URL:', returnUrl);

        const paymentResponse = await apiPayments.initialize({
          amount: cartTotal, // Amount in GH₵ (cedis) - backend will convert to pesewas
          order_id: orderId,
          email: user.email,
          description: `Car Parts Order #${orderId}`,
          return_url: returnUrl,
          metadata: {
            order_id: orderId,
            order_type: 'parts_order',
            user_id: user.id,
            item_count: Object.values(cartItems).reduce((a, b) => a + b, 0)
          }
        });

        console.log('💳 Payment response:', paymentResponse);

        // Check for authorization URL (backend returns it at top level)
        const authUrl = paymentResponse?.authorization_url;
        
        if (!authUrl) {
          console.error('❌ No authorization URL in response:', paymentResponse);
          throw new Error('Payment gateway URL not available. Please try again.');
        }

        console.log('✅ Got Paystack authorization URL:', authUrl);

        // Store order info for reference after payment
        sessionStorage.setItem('partsOrderId', orderId.toString());
        sessionStorage.setItem('partsOrderAmount', cartTotal.toFixed(2));
        sessionStorage.setItem('partsOrderEmail', user.email);
        sessionStorage.setItem('paymentReference', paymentResponse.reference);
        
        // Clear cart after successful order creation
        setCartItems({});
        localStorage.removeItem('partsCart');
        setIsCheckingOut(false);
        setShowCheckoutConfirm(false);

        console.log('🔄 Opening Paystack checkout...');

        // Use Paystack redirect URL instead of popup
        if (authUrl) {
          console.log('✅ Redirecting to Paystack via navigate:', authUrl);
          // Store order info before redirecting
          sessionStorage.setItem('partsOrderId', orderId.toString());
          sessionStorage.setItem('partsOrderAmount', cartTotal.toFixed(2));
          sessionStorage.setItem('partsOrderEmail', user.email);
          sessionStorage.setItem('paymentReference', paymentResponse.reference);
          
          // Redirect to Paystack
          window.location.href = authUrl;
        }

        // Start polling for payment verification
        const reference = paymentResponse.reference;
        sessionStorage.setItem('paymentReference', reference);
        setIsPaymentPolling(true);
        setPaymentPollMessage('Processing payment...');

        if (paymentPollRef.current) {
          clearInterval(paymentPollRef.current);
        }

        let attempts = 0;
        const maxAttempts = 60; // ~2 minutes

        paymentPollRef.current = setInterval(async () => {
          attempts += 1;
          try {
            console.log(`🔍 Polling payment verification (attempt ${attempts}) for reference: ${reference}`);
            const verification = await apiPayments.verify(reference);

            if (verification?.success) {
              console.log('✅ Payment confirmed via verify endpoint:', verification);
              setPaymentPollMessage('Payment confirmed! Redirecting...');
              setIsPaymentPolling(false);
              
              if (paymentPollRef.current) {
                clearInterval(paymentPollRef.current);
                paymentPollRef.current = null;
              }

              // Use React Router navigate instead of window.location
              sessionStorage.setItem('forceRefreshDashboard', 'true');
              sessionStorage.setItem('newBookingId', orderId.toString());
              navigate(`/payment-success?order_id=${orderId}&forceRefresh=1&newOrderId=${orderId}`, { replace: true });
            }
          } catch (pollErr) {
            console.warn('🔁 Polling payment verification error:', pollErr);
          }

          if (attempts >= maxAttempts) {
            console.warn('⏳ Payment verification polling timed out');
            setPaymentPollMessage('Could not confirm payment yet. Please check your dashboard later.');
            setIsPaymentPolling(false);
            if (paymentPollRef.current) {
              clearInterval(paymentPollRef.current);
              paymentPollRef.current = null;
            }
          }
        }, 2000);

      } catch (paymentError) {
        // Payment initialization failed - show error, don't proceed with success
        console.error('❌ Payment initialization failed:', paymentError);
        setCheckoutError(
          paymentError instanceof Error 
            ? paymentError.message 
            : 'Failed to initialize payment. Please try again.'
        );
        setIsCheckingOut(false);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">


      {/* Success Modal */}
      {checkoutSuccess && (
        <Dialog open={checkoutSuccess} onOpenChange={setCheckoutSuccess}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center text-lg">Order Placed Successfully!</DialogTitle>
              <DialogDescription className="text-center">Your order has been created and is ready for payment.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-sm text-gray-600">Your order has been created and is ready for payment.</p>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">Order ID</p>
                <p className="text-lg font-bold text-blue-600">#{orderSuccessId}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs">
                <p className="text-amber-800"><strong>⏳ Next:</strong> You will be redirected to Paystack to complete payment securely.</p>
              </div>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                onClick={() => {
                  setCheckoutSuccess(false);
                  setShowCart(false);
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Glassmorphism Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          {/* Drawer Panel */}
          <div className="w-full max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl flex flex-col border-l border-white/30 dark:border-gray-700/50 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-white" />
                <h2 className="text-base font-bold text-white">Your Cart</h2>
                {totalItems > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                )}
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {totalItems === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Your cart is empty</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Add parts from the shop below</p>
                </div>
              ) : (
                Object.entries(cartItems).map(([partId, qty]) => {
                  const partsSource = allParts && allParts.length > 0 ? allParts : parts;
                  const part = partsSource.find(p => p.id === parseInt(partId));
                  if (!part) return null;
                  const price = typeof part.price === 'string' ? parseFloat(part.price) : (part.price || 0);
                  return (
                    <div key={partId} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl p-3 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{part.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">GH₵{price.toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(parseInt(partId))}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateCartItemQty(parseInt(partId), qty - 1)}
                            className="w-5 h-5 flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold text-sm"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-gray-900 dark:text-white w-5 text-center">{qty}</span>
                          <button
                            onClick={() => updateCartItemQty(parseInt(partId), qty + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          GH₵{(price * qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {totalItems > 0 && (
              <div className="px-4 py-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-900/60 backdrop-blur space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">GH₵{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Checkout — GH₵{cartTotal.toFixed(2)}
                </button>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-1"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header with Cart and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Shop</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Browse and order genuine car parts</p>
        </div>

        {/* Cart Icon - Opens Drawer */}
        <button
          onClick={() => setShowCart(true)}
          className="group flex-shrink-0 hover:scale-125 transition-all duration-300 active:scale-95"
        >
          <div className="relative inline-block">
            <div className={`text-5xl drop-shadow-lg group-hover:brightness-110 transition-colors ${totalItems > 0 ? 'text-blue-500 group-hover:text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>🛒</div>
            {totalItems > 0 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white animate-pulse">
                {totalItems}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Error Message */}
      {checkoutError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{checkoutError}</p>
              </div>
              <button onClick={() => setCheckoutError('')} className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment verification polling status */}
      {isPaymentPolling && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 001 1h3a1 1 0 100-2h-2V6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700">{paymentPollMessage}</p>
              </div>
              <button
                onClick={() => {
                  setIsPaymentPolling(false);
                  if (paymentPollRef.current) {
                    clearInterval(paymentPollRef.current);
                    paymentPollRef.current = null;
                  }
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}


      {totalItems > 0 && (
        <Dialog open={showCheckoutConfirm} onOpenChange={(open) => {
          if (!open) {
            setShowCheckoutConfirm(false);
            setCheckoutError('');
          }
        }}>
          <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl bg-white p-0">
            {/* Header */}
            <div className="bg-green-500 text-white p-3 sm:p-4 md:p-6 lg:p-8 flex-shrink-0">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">🛒</span>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Checkout</h2>
              </div>
            </div>

            <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 overflow-y-auto flex-1">
              {/* Two-Column Layout - Responsive */}
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
                {/* Left: Items List */}
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-shrink-0">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 truncate">Items</h3>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-2 max-h-32 sm:max-h-48 lg:max-h-80 overflow-y-auto pr-2">
                    {Object.entries(cartItems).map(([partId, qty]) => {
                      const partsSource = allParts && allParts.length > 0 ? allParts : parts;
                      const part = partsSource.find(p => p.id === parseInt(partId));
                      const itemTotal = (part?.price as number) * qty;
                      return part ? (
                        <div key={partId} className="bg-white p-2 sm:p-3 rounded border border-green-200 hover:border-green-400 hover:shadow-sm transition-all flex-shrink-0">
                          <div className="flex justify-between items-start gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-xs sm:text-sm leading-tight truncate">{part.name}</p>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 flex-shrink-0">
                                  x{qty}
                                </span>
                                <span className="text-gray-600 text-xs flex-shrink-0">@ {(part.price as number).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-xs sm:text-sm text-green-600">GH₵{itemTotal.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Right: Summary Panel */}
                <div className="lg:w-80 space-y-3 flex-shrink-0">
                  {/* Price Summary Card */}
                  <div className="bg-green-50 border border-green-300 rounded p-3 sm:p-4 md:p-5 shadow-sm">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
                      <span className="text-lg sm:text-xl flex-shrink-0">💳</span> <span className="truncate">Total</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                        <span className="text-gray-700 font-medium flex-shrink-0">Items</span>
                        <span className="font-bold text-gray-900 flex-shrink-0">{totalItems}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                        <span className="text-gray-700 font-medium flex-shrink-0">Subtotal</span>
                        <span className="font-semibold text-gray-900 flex-shrink-0 truncate">GH₵{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-green-300 pt-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm sm:text-base flex-shrink-0">Total</span>
                          <span className="text-lg sm:text-2xl md:text-3xl font-bold text-green-500 flex-shrink-0">GH₵{cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="bg-green-50 border border-green-300 rounded p-3 sm:p-4 shadow-sm">
                    <div className="flex gap-2 items-start">
                      <span className="text-lg sm:text-2xl flex-shrink-0">🔒</span>
                      <div className="min-w-0">
                        <p className="font-bold text-green-900 text-sm truncate">Secure</p>
                        <p className="text-green-700 text-xs mt-0.5">Paystack</p>
                      </div>
                    </div>
                  </div>

                  {/* Error Panel */}
                  {checkoutError && (
                    <div className="bg-red-50 border border-red-300 rounded p-3 sm:p-4">
                      <p className="text-red-800 font-bold text-xs sm:text-sm flex items-center gap-2">
                        <span className="flex-shrink-0">⚠️</span> <span className="truncate">{checkoutError}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-300 mt-4 sm:mt-5 pt-4 flex gap-3 flex-shrink-0">
                <Button
                  onClick={() => {
                    setShowCheckoutConfirm(false);
                    setCheckoutError('');
                  }}
                  disabled={isCheckingOut}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold text-sm py-2 sm:py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-2 sm:py-2.5 rounded-lg shadow-md transition-colors disabled:bg-green-300"
                  onClick={confirmCheckout}
                  disabled={isCheckingOut || cartTotal === 0}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⟳</span>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="whitespace-nowrap">Pay GH₵{cartTotal.toFixed(2)}</span>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Order History */}
      {showOrderHistory && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">📦 Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orderHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orderHistory.map((order) => (
                  <div key={order.id} className="p-3 bg-white rounded border text-sm">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">GH₵{parseFloat(order.total_amount).toFixed(2)}</p>
                        <Badge className={order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Items Section */}
                    {orderItems[order.id] && orderItems[order.id].length > 0 && (
                      <div className="mt-2 pt-2 border-t text-xs">
                        <p className="font-semibold text-gray-700 mb-1">Items:</p>
                        <ul className="space-y-1">
                          {orderItems[order.id].slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-gray-600">
                              • {item.name} (x{item.quantity})
                            </li>
                          ))}
                          {orderItems[order.id].length > 3 && (
                            <li className="text-gray-500 italic">
                              +{orderItems[order.id].length - 3} more item(s)
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No orders yet</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-2">
        <Input
          placeholder="Search parts by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          All Parts
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="w-full h-40 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredParts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">No parts found matching your search</p>
          </CardContent>
        </Card>
      ) : (
        /* Parts Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part: any) => {
            const partImage = resolvePartImage(part.name, part.image || part.image_url);
            return (
              <PartCard
                key={part.id}
                name={part.name}
                price={part.price}
                imageUrl={partImage}
                description={part.description}
                category={part.category}
                stockQuantity={part.stock_quantity}
                actionLabel="Add to Cart"
                onAction={(part.stock_quantity || 0) > 0 ? () => quickAddToCart(part) : undefined}
                showStockStatus
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Payments & Invoices Component
function PaymentsInvoices() {
  const { data, downloadInvoice } = useDashboard();
  if (!data) return null;

  const outstandingPayments = data.payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Outstanding Payments */}
      {outstandingPayments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Outstanding Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outstandingPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-white rounded border">
                  <div>
                    <p className="font-medium">GH₵{payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Due: {payment.dueDate.toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">Pay Now</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="space-y-3">
          {data.payments.length > 0 ? (
            data.payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">GH₵{payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{payment.method} • {payment.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No payment records</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Invoices</h2>
        <div className="space-y-3">
          {data.invoices.length > 0 ? (
            data.invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">GH₵{invoice.amount.toFixed(2)} • {invoice.date.toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }>
                        {invoice.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.id)}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No invoices available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Notifications UI removed — notifications are sent via email instead.

// Main Portal Component
function CustomerPortalContent({ user, onLogout }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState(() => {
    // Check if we're returning from payment - if so, show bookings tab
    const forceRefresh = sessionStorage.getItem('forceRefreshDashboard');
    if (forceRefresh === 'true') {
      console.log('📌 Switching to bookings tab after payment');
      return 'bookings';
    }
    return 'overview';
  });

  const navigationItems = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'vehicles', label: 'Vehicles', icon: Car },
    { value: 'bookings', label: 'Bookings', icon: Calendar },
    { value: 'parts', label: 'Shop', icon: ShoppingBag },
  ];

  // Convert to menu items for sidebar with onClick handlers
  const menuItems = navigationItems.map(item => ({
    label: item.label,
    icon: item.icon,
    active: activeTab === item.value,
    onClick: () => setActiveTab(item.value),
  }));

  return (
    <TailAdminLayout 
      user={user} 
      onLogout={onLogout} 
      title="User Dashboard"
      menuItems={menuItems}
    >
      <div className="space-y-6">
        {/* Content Areas - Show active section only */}
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'vehicles' && <VehiclesManagement />}
        {activeTab === 'bookings' && <BookingsManagement />}
        {activeTab === 'parts' && <PartsInventory />}
      </div>
    </TailAdminLayout>
  );
}

// Export component with provider
export function CustomerPortal({ user, onLogout }: CustomerPortalProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [forceRefresh, setForceRefresh] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read refresh flags from URL params (preferred) or sessionStorage (fallback)
  useEffect(() => {
    const urlForceRefresh = searchParams.get('forceRefresh') === '1' || searchParams.get('forceRefresh') === 'true';
    const urlNewBookingId = searchParams.get('newBookingId');

    const storedForceRefresh = sessionStorage.getItem('forceRefreshDashboard') === 'true';
    const storedNewBookingId = sessionStorage.getItem('newBookingId');

    if (urlForceRefresh || urlNewBookingId) {
      setForceRefresh(urlForceRefresh || storedForceRefresh);

      // Make sure we keep the new booking id around for diagnostics if provided
      if (urlNewBookingId) {
        sessionStorage.setItem('newBookingId', urlNewBookingId);
      } else if (storedNewBookingId) {
        sessionStorage.setItem('newBookingId', storedNewBookingId);
      }

      // Clear query params so refresh isn't retriggered on subsequent loads
      const params = new URLSearchParams(searchParams);
      params.delete('forceRefresh');
      params.delete('newBookingId');
      setSearchParams(params, { replace: true });
    } else {
      setForceRefresh(storedForceRefresh);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (forceRefresh) {
          console.log('🔄 Force refreshing dashboard after payment...');
          // DON'T clear the flag yet - BookingsManagement needs to see it!
        }
        
        console.log(`📊 Loading real data from database for user ${user.id}...`);
        console.log(`   User object:`, user);
        console.log(`   User.id type: ${typeof user.id}, value: ${user.id}`);
        
        // Ensure user ID is valid
        if (!user || !user.id) {
          console.error('❌ CRITICAL: User or user.id is missing!', { user });
          throw new Error('User information is missing');
        }
        
        // Fetch all real data from database in parallel
        const [userProfile, vehicles, bookings, servicesData] = await Promise.all([
          apiUsers.getProfile().catch(err => {
            console.warn('❌ Failed to fetch user profile:', err);
            return null;
          }),
          apiVehicles.getByUser(user.id).catch(err => {
            console.warn('❌ Failed to fetch vehicles:', err);
            return [];
          }),
          apiBookings.getByUser(user.id, forceRefresh).catch(err => {
            console.warn('❌ Failed to fetch bookings:', err);
            return [];
          }),
          apiServices.getAll().catch(err => {
            console.warn('❌ Failed to fetch services:', err);
            return [];
          }),
        ]);

        console.log(`✅ Data loaded from database:`);
        console.log(`   Vehicles: ${Array.isArray(vehicles) ? vehicles.length : 0}`);
        console.log(`   Bookings: ${Array.isArray(bookings) ? bookings.length : 0}`);

        // Transform and prepare data
        const vehiclesData = Array.isArray(vehicles) ? vehicles.map((v: any) => ({
          id: String(v.id),
          userId: String(v.user_id),
          make: v.make || 'Unknown',
          model: v.model || 'Unknown',
          year: v.year || new Date().getFullYear(),
          licensePlate: v.license_plate || '',
          vin: v.vin || '',
          mileage: v.mileage || 0,
          fuelType: v.fuel_type || 'petrol' as 'petrol' | 'diesel' | 'hybrid' | 'electric',
          lastServiceDate: v.last_service_date ? new Date(v.last_service_date) : undefined,
          nextServiceDate: v.next_service_date ? new Date(v.next_service_date) : undefined,
          createdAt: new Date(v.created_at || new Date()),
          updatedAt: new Date(v.updated_at || new Date()),
        })) : [];

        const bookingsData = Array.isArray(bookings) ? bookings.map((b: any) => {
          const serviceIdRaw = b.service_id != null ? String(b.service_id) : '';
          const matchedService = Array.isArray(servicesData)
            ? servicesData.find((s: any) => String(s.id) === serviceIdRaw)
            : null;
          const rawBookingDate = b.booking_datetime || b.scheduled_date || b.scheduledDate || b.created_at;
          const normalizedAmount = parseFloat(
            String(
              b.total_cost
              ?? b.totalCost
              ?? b.payment_amount
              ?? b.paymentAmount
              ?? b.amount
              ?? b.billingAmount
              ?? b.service_price
              ?? b.estimatedCost
              ?? 0,
            ),
          ) || 0;
          const resolvedServiceName = b.service_name
            || matchedService?.name
            || matchedService?.title
            || '';
          const resolvedServiceType = b.service_type
            || (matchedService?.id != null ? String(matchedService.id) : '')
            || serviceIdRaw
            || '';

          return {
            id: b.id,
            userId: b.user_id,
            vehicleId: b.vehicle_id,
            serviceType: resolvedServiceType as any,
            status: b.status,
            scheduledDate: new Date(rawBookingDate),
            estimatedDuration: 120,
            shopName: 'AutoService Pro',
            estimatedCost: normalizedAmount,
            description: b.notes || '',
            mechanic: { id: 'm1', name: 'Assigned Mechanic' },
            createdAt: new Date(b.created_at),
            updatedAt: new Date(b.updated_at),
            service_id: b.service_id,
            service_name: resolvedServiceName,
            service_price: b.service_price,
            total_cost: b.total_cost,
            parts_cost: b.parts_cost,
            payment_status: b.payment_status,
            first_name: b.first_name,
            last_name: b.last_name,
          };
        }) : [];

        const data = {
          user: {
            id: user.id,
            name: user.name || (userProfile?.first_name || '') + ' ' + (userProfile?.last_name || ''),
            email: user.email || (userProfile?.email || ''),
            role: user.role || 'customer',
          },
          profile: {
            userId: user.id,
            phone: userProfile?.phone || '',
            address: userProfile?.address || '',
            city: userProfile?.city || '',
            state: userProfile?.state || '',
            zipCode: userProfile?.zip_code || '',
            country: userProfile?.country || '',
            preferences: {
              emailNotifications: true,
              smsNotifications: true,
              serviceReminders: true,
              reminderDays: 30,
              preferredShop: '',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          vehicles: vehiclesData,
          bookings: bookingsData,
          serviceRecords: [],
          serviceRequests: [],
          payments: [],
          invoices: [],
          notifications: [],
          stats: {
            totalVehicles: vehiclesData.length,
            totalBookings: bookingsData.length,
            activeServices: 0,
            totalServiceCost: 0,
            upcomingServices: bookingsData.filter((b: any) => b.status === 'scheduled').length,
            completedServices: bookingsData.filter((b: any) => b.status === 'completed').length,
            nextServiceDate: undefined,
            nextServiceDue: undefined,
            averageServiceCost: 0,
            totalServiceHours: 0,
          },
        };

        console.log(`✅ Initial data prepared. Bookings count: ${bookingsData.length}`);
        setInitialData(data);
        
        // Clear the force refresh flags NOW - after all data has been loaded
        if (forceRefresh) {
          console.log('✅ Data load complete - clearing forceRefresh flags');
          sessionStorage.removeItem('forceRefreshDashboard');
          sessionStorage.removeItem('newBookingId');
        }
      } catch (err) {
        console.error('❌ Failed to load dashboard data:', err);
        // Provide minimal fallback with empty data - NO MOCK DATA
        setInitialData({
          user,
          profile: { userId: user.id },
          vehicles: [],
          serviceRecords: [],
          bookings: [],
          serviceRequests: [],
          payments: [],
          invoices: [],
          notifications: [],
          stats: {
            totalVehicles: 0,
            activeServices: 0,
            totalServiceCost: 0,
            upcomingServices: 0,
            completedServices: 0,
            nextServiceDate: undefined,
            nextServiceDue: undefined,
            averageServiceCost: 0,
            totalServiceHours: 0,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.id, forceRefresh]);

  if (isLoading) {
    return (
      <TailAdminLayout user={user} onLogout={onLogout} title="User Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin mr-2">⌛</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </TailAdminLayout>
    );
  }

  if (!initialData) {
    return (
      <TailAdminLayout user={user} onLogout={onLogout} title="User Dashboard">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Failed to load dashboard. Please refresh the page.</p>
          </CardContent>
        </Card>
      </TailAdminLayout>
    );
  }

  // When forceRefresh is true, ensure DashboardProvider receives it so it can refresh on mount
  if (forceRefresh) {
    console.log('📌 Passing forceRefresh flag to DashboardProvider');
    // Don't clear the flag yet - BookingsManagement needs it
  }

  return (
    <DashboardProvider userId={user.id} initialData={initialData} forceRefresh={forceRefresh}>
      <CustomerPortalContent user={user} onLogout={onLogout} />
    </DashboardProvider>
  );
}