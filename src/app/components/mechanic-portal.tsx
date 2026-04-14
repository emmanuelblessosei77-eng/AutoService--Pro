import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { User } from '../App';
import { TailAdminLayout } from './layouts/TailAdminLayout';
import { bookings as apiBookings, carParts as apiCarParts, partRequests as apiPartRequests } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Wrench, CheckCircle2, Package, AlertCircle, Clock, FileText, Plus, Trash2, Zap,
  LayoutDashboard, ClipboardList, Download, TrendingUp, PieChart as PieChartIcon,
  Calendar, RefreshCw, ChevronLeft, ChevronRight, Printer
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import SweetAlert from './SweetAlert';

interface MechanicPortalProps {
  user: User;
  onLogout: () => void;
}

interface WorkOrder {
  id: number;
  vehicleInfo: string;
  customer: string;
  customerEmail?: string;
  customerName?: string;
  description: string;
  serviceName?: string;
  servicePrice?: number;
  status: 'assigned' | 'in-progress' | 'awaiting-parts' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  dueDate: string;
  bookingTime?: string;
  notes?: string;
  partsNeeded?: string[];
  services?: any[];
  created_at?: string;
  updated_at?: string;
}

interface ActivityLog {
  id: number;
  orderId: number;
  customer: string;
  action: string;
  status: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

interface PartRequest {
  id: number;
  booking_id: number;
  part_name: string;
  quantity: number;
  reason?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'requested' | 'approved' | 'fulfilled' | 'rejected';
  created_at: string;
  first_name?: string;
  last_name?: string;
  service_name?: string;
}

interface AvailablePart {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
}

const mapBookingStatusToWorkOrderStatus = (bookingStatus: string): 'assigned' | 'in-progress' | 'awaiting-parts' | 'completed' => {
  switch (bookingStatus) {
    case 'pending':
    case 'confirmed':
    case 'assigned':
    case 'scheduled':
      return 'assigned';
    case 'in-progress':
      return 'in-progress';
    case 'awaiting-parts':
      return 'awaiting-parts';
    case 'completed':
      return 'completed';
    default:
      return 'assigned';
  }
};

const formatDateOnly = (value?: string | null, fallback = 'Pending') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().split('T')[0];
};

