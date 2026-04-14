import {
  Vehicle,
  ServiceRecord,
  ServiceBooking,
  ServiceRequest,
  Payment,
  Invoice,
  Notification,
  UserProfile,
  UserDashboardData,
} from '../types/dashboard';
import { parts, services } from './data';
import { bookings as apiBookings, users as apiUsers, vehicles as apiVehicles } from '../../services/api';

export async function generateSampleDashboardData(userId: string | number, forceRefresh?: boolean): Promise<UserDashboardData> {
  const now = new Date();
  const userIdStr = String(userId);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 GENERATING DASHBOARD DATA FOR USER: ${userId}`);
  if (forceRefresh) console.log(`   🔄 FORCE REFRESH: Skipping API cache`);

  console.log(`   Type: ${typeof userId}, String: ${userIdStr}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Fetch actual user and booking data from backend
  let actualUser = {
    id: userIdStr,
    name: 'User',
    email: 'user@example.com',
    role: 'customer' as const,
  };

  let fetchedBookings: ServiceBooking[] = [];
  let fetchedVehicles: Vehicle[] = [];

  try {
    // Fetch user profile from backend
    const userProfile = await apiUsers.getProfile();
    if (userProfile) {
      actualUser = {
        id: String(userProfile.id || userId),
        name: userProfile.name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User',
        email: userProfile.email || 'user@example.com',
        role: userProfile.role || 'customer',
      };
    }
  } catch (err) {
    console.log('Could not fetch user profile, using defaults');
  }

  try {
    // Fetch bookings for this user from backend
    console.log(`📅 FETCHING BOOKINGS FOR USER ${userId}`);
    const apiBookingsData = await apiBookings.getByUser(userId, forceRefresh);
    console.log(`✅ API RETURNED ${Array.isArray(apiBookingsData) ? apiBookingsData.length : 'unknown'} bookings`);
    if (Array.isArray(apiBookingsData) && apiBookingsData.length > 0) {
      console.log(`📊 MAPPING ${apiBookingsData.length} bookings to component format`);
      fetchedBookings = apiBookingsData.map(b => {
        const serviceIdRaw = b.service_id != null ? String(b.service_id) : '';
        const matchedService = services.find((s: any) => String(s.id) === serviceIdRaw)
          || services.find((s: any) => {
            const backendName = String(b.service_name || '').trim().toLowerCase();
            return backendName && String(s.title || '').trim().toLowerCase() === backendName;
          });

        const resolvedServiceType = matchedService?.id
          || (typeof b.service_type === 'string' && b.service_type.trim())
          || serviceIdRaw
          || '';

        return {
        id: b.id,
        userId: b.user_id,
        vehicleId: b.vehicle_id,
        serviceType: resolvedServiceType as any,
        status: b.status,
        scheduledDate: new Date(b.booking_datetime),
        estimatedDuration: 120,
        shopName: 'AutoService Pro',
        estimatedCost: parseFloat(b.service_price || 0) || 99,
        description: b.notes,
        mechanic: { id: 'm1', name: 'Assigned Mechanic' },
        createdAt: new Date(b.created_at),
        updatedAt: new Date(b.updated_at),
        service_id: b.service_id,
        service_name: b.service_name,
        service_price: b.service_price,
        total_cost: b.total_cost,
        parts_cost: b.parts_cost,
        payment_status: b.payment_status,
        first_name: b.first_name,
        last_name: b.last_name,
        };
      });
      console.log(`   ✅ Found ${fetchedBookings.length} bookings for user ${userId}`);
    } else {
      console.log(`   ℹ️  No bookings found for user ${userId}`);
      fetchedBookings = [];
    }
  } catch (err: any) {
    console.error('❌ FAILED TO FETCH BOOKINGS:', err?.message);
    fetchedBookings = [];
  }

  try {
    // Fetch vehicles from backend for this user
    console.log(`🚗 FETCHING VEHICLES:`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Type: ${typeof userId}`);
    console.log(`   API URL: /vehicles/user/${userId}`);
    
    const vehiclesData = await apiVehicles.getByUser(userId);
    console.log(`📦 Raw API response:`, vehiclesData);
    console.log(`   Response type: ${typeof vehiclesData}`);
    console.log(`   Is array: ${Array.isArray(vehiclesData)}`);
    
    if (Array.isArray(vehiclesData)) {
      console.log(`✅ SUCCESS: Got ${vehiclesData.length} vehicles from API`);
      fetchedVehicles = vehiclesData.map((v: any) => ({
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
      }));
      // Cache vehicles in localStorage for quick access
      const cacheKey = `vehicles_${userId}`;
      localStorage.setItem(cacheKey, JSON.stringify(fetchedVehicles));
      console.log(`💾 Cached ${fetchedVehicles.length} vehicles to localStorage`);
    } else {
      console.warn('⚠️  Vehicles response is not an array:', typeof vehiclesData);
      console.warn('   Response:', vehiclesData);
      fetchedVehicles = [];
    }
  } catch (err: any) {
    console.error('❌ FAILED TO FETCH VEHICLES:');
    console.error('   Error message:', err?.message);
    console.error('   Error status:', err?.status);
    console.error('   Full error:', err);
    
    console.log('\n🔄 Attempting to restore from localStorage cache...');
    const cacheKey = `vehicles_${userId}`;
    const cachedVehicles = localStorage.getItem(cacheKey);
    
    if (cachedVehicles) {
      try {
        fetchedVehicles = JSON.parse(cachedVehicles);
        console.log(`✅ Restored ${fetchedVehicles.length} vehicles from cache`);
      } catch (parseErr) {
        console.error('❌ Failed to parse cached vehicles:', parseErr);
        fetchedVehicles = [];
      }
    } else {
      console.warn(`⚠️  No cached vehicles found at key: ${cacheKey}`);
      fetchedVehicles = [];
    }
  }

  // Empty collections - NO MOCK DATA, only real database data
  const serviceRecords: ServiceRecord[] = [];
  const serviceRequests: ServiceRequest[] = [];
  const payments: Payment[] = [];
  const invoices: Invoice[] = [];
  
  // Real notifications from database - EMPTY until fetched from backend
  const notifications: Notification[] = [];

  // Real User Profile from database
  const profile: UserProfile = {
    id: actualUser.id,
    userId: userIdStr,
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      serviceReminders: true,
      reminderDays: 30,
      preferredShop: '',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    user: actualUser,
    profile,
    vehicles: fetchedVehicles,
    serviceRecords,
    bookings: fetchedBookings,
    serviceRequests,
    payments,
    invoices,
    notifications,
    stats: {
      totalVehicles: fetchedVehicles.length,
      activeServices: serviceRecords.filter(s => s.status === 'in-progress').length,
      totalServiceCost: 0,
      upcomingServices: fetchedBookings.filter(b => b.status === 'scheduled').length,
      completedServices: serviceRecords.filter(s => s.status === 'completed').length,
      nextServiceDue: null,
      averageServiceCost: 0,
      totalServiceHours: 0,
    },
  };
}
