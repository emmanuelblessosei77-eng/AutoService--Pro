import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { users as apiUsers, vehicles as apiVehicles, bookings as apiBookings } from '../../services/api';
import {
  UserDashboardData,
  Vehicle,
  ServiceRecord,
  ServiceBooking,
  ServiceRequest,
  Payment,
  Invoice,
  Notification,
  UserProfile,
} from '../types/dashboard';

interface DashboardContextType {
  data: UserDashboardData | null;
  loading: boolean;
  error: string | null;
  
  // Vehicle methods
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (vehicleId: string) => void;
  getVehicle: (vehicleId: string) => Vehicle | undefined;
  
  // Service Record methods
  getServiceRecords: () => ServiceRecord[];
  getServiceRecordsByVehicle: (vehicleId: string) => ServiceRecord[];
  getCompletedServices: () => ServiceRecord[];
  getOngoingServices: () => ServiceRecord[];
  
  // Booking methods
  addBooking: (booking: ServiceBooking) => void;
  updateBooking: (bookingId: string, updates: Partial<ServiceBooking>) => void;
  cancelBooking: (bookingId: string) => void;
  processRefund: (bookingId: string, refundAmount: number, refundNotes?: string) => void;
  deleteBooking: (bookingId: string) => void;
  getBookings: () => ServiceBooking[];
  getUpcomingBookings: () => ServiceBooking[];
  
  // Service Request methods
  addServiceRequest: (request: ServiceRequest) => void;
  updateServiceRequest: (requestId: string, updates: Partial<ServiceRequest>) => void;
  getServiceRequests: () => ServiceRequest[];
  
  // Payment methods
  getPayments: () => Payment[];
  getOutstandingPayments: () => Payment[];
  
  // Invoice methods
  getInvoices: () => Invoice[];
  downloadInvoice: (invoiceId: string) => void;
  