const formatTimeOnly = (value?: string | null, fallback = 'TBD') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function MechanicPortal({ user, onLogout }: MechanicPortalProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [partRequests, setPartRequests] = useState<PartRequest[]>([]);
  const [availableParts, setAvailableParts] = useState<AvailablePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmRequestId, setDeleteConfirmRequestId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'in-progress' | 'awaiting-parts' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'work-orders' | 'part-requests'>('overview');
  const [workOrdersSubTab, setWorkOrdersSubTab] = useState<'active' | 'completed'>('active');
  const [requestForm, setRequestForm] = useState({
    part_name: '',
    quantity: 1,
    reason: '',
    priority: 'medium',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data in parallel for better performance
        const [bookingsRes, requestsRes, partsRes] = await Promise.allSettled([
          apiBookings.getByMechanic(user.id),
          apiPartRequests.getMine(),
          apiCarParts.getAll()
        ]);
        
        const bookingsResponse = bookingsRes.status === 'fulfilled' ? bookingsRes.value : [];
        const allBookings = bookingsResponse.data || bookingsResponse;
        
        // Map bookings to WorkOrder format (already filtered by backend)
        const mechanicBookings = (Array.isArray(allBookings) ? allBookings : []).map((booking: any) => ({
            id: booking.id,
            vehicleInfo: [booking.make, booking.model, booking.year].filter(Boolean).join(' ') + (booking.license_plate ? ` (${booking.license_plate})` : '') || 'Unknown Vehicle',
            customer: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown Customer',
            customerName: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown',
            customerEmail: booking.email || 'N/A',
            description: booking.service_name || 'Vehicle Service',
            serviceName: booking.service_name || 'Service',
            servicePrice: booking.service_price || booking.total_cost || 0,
            status: mapBookingStatusToWorkOrderStatus(booking.status),
            priority: booking.priority || 'medium',
            assignedDate: formatDateOnly(booking.created_at, new Date().toISOString().split('T')[0]),
            dueDate: formatDateOnly(booking.booking_datetime),
            bookingTime: formatTimeOnly(booking.booking_datetime),
            notes: booking.notes || '',
            partsNeeded: booking.parts_needed ? (typeof booking.parts_needed === 'string' ? booking.parts_needed.split(',').map((p: string) => p.trim()) : []) : [],
            services: booking.services,
            created_at: booking.created_at,
            updated_at: booking.updated_at
          }));
        
        setWorkOrders(mechanicBookings);

        // Set data from parallel requests
        const partRequests = requestsRes.status === 'fulfilled' ? (requestsRes.value?.data || requestsRes.value || []) : [];
        const availableParts = partsRes.status === 'fulfilled' ? (partsRes.value?.data || partsRes.value || []) : [];

        setPartRequests(partRequests);
        setAvailableParts(availableParts);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleStartWork = async (orderId: number) => {
    try {
      await apiBookings.update(orderId.toString(), { status: 'in-progress' });
      const updated = workOrders.map(wo => 
        wo.id === orderId ? { ...wo, status: 'in-progress' as const } : wo
      );
      setWorkOrders(updated);
      setSuccess('Work status updated successfully');
    } catch (err) {
      console.error('Error starting work:', err);
      setError('Failed to update work status');
    }
  };

  const handleRequestParts = async (orderId: number) => {
    try {
      await apiBookings.update(orderId.toString(), { status: 'awaiting-parts' });
      const updated = workOrders.map(wo => 
        wo.id === orderId ? { ...wo, status: 'awaiting-parts' as const } : wo
      );
      setWorkOrders(updated);
    } catch (err) {
      console.error('Error requesting parts:', err);
      setError('Failed to update status');
    }
  };

  const handleCompleteWork = async (orderId: number) => {
    try {
      await apiBookings.update(orderId.toString(), { status: 'completed' });
      const updated = workOrders.map(wo => 
        wo.id === orderId ? { ...wo, status: 'completed' as const } : wo
      );
      setWorkOrders(updated);
      setSuccess('Work completed successfully!');
    } catch (err) {
      console.error('Error completing work:', err);
      setError('Failed to complete work');
    }
  };

  const handleCreatePartRequest = async () => {
    try {
      if (!selectedBooking || !requestForm.part_name || !requestForm.quantity) {
        setError('Please fill in all required fields');
        return;
      }

      // Find the part ID from the selected part name
      const selectedPart = availableParts.find((p: any) => (p.name || p.id) === requestForm.part_name);
      const partId = selectedPart?.id;

      console.log('Creating part request:', {
        booking_id: selectedBooking,
        part_name: requestForm.part_name,
        part_id: partId,
        quantity: requestForm.quantity,
        priority: requestForm.priority,
        reason: requestForm.reason,
      });

      const response = await apiPartRequests.create({
        booking_id: selectedBooking,
        part_name: requestForm.part_name,
        part_id: partId,
        quantity: parseInt(requestForm.quantity.toString()),
        reason: requestForm.reason,
        priority: requestForm.priority,
      });

      console.log('Part request response:', response);

  // Re-fetch from API to get full data (includes customer name, service name from JOINs)
  const updated = await apiPartRequests.getMine();
  setPartRequests(Array.isArray(updated) ? updated : (updated?.data || []));

      // mark the booking as awaiting parts (on hold)
      if (selectedBooking) {
        try {
          await handleRequestParts(selectedBooking);
        } catch (err) {
          console.warn('Failed to mark booking as awaiting-parts', err);
        }
      }

      setShowRequestDialog(false);
      setSelectedBooking(null);
      setRequestForm({
        part_name: '',
        quantity: 1,
        reason: '',
        priority: 'medium',
      });
      setSuccess('Part request created successfully!');
    } catch (err: any) {
      console.error('Error creating part request:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      setError(`Failed to create part request: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeletePartRequest = (requestId: number) => {
    setDeleteConfirmRequestId(requestId);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePartRequest = async (requestId: number) => {
    try {
      await apiPartRequests.delete(requestId.toString());
      setPartRequests(partRequests.filter(pr => pr.id !== requestId));
      setSuccess('Part request deleted successfully!');
    } catch (err) {
      console.error('Error deleting part request:', err);
      setError('Failed to delete part request');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteConfirmRequestId(null);
    }
  };

  // Apply search and filter to work orders
  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = (wo.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (wo.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wo.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = filteredOrders.filter(wo => wo.status !== 'completed');
  const completedOrders = filteredOrders.filter(wo => wo.status === 'completed');

  // Chart data — available to both OverviewTab and downloadFullReportPDF
  const chartServiceCount: Record<string, number> = {};
  workOrders.forEach(o => {
    const svc = o.serviceName || o.description || 'General';
    chartServiceCount[svc] = (chartServiceCount[svc] || 0) + 1;
  });
  const statusDistributionData = [
    { name: 'Assigned', value: workOrders.filter(o => o.status === 'assigned').length, color: '#3b82f6' },
    { name: 'Awaiting Parts', value: workOrders.filter(o => o.status === 'awaiting-parts').length, color: '#f59e0b' },
    { name: 'Completed', value: workOrders.filter(o => o.status === 'completed').length, color: '#10b981' }
  ].filter(item => item.value > 0);
  const servicePerformanceData = Object.entries(chartServiceCount)
    .map(([name, jobs]) => {
      const revenue = workOrders
        .filter(o => (o.serviceName || o.description || 'General') === name)
        .reduce((sum, o) => sum + (parseFloat(String(o.servicePrice || 0)) || 0), 0);
      return { name: name.length > 14 ? `${name.slice(0, 14)}...` : name, jobs, revenue: Math.round(revenue) };
    })
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 6);
  const overviewMonthKeys = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i), 1);
    date.setHours(0, 0, 0, 0);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('en-US', { month: 'short' })
    };
  });
  const monthlyWorkloadData = overviewMonthKeys.map(({ key, label }) => {
    const monthlyOrders = workOrders.filter(o => {
      if (!o.assignedDate) return false;
      const d = new Date(o.assignedDate);
      if (Number.isNaN(d.getTime())) return false;
      const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return dKey === key;
    });
    return {
      month: label,
      assigned: monthlyOrders.length,
      completed: monthlyOrders.filter(o => o.status === 'completed').length
    };
  });
  const completionTrendData = Array.from({ length: 6 }, (_, index) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((5 - index) * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const weeklyOrders = workOrders.filter(order => {
      const sourceDate = order.created_at || order.assignedDate || order.dueDate;
      if (!sourceDate) return false;
      const parsedDate = new Date(sourceDate);
      if (Number.isNaN(parsedDate.getTime())) return false;
      return parsedDate >= weekStart && parsedDate <= weekEnd;
    });
    return {
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: weeklyOrders.filter(order => order.status === 'completed').length,
      active: weeklyOrders.filter(order => order.status !== 'completed').length,
    };
  });

  const downloadWorkOrdersPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const today = new Date();
      const generated = today.toLocaleString();

      doc.setFontSize(16);
      doc.text('Mechanic Work Orders', 40, 40);
      doc.setFontSize(10);
      doc.text(`Generated: ${generated}`, 40, 58);
      doc.text(`Total Work Orders: ${filteredOrders.length}`, 40, 72);

      const tableBody = filteredOrders.map((order) => [
        String(order.id),
        order.customerName || 'N/A',
        order.serviceName || order.description || 'N/A',
        order.status.replace('-', ' '),
        order.priority,
        order.assignedDate || 'N/A',
        order.dueDate || 'N/A',
      ]);

      autoTable(doc, {
        startY: 88,
        head: [['ID', 'Customer', 'Service', 'Status', 'Priority', 'Assigned Date', 'Due Date']],
        body: tableBody,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [31, 41, 55] },
      });

      doc.save(`work-orders_${today.toISOString().split('T')[0]}.pdf`);
      setSuccess('Work orders PDF downloaded successfully.');
    } catch (err) {
      console.error('Error generating work orders PDF:', err);
      setError('Failed to download work orders PDF');
    }
  };

  const downloadFullReportPDF = async () => {
    try {
      const today = new Date();
      const generated = today.toLocaleString();
      const dateStr = today.toISOString().split('T')[0];
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const formatCurrency = (amount: number) => `GHS ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // ---- PDF chart-drawing helpers (draw directly from data, no DOM capture) ----
      const hexToRgb = (hex: string) => {
        const h = hex.replace('#', '');
        return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
      };

      const drawDonutChart = (
        data: { name: string; value: number; color: string }[],
        bx: number, by: number, bw: number, bh: number
      ) => {
        const total = data.reduce((s, d) => s + d.value, 0);
        if (total === 0) {
          doc.setFontSize(8); doc.setTextColor(150, 150, 150);
          doc.text('No data', bx + bw / 2, by + bh / 2, { align: 'center' }); return;
        }
        const cx = bx + bw * 0.40; const cy = by + bh * 0.52;
        const outerR = Math.min(bw, bh) * 0.32; const innerR = outerR * 0.55;
        let startAngle = -Math.PI / 2;
        data.forEach(item => {
          if (item.value <= 0) return;
          const sliceAngle = (item.value / total) * Math.PI * 2;
          const steps = Math.max(24, Math.ceil(sliceAngle * 20));
          const { r, g, b } = hexToRgb(item.color);
          const pts: number[][] = [];
          for (let i = 0; i <= steps; i++) {
            const a = startAngle + (sliceAngle * i / steps);
            pts.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]);
          }
          for (let i = steps; i >= 0; i--) {
            const a = startAngle + (sliceAngle * i / steps);
            pts.push([cx + innerR * Math.cos(a), cy + innerR * Math.sin(a)]);
          }
          const vectors: number[][] = [];
          for (let i = 1; i < pts.length; i++) {
            vectors.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
          }
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

      const drawLineChart = (
        data: { week: string; completed: number; active: number }[],
        bx: number, by: number, bw: number, bh: number
      ) => {
        const pad = { t: 20, r: 12, b: 26, l: 26 };
        const cx = bx + pad.l; const cy = by + pad.t;
        const cw = bw - pad.l - pad.r; const ch = bh - pad.t - pad.b;
        const maxVal = Math.max(...data.flatMap(d => [d.completed, d.active]), 1);
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
        for (let i = 0; i <= 4; i++) {
          const gy = cy + ch - (ch * i / 4);
          doc.line(cx, gy, cx + cw, gy);
          doc.setFontSize(6); doc.setTextColor(160, 160, 160);
          doc.text(String(Math.round(maxVal * i / 4)), cx - 3, gy + 2, { align: 'right' });
        }
        const pt = (idx: number, val: number) => ({
          px: cx + (data.length > 1 ? (idx / (data.length - 1)) * cw : cw / 2),
          py: cy + ch - (val / maxVal) * ch
        });
        const drawSeries = (cr: number, cg: number, cb: number, key: 'completed' | 'active') => {
          doc.setDrawColor(cr, cg, cb); doc.setLineWidth(1.5);
          for (let i = 1; i < data.length; i++) {
            const p1 = pt(i - 1, data[i - 1][key]); const p2 = pt(i, data[i][key]);
            doc.line(p1.px, p1.py, p2.px, p2.py);
          }
          doc.setFillColor(cr, cg, cb);
          data.forEach((d, i) => { const { px, py } = pt(i, d[key]); doc.circle(px, py, 2, 'F'); });
        };
        drawSeries(16, 185, 129, 'completed');
        drawSeries(245, 158, 11, 'active');
        data.forEach((d, i) => {
          const { px } = pt(i, 0);
          doc.setFontSize(6); doc.setTextColor(130, 130, 130);
          doc.text(d.week.slice(0, 6), px, cy + ch + 10, { align: 'center' });
        });
        doc.setFillColor(16, 185, 129); doc.rect(bx + bw - 92, by + 4, 7, 6, 'F');
        doc.setFontSize(7); doc.setTextColor(50, 50, 50); doc.text('Completed', bx + bw - 82, by + 9);
        doc.setFillColor(245, 158, 11); doc.rect(bx + bw - 38, by + 4, 7, 6, 'F');
        doc.text('Active', bx + bw - 28, by + 9);
      };

      const drawBarChart = (
        data: { name: string; jobs: number }[],
        bx: number, by: number, bw: number, bh: number
      ) => {
        if (data.length === 0) {
          doc.setFontSize(8); doc.setTextColor(150, 150, 150);
          doc.text('No data', bx + bw / 2, by + bh / 2, { align: 'center' }); return;
        }
        const pad = { t: 20, r: 12, b: 28, l: 26 };
        const cx = bx + pad.l; const cy = by + pad.t;
        const cw = bw - pad.l - pad.r; const ch = bh - pad.t - pad.b;
        const maxJobs = Math.max(...data.map(d => d.jobs), 1);
        const gw = cw / data.length; const barW = gw * 0.6;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
        for (let i = 0; i <= 4; i++) {
          const gy = cy + ch - (ch * i / 4);
          doc.line(cx, gy, cx + cw, gy);
          doc.setFontSize(6); doc.setTextColor(160, 160, 160);
          doc.text(String(Math.round(maxJobs * i / 4)), cx - 3, gy + 2, { align: 'right' });
        }
        data.forEach((item, idx) => {
          const barX = cx + idx * gw + (gw - barW) / 2;
          const barH = (item.jobs / maxJobs) * ch;
          doc.setFillColor(16, 185, 129);
          doc.rect(barX, cy + ch - barH, barW, barH, 'F');
          if (barH > 10) {
            doc.setFontSize(6); doc.setTextColor(50, 50, 50);
            doc.text(String(item.jobs), barX + barW / 2, cy + ch - barH - 2, { align: 'center' });
          }
          doc.setFontSize(5.5); doc.setTextColor(100, 100, 100);
          const lbl = item.name.length > 8 ? item.name.slice(0, 8) : item.name;
          doc.text(lbl, barX + barW / 2, cy + ch + 10, { align: 'center' });
        });
        doc.setFillColor(16, 185, 129); doc.rect(bx + bw - 42, by + 4, 7, 6, 'F');
        doc.setFontSize(7); doc.setTextColor(50, 50, 50); doc.text('Jobs', bx + bw - 32, by + 9);
      };

      const drawAreaChart = (
        data: { month: string; assigned: number; completed: number }[],
        bx: number, by: number, bw: number, bh: number
      ) => {
        const pad = { t: 20, r: 12, b: 26, l: 26 };
        const cx = bx + pad.l; const cy = by + pad.t;
        const cw = bw - pad.l - pad.r; const ch = bh - pad.t - pad.b;
        const maxVal = Math.max(...data.flatMap(d => [d.assigned, d.completed]), 1);
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
        for (let i = 0; i <= 4; i++) {
          const gy = cy + ch - (ch * i / 4);
          doc.line(cx, gy, cx + cw, gy);
          doc.setFontSize(6); doc.setTextColor(160, 160, 160);
          doc.text(String(Math.round(maxVal * i / 4)), cx - 3, gy + 2, { align: 'right' });
        }
        const pt = (idx: number, val: number) => ({
          px: cx + (data.length > 1 ? (idx / (data.length - 1)) * cw : cw / 2),
          py: cy + ch - (val / maxVal) * ch
        });
        const drawSeries = (cr: number, cg: number, cb: number, key: 'assigned' | 'completed') => {
          doc.setDrawColor(cr, cg, cb); doc.setLineWidth(1.5);
          for (let i = 1; i < data.length; i++) {
            const p1 = pt(i - 1, data[i - 1][key]); const p2 = pt(i, data[i][key]);
            doc.line(p1.px, p1.py, p2.px, p2.py);
          }
          doc.setFillColor(cr, cg, cb);
          data.forEach((d, i) => { const { px, py } = pt(i, d[key]); doc.circle(px, py, 2, 'F'); });
        };
        drawSeries(59, 130, 246, 'assigned');
        drawSeries(16, 185, 129, 'completed');
        data.forEach((d, i) => {
          const { px } = pt(i, 0);
          doc.setFontSize(6); doc.setTextColor(130, 130, 130);
          doc.text(d.month, px, cy + ch + 10, { align: 'center' });
        });
        doc.setFillColor(59, 130, 246); doc.rect(bx + bw - 92, by + 4, 7, 6, 'F');
        doc.setFontSize(7); doc.setTextColor(50, 50, 50); doc.text('Assigned', bx + bw - 82, by + 9);
        doc.setFillColor(16, 185, 129); doc.rect(bx + bw - 40, by + 4, 7, 6, 'F');
        doc.text('Completed', bx + bw - 30, by + 9);
      };
      // ---- end helpers ----

      const totalJobs = workOrders.length;
      const activeCount = workOrders.filter(o => o.status !== 'completed').length;
      const completedCount = workOrders.filter(o => o.status === 'completed').length;
      const awaitingPartsCount = workOrders.filter(o => o.status === 'awaiting-parts').length;
      const inProgressCount = workOrders.filter(o => o.status === 'in-progress').length;
      const highPriorityCount = workOrders.filter(o => o.priority === 'high').length;
      const completionRate = totalJobs > 0 ? Math.round((completedCount / totalJobs) * 100) : 0;
      const totalRevenue = workOrders.reduce((sum, o) => sum + (parseFloat(String(o.servicePrice || 0)) || 0), 0);

      doc.setFontSize(18);
      doc.text('Mechanic Work Report', 40, 40);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Mechanic: ${user.name} • ID: ${user.id} • ${user.email}`, 40, 58);
      doc.text(`Generated: ${generated}`, 40, 72);
      doc.text(today.toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 620, 58, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      autoTable(doc, {
        startY: 92,
        head: [['Metric', 'Value']],
        body: [
          ['Total Work Orders', String(totalJobs)],
          ['Active Jobs', String(activeCount)],
          ['Completed', String(completedCount)],
          ['In Progress', String(inProgressCount)],
          ['Awaiting Parts', String(awaitingPartsCount)],
          ['High Priority', String(highPriorityCount)],
          ['Completion Rate', `${completionRate}%`],
          ['Part Requests', String(partRequests.length)],
          ['Total Revenue', formatCurrency(totalRevenue)],
        ],
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 180 }, 1: { cellWidth: 180 } },
        margin: { left: 40, right: 40 },
      });

      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Analytics & Charts', 40, 40);

      const chartTitles = [
        'Status Distribution',
        'Completion Trend',
        'Top Services Performance',
        '6-Month Workload Trend'
      ];
      const positions = [
        { x: 40, y: 60 },
        { x: 420, y: 60 },
        { x: 40, y: 300 },
        { x: 420, y: 300 },
      ];

      positions.forEach(({ x, y }, index) => {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, 340, 210, 10, 10, 'FD');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(chartTitles[index], x + 14, y + 18);
        doc.setTextColor(0, 0, 0);
        if (index === 0) drawDonutChart(statusDistributionData, x + 8, y + 24, 324, 178);
        else if (index === 1) drawLineChart(completionTrendData, x + 8, y + 24, 324, 178);
        else if (index === 2) drawBarChart(servicePerformanceData, x + 8, y + 24, 324, 178);
        else if (index === 3) drawAreaChart(monthlyWorkloadData, x + 8, y + 24, 324, 178);
      });

      const workOrderRows = workOrders.map(o => [
        String(o.id),
        o.customerName || 'N/A',
        o.serviceName || o.description || 'N/A',
        o.vehicleInfo || 'N/A',
        o.status.replace(/-/g, ' '),
        o.priority,
        o.assignedDate || 'N/A',
        o.dueDate || 'N/A',
        formatCurrency(parseFloat(String(o.servicePrice || 0)) || 0),
      ]);

      doc.addPage();
      doc.setFontSize(14);
      doc.text(`Work Orders (${workOrders.length})`, 40, 40);
      autoTable(doc, {
        startY: 58,
        head: [['ID', 'Customer', 'Service', 'Vehicle', 'Status', 'Priority', 'Assigned', 'Due Date', 'Price']],
        body: workOrderRows.length > 0 ? workOrderRows : [['No work orders found', '', '', '', '', '', '', '', '']],
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 30, right: 30 },
      });

      const partRows = partRequests.map(r => [
        String(r.id),
        String(r.booking_id),
        r.part_name,
        String(r.quantity),
        r.priority,
        r.status,
        `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'N/A',
        r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
      ]);

      doc.addPage();
      doc.setFontSize(14);
      doc.text(`Part Requests (${partRequests.length})`, 40, 40);
      autoTable(doc, {
        startY: 58,
        head: [['ID', 'Booking', 'Part Name', 'Qty', 'Priority', 'Status', 'Customer', 'Date']],
        body: partRows.length > 0 ? partRows : [['No part requests found', '', '', '', '', '', '', '']],
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 40, right: 40 },
      });

      doc.save(`mechanic_full_report_${dateStr}.pdf`);
      setSuccess('Full report PDF downloaded successfully.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error generating full report:', {
        error: err,
        message: errorMsg,
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(`Failed to generate full report: ${errorMsg}`);
    }
  };

  // Print part requests list for paper/export to PDF
  const printPartRequestsList = () => {
    const escapeHtml = (value: string) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const rows = partRequests.map((req) => {
      const customer = `${req.first_name || ''} ${req.last_name || ''}`.trim() || 'N/A';
      const service = req.service_name || `Booking #${req.booking_id}`;
      const created = req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A';
      return `
        <tr>
          <td>${req.id}</td>
          <td>${escapeHtml(req.part_name)}</td>
          <td>${req.quantity}</td>
          <td>${escapeHtml(customer)}</td>
          <td>${escapeHtml(service)}</td>
          <td style="text-transform: capitalize;">${escapeHtml(req.priority)}</td>
          <td style="text-transform: capitalize;">${escapeHtml(req.status)}</td>
          <td>${escapeHtml(created)}</td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) {
      setError('Unable to open print window. Please allow popups and try again.');
      return;
    }

    const today = new Date().toLocaleString();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Part Requests List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          h1 { margin: 0 0 6px; font-size: 22px; }
          p { margin: 0 0 14px; color: #4b5563; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          th { background: #f3f4f6; font-weight: 700; }
          .empty { margin-top: 12px; color: #6b7280; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>Mechanic Part Requests</h1>
        <p>Generated: ${escapeHtml(today)} | Total Requests: ${partRequests.length}</p>
        ${partRequests.length > 0
          ? `<table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Part</th>
                  <th>Qty</th>
                  <th>Customer</th>
                  <th>Service/Booking</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>`
          : '<p class="empty">No part requests to print.</p>'}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Calendar Component
  const CalendarView = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Group jobs by date string
    const jobsByDate = useMemo(() => {
      return workOrders.reduce((acc, order) => {
        const dueDate = new Date(order.dueDate);
        if (Number.isNaN(dueDate.getTime())) {
          return acc;
        }
        const key = dueDate.toDateString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(order);
        return acc;
      }, {} as Record<string, typeof workOrders>);
    }, [workOrders]);

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const monthName = firstDayOfMonth.toLocaleString('default', { month: 'long' });

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    // Default selected = first day with jobs, or today
    const defaultSelectedKey = Object.keys(jobsByDate)[0] || today.toDateString();
    const selectedDateObj = new Date(
      selectedDate && !Number.isNaN(new Date(selectedDate).getTime())
        ? selectedDate
        : defaultSelectedKey
    );
    const jobsForSelected = jobsByDate[selectedDateObj.toDateString()] || [];

    const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' });
    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handlePrevMonth = () => {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
      else setCurrentMonth(m => m - 1);
    };
    const handleNextMonth = () => {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
      else setCurrentMonth(m => m + 1);
    };
    const handleDateClick = (day: number) => {
      setSelectedDate(new Date(currentYear, currentMonth, day).toDateString());
    };

    return (
      <div className="w-full">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">next job</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              {getDayName(selectedDateObj)}, {selectedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">jobs</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{jobsForSelected.length}</p>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{monthName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{currentYear}</span>
          </div>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Two-column layout: calendar + jobs list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Calendar Grid */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1">{day}</div>
              ))}
            </div>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calendarDays.map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;
                const dateObj = new Date(currentYear, currentMonth, day);
                const dateKey = dateObj.toDateString();
                const hasJobs = jobsByDate[dateKey];
                const isSelected = dateKey === (selectedDate || defaultSelectedKey);
                const isToday = dateKey === today.toDateString();
                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square flex flex-col items-center justify-center rounded text-xs font-semibold transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-black shadow scale-105 border border-yellow-500'
                        : isToday
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow border border-blue-600'
                        : hasJobs
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100 hover:bg-blue-200 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                    }`}
                  >
                    {day}
                    {hasJobs && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {Array.from({ length: Math.min(hasJobs.length, 2) }).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black' : isToday ? 'bg-white' : 'bg-blue-500'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400 border border-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-300" />
                <span className="text-gray-600 dark:text-gray-400">Has jobs</span>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex flex-col">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              {jobsForSelected.length > 0
                ? `${jobsForSelected.length} job${jobsForSelected.length !== 1 ? 's' : ''} — ${selectedDateObj.toLocaleDateString()}`
                : `No jobs — ${selectedDateObj.toLocaleDateString()}`}
            </h4>
            {jobsForSelected.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {jobsForSelected.map((job) => (
                  <div key={job.id} className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {job.serviceName || job.description || 'Car Service'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {job.customerName} {job.dueDate ? '· ' + formatTime(job.dueDate) : ''}
                        </p>
                      </div>
                      {job.servicePrice && (
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                          GH₵{parseFloat(String(job.servicePrice)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-4">
                  <Calendar className="h-7 w-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">No jobs on this date</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Overview Tab Component
  const OverviewTab = () => {
    const totalJobs = workOrders.length;
    const completionRate = totalJobs > 0 ? Math.round((completedOrders.length / totalJobs) * 100) : 0;
    const totalRevenue = workOrders.reduce((s, o) => s + (parseFloat(String(o.servicePrice || 0)) || 0), 0);

    // Derive specialization from most common service type
    const serviceCount: Record<string, number> = {};
    workOrders.forEach(o => { const svc = o.serviceName || o.description || 'General'; serviceCount[svc] = (serviceCount[svc] || 0) + 1; });
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Mechanic';
    const specialization = topService;

    // Service performance and trend datasets for overview charts.
    const servicePerformanceData = Object.entries(serviceCount)
      .map(([name, jobs]) => {
        const revenue = workOrders
          .filter(o => (o.serviceName || o.description || 'General') === name)
          .reduce((sum, o) => sum + (parseFloat(String(o.servicePrice || 0)) || 0), 0);
        return { name: name.length > 14 ? `${name.slice(0, 14)}...` : name, jobs, revenue: Math.round(revenue) };
      })
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 6);

    const monthKeys = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i), 1);
      date.setHours(0, 0, 0, 0);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleString('en-US', { month: 'short' })
      };
    });

    const monthlyWorkloadData = monthKeys.map(({ key, label }) => {
      const monthlyOrders = workOrders.filter(o => {
        if (!o.assignedDate) return false;
        const d = new Date(o.assignedDate);
        if (Number.isNaN(d.getTime())) return false;
        const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return dKey === key;
      });
      return {
        month: label,
        assigned: monthlyOrders.length,
        completed: monthlyOrders.filter(o => o.status === 'completed').length
      };
    });

    const completionTrendData = Array.from({ length: 6 }, (_, index) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - ((5 - index) * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weeklyOrders = workOrders.filter(order => {
        const sourceDate = order.created_at || order.assignedDate || order.dueDate;
        if (!sourceDate) return false;

        const parsedDate = new Date(sourceDate);
        if (Number.isNaN(parsedDate.getTime())) return false;

        return parsedDate >= weekStart && parsedDate <= weekEnd;
      });

      return {
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: weeklyOrders.filter(order => order.status === 'completed').length,
        active: weeklyOrders.filter(order => order.status !== 'completed').length,
      };
    });

    const statusDistributionData = [
      { name: 'Assigned', value: workOrders.filter(o => o.status === 'assigned').length, color: '#3b82f6' },
      { name: 'Awaiting Parts', value: workOrders.filter(o => o.status === 'awaiting-parts').length, color: '#f59e0b' },
      { name: 'Completed', value: workOrders.filter(o => o.status === 'completed').length, color: '#10b981' }
    ].filter(item => item.value > 0);

    return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Orders Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage your assigned work orders and track progress</p>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap" onClick={downloadFullReportPDF}>
          <Download size={18} /> Download Full Report
        </Button>
      </div>

      {/* Stats Grid */}
      {(() => {
        const metrics = [
          { label: 'Active Jobs', value: activeOrders.filter(o => o.status === 'in-progress' || o.status === 'assigned').length, icon: Wrench, accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'Completed', value: completedOrders.length, icon: CheckCircle2, accent: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
          { label: 'Awaiting Parts', value: workOrders.filter(o => o.status === 'awaiting-parts').length, icon: Package, accent: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
          { label: 'High Priority', value: workOrders.filter(o => o.priority === 'high').length, icon: Zap, accent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, accent: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
          { label: 'Total Revenue', value: `GH₵${totalRevenue.toFixed(0)}`, icon: FileText, accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { label: 'Parts Requested', value: partRequests.length, icon: Package, accent: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
          { label: 'Specialization', value: specialization, icon: Wrench, accent: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', small: true },
          { label: 'Total Assigned', value: totalJobs, icon: AlertCircle, accent: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
        ];
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(({ label, value, icon: Icon, accent, small }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{label}</p>
                    {small
                      ? <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">{value}</p>
                      : <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
                    }
                  </div>
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${accent}`}><Icon className="w-5 h-5" /></div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Calendar View */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Scheduled Work</h3>
        </div>
        <CalendarView />
      </div>

      {/* Recent Orders Preview — consistent with admin collapsible card style */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Active Work Orders</h3>
        </div>
        <div className="px-5 py-4 space-y-2">
          {activeOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No active work orders.</p>
          ) : activeOrders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  order.status === 'in-progress' ? 'bg-blue-500' :
                  order.status === 'assigned' ? 'bg-purple-500' :
                  'bg-amber-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{order.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.customerName} · {order.serviceName}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize flex-shrink-0 ml-3 ${
                order.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                order.status === 'assigned' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {order.status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Order Status Distribution - Pie Chart */}
        <div data-chart="status-distribution" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Status Distribution</h3>
          </div>
          {statusDistributionData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No status data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="42%"
                  label={false}
                  labelLine={false}
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={48} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Work Orders Completion Trend - Line Chart */}
        <div data-chart="completion-trend" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Completion Trend</h3>
          </div>
          {completionTrendData.every(item => item.completed === 0 && item.active === 0) ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No trend data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={completionTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis allowDecimals={false} stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="active" name="Active" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service Performance - Jobs and Revenue */}
        <div data-chart="service-performance" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Top Services Performance</h3>
          </div>
          {servicePerformanceData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No service data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={servicePerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="jobs" name="Jobs" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue (GHS)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Workload Trend */}
        <div data-chart="monthly-workload" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">6-Month Workload Trend</h3>
          </div>
          {monthlyWorkloadData.every(item => item.assigned === 0 && item.completed === 0) ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No workload data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyWorkloadData}>
                <defs>
                  <linearGradient id="assignedColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="completedColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis allowDecimals={false} stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="assigned" name="Assigned" stroke="#3b82f6" fill="url(#assignedColor)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#completedColor)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
    );
  };

  // Work Orders Tab Component
  const WorkOrdersTab = () => {
    const isActiveSubTab = workOrdersSubTab === 'active';

    return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View and manage all your assigned work orders</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input 
          placeholder="Search by customer or service..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="awaiting-parts">Awaiting Parts</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Active / Completed sub tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          type="button"
          onClick={() => setWorkOrdersSubTab('active')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isActiveSubTab
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Active Work ({activeOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setWorkOrdersSubTab('completed')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            !isActiveSubTab
              ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Completed Work ({completedOrders.length})
        </button>
      </div>

      {/* Active Orders Section */}
      {isActiveSubTab && (
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Active Orders ({activeOrders.length})</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading work orders...</div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-gray-500 dark:text-gray-400">No active work orders</div>
          ) : (
            activeOrders.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">#{order.id}: {order.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.customerName}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      order.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      order.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {order.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Service</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.serviceName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 capitalize">{order.status.replace('-', ' ')}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Price</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">GH₵{order.servicePrice || 'N/A'}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                  {order.status === 'assigned' && (
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold flex items-center gap-2" onClick={() => handleStartWork(order.id)}>
                      <Wrench size={16} /> Start Work
                    </Button>
                  )}
                  {order.status === 'in-progress' && (
                    <>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center gap-2" onClick={() => {
                        setSelectedBooking(order.id);
                        setShowRequestDialog(true);
                      }}>
                        <Package size={16} /> Request Parts
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center gap-2" onClick={() => handleCompleteWork(order.id)}>
                        <CheckCircle2 size={16} /> Complete
                      </Button>
                    </>
                  )}
                  {order.status === 'awaiting-parts' && (
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold flex items-center gap-2" onClick={() => handleStartWork(order.id)}>
                      <Wrench size={16} /> Resume
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* Completed Orders Section */}
      {!isActiveSubTab && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Completed Jobs</h3>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full font-semibold">{completedOrders.length}</span>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading completed work...</div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-gray-500 dark:text-gray-400">No completed work orders</div>
            ) : completedOrders.map(order => (
              <div key={order.id} className="bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">#{order.id}: {order.serviceName || order.description}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerName} · Due: {order.dueDate}</p>
                    {order.notes && <p className="text-xs text-gray-400 mt-1 italic truncate">"{order.notes}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">✓ Done</span>
                    {order.servicePrice && (
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">GH₵{order.servicePrice}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  };

  // Part Requests Tab Component
  const PartRequestsTab = () => (
    <div className="space-y-6 pb-8">
      <div className="flex items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Part Requests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Parts you've requested for customer jobs — request parts from within a work order
          </p>
        </div>
      </div>

      {partRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <Package className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={40} />
          <p className="text-gray-500 dark:text-gray-400">No part requests yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Requests made from work orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {partRequests.map(req => {
            const customerName = req.first_name || req.last_name
              ? `${req.first_name || ''} ${req.last_name || ''}`.trim()
              : null;
            const statusColors: Record<string, string> = {
              fulfilled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
              rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              requested: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            };
            return (
              <div key={req.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{req.part_name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        {customerName && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Customer: <span className="font-semibold text-gray-700 dark:text-gray-300">{customerName}</span>
                          </span>
                        )}
                        {req.service_name && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Service: <span className="font-semibold text-gray-700 dark:text-gray-300">{req.service_name}</span>
                          </span>
                        )}
                        {!customerName && !req.service_name && (
                          <span className="text-xs text-gray-400">Job #{req.booking_id}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                        <span className="text-xs text-gray-400">Qty: <span className="font-semibold text-gray-700 dark:text-gray-300">{req.quantity}</span></span>
                        <span className={`text-xs font-semibold ${
                          req.priority === 'high' ? 'text-rose-600 dark:text-rose-400' :
                          req.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>{req.priority} priority</span>
                        <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                      {req.reason && (
                        <p className="text-xs text-gray-400 mt-1.5 italic truncate">"{req.reason}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[req.status] || statusColors.requested}`}>
                      {req.status}
                    </span>
                    <button
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                      onClick={() => handleDeletePartRequest(req.id)}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <TailAdminLayout
      user={user}
      onLogout={onLogout}
      title="Mechanic Dashboard"
      menuItems={[
        { label: 'Overview', icon: LayoutDashboard, active: activeTab === 'overview', onClick: () => setActiveTab('overview') },
        { label: 'Work Orders', icon: ClipboardList, active: activeTab === 'work-orders', onClick: () => setActiveTab('work-orders') },
        { label: 'Part Requests', icon: Package, active: activeTab === 'part-requests', onClick: () => setActiveTab('part-requests') },
      ]}
    >
      <div className="p-6 sm:p-8">
        {/* SweetAlert Notifications */}
        {error && <SweetAlert type="error" message={error} duration={3000} onClose={() => setError(null)} />}
        {success && <SweetAlert type="success" message={success} duration={3000} onClose={() => setSuccess(null)} />}

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'work-orders' && <WorkOrdersTab />}
        {activeTab === 'part-requests' && <PartRequestsTab />}

        {/* Part Request Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Parts</DialogTitle>
              <DialogDescription>
                Submit a new parts request for your work order
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!selectedBooking && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Work Order *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={selectedBooking ?? ''}
                    onChange={(e) => setSelectedBooking(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">Select a work order</option>
                    {workOrders.filter(o => o.status !== 'completed').map(order => (
                      <option key={order.id} value={order.id}>
                        #{order.id} — {order.serviceName || order.description || 'Work Order'} ({order.customerName || 'Customer'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Select Part *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={requestForm.part_name}
                  onChange={(e) => setRequestForm({ ...requestForm, part_name: e.target.value })}
                >
                  <option value="">Choose a part…</option>
                  {availableParts.map((part: AvailablePart) => (
                    <option key={part.id} value={part.name}>
                      {part.name}{part.category ? ` — ${part.category}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Quantity *</label>
                <Input
                  type="number"
                  min="1"
                  value={requestForm.quantity}
                  onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Reason</label>
                <textarea
                  placeholder="Why do you need this part?"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                  onClick={() => {
                    handleCreatePartRequest().then(() => {
                      setShowRequestDialog(false);
                      setRequestForm({ part_name: '', quantity: 1, reason: '', priority: 'medium' });
                    });
                  }}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deleteConfirmRequestId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 md:p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete this part request? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmRequestId(null);
                  }}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white text-sm"
                  onClick={() => {
                    if (deleteConfirmRequestId) {
                      confirmDeletePartRequest(deleteConfirmRequestId);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TailAdminLayout>
  );
}