  // Notification methods
  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Profile methods
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  // Sync/Refresh
  syncData: () => Promise<void>;
  refreshBookings: (skipCache?: boolean) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, userId, initialData, forceRefresh }: {
  children: ReactNode;
  userId: string;
  initialData?: UserDashboardData;
  forceRefresh?: boolean;
}) {
  // Initialize with initialData first (freshly fetched from API), fall back to localStorage
  const [data, setData] = useState<UserDashboardData | null>(() => {
    console.log(`🔄 DashboardContext initializing for user ${userId}`);
    
    // Prefer initialData (freshly fetched from API) over stale localStorage
    if (initialData) {
      console.log(`📦 Using fresh initialData with ${initialData.vehicles?.length || 0} vehicles`);
      console.log(`📦 initialData has ${initialData.bookings?.length || 0} bookings`);
      if (initialData.bookings && initialData.bookings.length > 0) {
        console.log(`   First 3 bookings:`, initialData.bookings.slice(0, 3).map(b => `#${b.id}`).join(', '));
        console.log(`   Last 3 bookings:`, initialData.bookings.slice(-3).map(b => `#${b.id}`).join(', '));
      }
      return initialData;
    }
    
    // Fall back to localStorage if initialData not provided
    try {
      const savedData = localStorage.getItem(`dashboard_${userId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log(`✓ Loaded from localStorage: ${parsed.vehicles?.length || 0} vehicles`);
        return parsed;
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
    
    console.log('⚠️  No data available, initializing empty');
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update localStorage when initialData changes (on user login/change)
  useEffect(() => {
    if (initialData) {
      console.log(`💾 Saving fresh initialData to localStorage: ${initialData.vehicles?.length || 0} vehicles`);
      try {
        localStorage.setItem(`dashboard_${userId}`, JSON.stringify(initialData));
        setData(initialData);
      } catch (err) {
        console.error('Failed to save initialData to localStorage:', err);
      }
    }
  }, [userId, initialData]);

  // Sync data from localStorage (exported function)
  const syncData = useCallback(async () => {
    setLoading(true);
    try {
      const savedData = localStorage.getItem(`dashboard_${userId}`);
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } catch (err) {
      setError('Failed to sync data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // When userId changes (e.g. user logs in), attempt to load their dashboard data
  useEffect(() => {
    if (!userId) return;
    // If initialData was provided we already saved it; otherwise try to sync from localStorage
    if (!initialData) {
      syncData();
    }
  }, [userId, initialData, syncData]);

  // Attempt to load fresh dashboard data from backend when a user logs in
  useEffect(() => {
    if (!userId) return;

    const loadFromBackend = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🔁 Loading dashboard data from backend for user ${userId}`);

        const [profileRes, vehiclesRes, bookingsRes] = await Promise.all([
          apiUsers.getProfile(),
          apiVehicles.getByUser(userId),
          apiBookings.getByUser(userId, forceRefresh),
        ]);

        // Get locally stored data to merge with backend data
        let localData: UserDashboardData | null = null;
        try {
          const savedData = localStorage.getItem(`dashboard_${userId}`);
          if (savedData) {
            localData = JSON.parse(savedData);
          }
        } catch (err) {
          console.warn('Failed to load local data for merge:', err);
        }

        // Merge vehicles: backend vehicles + any local vehicles not on backend
        const backendVehicles = Array.isArray(vehiclesRes) ? vehiclesRes : [];
        let mergedVehicles = [...backendVehicles];
        
        if (localData?.vehicles) {
          const backendIds = new Set(backendVehicles.map(v => String(v.id)));
          const localOnlyVehicles = localData.vehicles.filter(v => !backendIds.has(String(v.id)));
          mergedVehicles = [...backendVehicles, ...localOnlyVehicles];
          if (localOnlyVehicles.length > 0) {
            console.log(`✅ Merged ${localOnlyVehicles.length} local vehicles with backend data`);
          }
        }

        // Merge bookings: backend bookings + any local bookings not on backend
        const backendBookings = Array.isArray(bookingsRes) ? bookingsRes : [];
        let mergedBookings = [...backendBookings];
        
        if (localData?.bookings) {
          const backendIds = new Set(backendBookings.map(b => String(b.id)));
          const localOnlyBookings = localData.bookings.filter(b => !backendIds.has(String(b.id)));
          mergedBookings = [...backendBookings, ...localOnlyBookings];
          if (localOnlyBookings.length > 0) {
            console.log(`✅ Merged ${localOnlyBookings.length} local bookings with backend data`);
          }
        }

        const completedCount = mergedBookings.filter((b: any) => b.status === 'completed').length;
        
        const freshData: UserDashboardData = {
          profile: profileRes || null,
          vehicles: mergedVehicles,
          bookings: mergedBookings,
          serviceRecords: [],
          serviceRequests: [],
          payments: [],
          invoices: [],
          notifications: [],
          stats: {
            totalVehicles: mergedVehicles.length,
            totalBookings: mergedBookings.length,
            completedServices: completedCount,
          },
        } as unknown as UserDashboardData;

        // Save and apply
        try {
          localStorage.setItem(`dashboard_${userId}`, JSON.stringify(freshData));
        } catch (err) {
          console.warn('Failed to persist dashboard data to localStorage:', err);
        }

        setData(freshData);
      } catch (err: any) {
        console.warn('Failed to load dashboard from backend:', err);
        setError('Failed to load dashboard data from server');
      } finally {
        setLoading(false);
      }
    };

    // Check for forceRefresh in both props AND URL params
    const urlForceRefresh = new URLSearchParams(window.location.search).get('forceRefresh') === '1';
    const shouldForceRefresh = forceRefresh || urlForceRefresh;

    // Only overwrite if we don't have initialData (server-provided) or we want fresh sync
    // (forceRefresh can be used to force a fresh refresh even when initialData exists)
    if (!initialData || shouldForceRefresh) {
      console.log(`⚠️  Loading from backend (initialData: ${!!initialData}, forceRefresh prop: ${forceRefresh}, URL param: ${urlForceRefresh})`);
      loadFromBackend();
      
      // Remove the forceRefresh query param from history after loading
      if (urlForceRefresh) {
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('forceRefresh');
          window.history.replaceState({}, '', url.toString());
        }, 100);
      }
    }
  }, [userId, initialData, forceRefresh]);

  // Watch for forceRefresh in URL (for payment redirects)
  useEffect(() => {
    const checkUrlForRefresh = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('forceRefresh') === '1' && userId) {
        console.log('🔔 Detected forceRefresh in URL - triggering immediate refresh');
        // Trigger refreshBookings by accessing it from refreshBookings function
        // (we'll set up this as a separate effect)
      }
    };

    window.addEventListener('load', checkUrlForRefresh);
    // Also check on next frame to catch rapid navigation
    const timer = setTimeout(checkUrlForRefresh, 50);

    return () => {
      window.removeEventListener('load', checkUrlForRefresh);
      clearTimeout(timer);
    };
  }, [userId]);

  // Save to localStorage
  const saveData = useCallback((newData: UserDashboardData) => {
    try {
      localStorage.setItem(`dashboard_${userId}`, JSON.stringify(newData));
      console.log(`💾 Saved dashboard data to localStorage: ${newData.vehicles?.length || 0} vehicles, ${newData.bookings?.length || 0} bookings`);
      setData(newData);
    } catch (err) {
      setError('Failed to save data');
      console.error('Failed to save to localStorage:', err);
    }
  }, [userId]);

  // Vehicle methods
  const addVehicle = (vehicle: Vehicle) => {
    const currentData = data || {
      profile: null,
      vehicles: [],
      bookings: [],
      serviceRecords: [],
      serviceRequests: [],
      payments: [],
      invoices: [],
      notifications: [],
      stats: { totalVehicles: 0, totalBookings: 0 },
    } as UserDashboardData;

    const updated = {
      ...currentData,
      vehicles: [...currentData.vehicles, vehicle],
      stats: {
        ...currentData.stats,
        totalVehicles: currentData.stats.totalVehicles + 1,
      },
    };
    console.log(`✅ Vehicle added to context: ${vehicle.id} (${vehicle.make} ${vehicle.model})`);
    console.log(`   Total vehicles now: ${updated.vehicles.length}`);
    saveData(updated);
  };

  const updateVehicle = (vehicleId: string, updates: Partial<Vehicle>) => {
    if (!data) return;
    const updated = {
      ...data,
      vehicles: data.vehicles.map(v => v.id === vehicleId ? { ...v, ...updates } : v),
    };
    saveData(updated);
  };

  const deleteVehicle = (vehicleId: string) => {
    if (!data) return;
    const updated = {
      ...data,
      vehicles: data.vehicles.filter(v => v.id !== vehicleId),
      stats: {
        ...data.stats,
        totalVehicles: Math.max(0, data.stats.totalVehicles - 1),
      },
    };
    saveData(updated);
  };

  const getVehicle = (vehicleId: string) => {
    return data?.vehicles.find(v => v.id === vehicleId);
  };

  // Service Record methods
  const getServiceRecords = () => data?.serviceRecords || [];

  const getServiceRecordsByVehicle = (vehicleId: string) => {
    return data?.serviceRecords.filter(s => s.vehicleId === vehicleId) || [];
  };

  const getCompletedServices = () => {
    return data?.serviceRecords.filter(s => s.status === 'completed') || [];
  };

  const getOngoingServices = () => {
    return data?.serviceRecords.filter(s => s.status === 'in-progress') || [];
  };

  // Booking methods
  const addBooking = (booking: ServiceBooking) => {
    const currentData = data || {
      profile: null,
      vehicles: [],
      bookings: [],
      serviceRecords: [],
      serviceRequests: [],
      payments: [],
      invoices: [],
      notifications: [],
      stats: { totalVehicles: 0, totalBookings: 0 },
    } as UserDashboardData;

    const updated = {
      ...currentData,
      bookings: [...currentData.bookings, booking],
      stats: {
        ...currentData.stats,
        totalBookings: currentData.stats.totalBookings + 1,
      },
    };
    console.log(`✅ Booking added to context: ${booking.id}`);
    console.log(`   Total bookings now: ${updated.bookings.length}`);
    saveData(updated);
  };

  const updateBooking = (bookingId: string, updates: Partial<ServiceBooking>) => {
    if (!data) return;
    const updated = {
      ...data,
      bookings: data.bookings.map(b => b.id === bookingId ? { ...b, ...updates } : b),
    };
    saveData(updated);
  };

  const cancelBooking = (bookingId: string) => {
    if (!data) return;
    // Prevent customer cancel if a mechanic has been assigned
    const target = data.bookings.find(b => String(b.id) === String(bookingId));
    if (target && (target.mechanic_assigned || (target.mechanic && (target.mechanic.id || target.mechanic))) ) {
      alert('This booking has been assigned to a mechanic and cannot be cancelled or rescheduled by the customer. Please contact support if you need changes.');
      return;
    }

    // Persist cancellation to backend then update local context
    (async () => {
      try {
        await apiBookings.update(bookingId, { status: 'cancelled' });
        console.log(`✅ Booking ${bookingId} cancelled on backend`);
      } catch (err) {
        console.warn(`Failed to cancel booking ${bookingId} on backend, will still mark locally`, err);
      }

      const updated = {
        ...data,
        bookings: data.bookings.map(b => {
          if (b.id === bookingId) {
            const cancelledBooking: ServiceBooking = {
              ...b,
              status: 'cancelled' as const,
            };

            if ((b as any).payment_status === 'completed' || (b as any).paymentStatus === 'paid') {
              (cancelledBooking as any).paymentStatus = 'refund_pending';
              (cancelledBooking as any).refundAmount = (b as any).amount || (b as any).amountPaid || 0;
            }

            return cancelledBooking;
          }
          return b;
        }),
      };
      saveData(updated);
      // Refresh bookings from backend to ensure consistency
      try { await refreshBookings(true); } catch (e) { console.warn('refreshBookings failed after cancel', e); }
    })();
  };

  const deleteBooking = (bookingId: string) => {
    if (!data) return;
    (async () => {
      try {
        await apiBookings.delete(bookingId);
        console.log(`✅ Booking ${bookingId} deleted on backend`);
      } catch (err) {
        console.warn(`Failed to delete booking ${bookingId} on backend, will still remove locally`, err);
      }

      const updated = {
        ...data,
        bookings: data.bookings.filter(b => b.id !== bookingId),
      };
      saveData(updated);
      try { await refreshBookings(true); } catch (e) { console.warn('refreshBookings failed after delete', e); }
    })();
  };

  const processRefund = (bookingId: string, refundAmount: number, refundNotes?: string) => {
    if (!data) return;
    const updated = {
      ...data,
      bookings: data.bookings.map(b =>
        b.id === bookingId
          ? {
              ...b,
              paymentStatus: 'refunded' as const,
              refundAmount,
              refundDate: new Date(),
              refundNotes: refundNotes || '',
            }
          : b
      ),
    };
    saveData(updated);
  };

  const getBookings = () => data?.bookings || [];

  const getUpcomingBookings = () => {
    const now = new Date();
    return data?.bookings.filter(
      b => b.status === 'scheduled' && new Date(b.scheduledDate) > now
    ) || [];
  };

  // Service Request methods
  const addServiceRequest = (request: ServiceRequest) => {
    if (!data) return;
    const updated = {
      ...data,
      serviceRequests: [...data.serviceRequests, request],
    };
    saveData(updated);
  };

  const updateServiceRequest = (requestId: string, updates: Partial<ServiceRequest>) => {
    if (!data) return;
    const updated = {
      ...data,
      serviceRequests: data.serviceRequests.map(r =>
        r.id === requestId ? { ...r, ...updates } : r
      ),
    };
    saveData(updated);
  };

  const getServiceRequests = () => data?.serviceRequests || [];

  // Payment methods
  const getPayments = () => data?.payments || [];

  const getOutstandingPayments = () => {
    return data?.payments.filter(p => p.status === 'pending') || [];
  };

  // Invoice methods
  const getInvoices = () => data?.invoices || [];

  const downloadInvoice = (invoiceId: string) => {
    const invoice = data?.invoices.find(i => i.id === invoiceId);
    if (invoice && invoice.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank');
    }
  };

  // Notification methods
  const getNotifications = () => data?.notifications || [];

  const getUnreadNotifications = () => {
    return data?.notifications.filter(n => !n.read) || [];
  };

  const markAsRead = (notificationId: string) => {
    if (!data) return;
    const updated = {
      ...data,
      notifications: data.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    };
    saveData(updated);
  };

  const clearNotifications = () => {
    if (!data) return;
    const updated = {
      ...data,
      notifications: [],
    };
    saveData(updated);
  };

  // Profile methods
  const updateProfile = (profile: Partial<UserProfile>) => {
    if (!data) return;
    const updated = {
      ...data,
      profile: { ...data.profile, ...profile } as UserProfile,
    };
    saveData(updated);
  };

  // Refresh bookings from backend (useful after payment or other changes)
  const refreshBookings = useCallback(async (skipCache?: boolean) => {
    if (!userId) return;
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 REFRESHING BOOKINGS FOR USER: ${userId}`);
      console.log(`   forceRefresh flag: ${forceRefresh}`);
      console.log(`   skipCache parameter: ${skipCache}`);
      console.log(`   Calling: apiBookings.getByUser(${userId}, ${skipCache || forceRefresh})`);
      
      // Skip cache when explicitly requested OR from provider prop (after payment)
      const shouldSkipCache = skipCache === true || forceRefresh === true;
      if (shouldSkipCache) {
        console.log(`   ✓ SKIPPING CACHE for fresh data`);
        // Also clear the localStorage dashboard cache for this user
        try {
          localStorage.removeItem(`dashboard_${userId}`);
          console.log(`   🗑️ Cleared localStorage cache for dashboard_${userId}`);
        } catch (err) {
          console.warn('Failed to clear localStorage:', err);
        }
      }
      
      const freshBookings = await apiBookings.getByUser(userId, shouldSkipCache);
      
      console.log(`✅ API RETURNED: ${Array.isArray(freshBookings) ? freshBookings.length : 'unknown'} bookings`);
      if (Array.isArray(freshBookings) && freshBookings.length > 0) {
        console.log(`   Booking IDs: ${freshBookings.map((b: any) => `#${b.id}(status:${b.status},payment:${b.payment_status})`).join(', ')}`);
        console.log(`   FULL RESPONSE (first booking):`, JSON.stringify(freshBookings[0], null, 2));
      }
      console.log(`${'='.repeat(60)}\n`);
      
      if (Array.isArray(freshBookings)) {
        console.log(`📊 Updating context data with ${freshBookings.length} bookings`);
        // Normalize booking objects to include both snake_case and camelCase aliases
        const normalizeBooking = (b: any) => {
          return {
            ...b,
            // payment status alias
            paymentStatus: b.paymentStatus || b.payment_status || b.payment?.status || b.payment_status,
            payment_status: b.payment_status || b.paymentStatus || b.payment?.status || b.paymentStatus,
            // booking datetime / scheduled date aliases
            booking_datetime: b.booking_datetime || b.bookingDate || b.scheduledDate || b.booking_datetime,
            scheduledDate: b.scheduledDate || b.booking_datetime || b.bookingDate || b.scheduledDate,
            // service price alias
            service_price: b.service_price || b.estimatedCost || b.price || b.service_price,
            estimatedCost: b.estimatedCost || b.service_price || b.price || b.estimatedCost,
          };
        };

        const normalizedBookings = freshBookings.map(normalizeBooking);

        setData(prevData => {
          if (!prevData) return prevData;
          const updated = {
            ...prevData,
            bookings: normalizedBookings,
          };
          try {
            localStorage.setItem(`dashboard_${userId}`, JSON.stringify(updated));
            console.log(`   ✓ Saved to localStorage`);
          } catch (err) {
            console.warn('Failed to save to localStorage:', err);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('❌ Failed to refresh bookings:', err);
    }
  }, [userId, forceRefresh]);

  const value: DashboardContextType = {
    data,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
    getServiceRecords,
    getServiceRecordsByVehicle,
    getCompletedServices,
    getOngoingServices,
    addBooking,
    updateBooking,
    cancelBooking,
    processRefund,
    deleteBooking,
    getBookings,
    getUpcomingBookings,
    addServiceRequest,
    updateServiceRequest,
    getServiceRequests,
    getPayments,
    getOutstandingPayments,
    getInvoices,
    downloadInvoice,
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    clearNotifications,
    updateProfile,
    syncData,
    refreshBookings,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
