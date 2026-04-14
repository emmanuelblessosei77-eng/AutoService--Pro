/**
 * CUSTOMER PORTAL REFACTORING EXAMPLE
 * 
 * This file shows the exact pattern for refactoring customer-portal.tsx
 * to use the new TailAdminLayout with mobile-first responsive design.
 * 
 * KEY CHANGES:
 * 1. New imports for TailAdminLayout and mobile utilities
 * 2. Extracted existing logic into CustomerPortalContent component
 * 3. Wrapped with TailAdminLayout for responsive layout
 * 4. Added responsive grid/table classes
 * 
 * TIME ESTIMATE: Copy the existing customer-portal.tsx structure,
 * follow this pattern, and change these specific areas.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '../App';
import { TailAdminLayout } from './layouts/TailAdminLayout'; // NEW IMPORT
import '../styles/mobile-dashboard-utils.css'; // NEW IMPORT
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
  ShoppingBag, ShoppingCart, Image, Star, Lock, Zap, Trash
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

interface CustomerPortalProps {
  user: User;
  onLogout: () => void;
}

/**
 * =============================================================================
 * STEP 1: Extract all existing functions as-is
 * =============================================================================
 * 
 * Copy ALL existing components from your current customer-portal.tsx:
 * - UserSettingsModal()
 * - DashboardOverview()
 * - AddVehicleForm()
 * - VehicleCard()
 * - BookingManager()
 * - PartsShop()
 * - OrdersViewer()
 * - etc.
 * 
 * These all go INSIDE the CustomerPortalContent component below,
 * completely unchanged. No modifications needed.
 */

/**
 * =============================================================================
 * STEP 2: Create wrapper component with all existing logic
 * =============================================================================
 */
function CustomerPortalContent({ user, onLogout }: { user: User; onLogout: () => void }) {
  // Copy ALL state, effects, functions from existing customer-portal.tsx
  // Example structure below - paste your actual code here
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ... paste all your existing state, effects, and functions here ...
  // DashboardContext hook calls
  // API fetching logic
  // Event handlers
  // Etc.

  return (
    <div className="space-y-6">
      {/* TABS NAVIGATION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          <TabsTrigger value="dashboard" className="text-xs md:text-sm">
            <LayoutDashboard className="w-4 h-4 mr-2 hidden sm:inline" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="text-xs md:text-sm">
            <Car className="w-4 h-4 mr-2 hidden sm:inline" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs md:text-sm">
            <Calendar className="w-4 h-4 mr-2 hidden sm:inline" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="parts" className="text-xs md:text-sm">
            <Wrench className="w-4 h-4 mr-2 hidden sm:inline" />
            Parts
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs md:text-sm">
            <ShoppingBag className="w-4 h-4 mr-2 hidden sm:inline" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs md:text-sm">
            <FileText className="w-4 h-4 mr-2 hidden sm:inline" />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard">
          {/* 🎯 CHANGE 1: Replace old grid with responsive dashboard-grid */}
          <div className="space-y-6">
            {/* Your existing DashboardOverview component - no changes needed */}
            {/* <DashboardOverview /> */}
          </div>
        </TabsContent>

        {/* VEHICLES TAB */}
        <TabsContent value="vehicles">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Vehicles</h2>
              {/* <AddVehicleButton /> */}
            </div>
            
            {/* 🎯 CHANGE 2: Update vehicle grid to use responsive dashboard-grid */}
            <div className="dashboard-grid">
              {/* Map your vehicles here */}
              {/* Each vehicle card gets the responsive grid treatment */}
            </div>
          </div>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Bookings</h2>
            
            {/* 🎯 CHANGE 3: Wrap booking table with responsive-table-wrapper */}
            <div className="responsive-table-wrapper">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Vehicle</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Service</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Your booking rows here */}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* PARTS TAB */}
        <TabsContent value="parts">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Parts Shop</h2>
            
            {/* 🎯 CHANGE 4: Update parts grid to use responsive dashboard-grid */}
            <div className="dashboard-grid">
              {/* Map your parts here */}
              {/* Each part card gets automatic responsive behavior */}
            </div>
          </div>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Orders</h2>
            
            {/* 🎯 CHANGE 5: Wrap orders table with responsive-table-wrapper */}
            <div className="responsive-table-wrapper">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Items</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Total</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Your order rows here */}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* INVOICES TAB */}
        <TabsContent value="invoices">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Invoices</h2>
            
            {/* 🎯 CHANGE 6: Update invoices with responsive grid or table */}
            <div className="responsive-table-wrapper">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Invoice #</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Your invoice rows here */}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * =============================================================================
 * STEP 3: Export main component with new responsive layout
 * =============================================================================
 */
export function CustomerPortal({ user, onLogout }: CustomerPortalProps) {
  return (
    <DashboardProvider>
      {/* 🎯 KEY CHANGE: Wrap everything with TailAdminLayout */}
      <TailAdminLayout
        user={user}
        onLogout={onLogout}
        title="Customer Dashboard"
        subtitle="Manage your vehicles, bookings, and orders"
      >
        {/* All existing customer portal logic goes here, wrapped in content component */}
        <CustomerPortalContent user={user} onLogout={onLogout} />
      </TailAdminLayout>
    </DashboardProvider>
  );
}

export default CustomerPortal;

/**
 * =============================================================================
 * MIGRATION CHECKLIST
 * =============================================================================
 * 
 * Copy this checklist and work through it:
 * 
 * ☐ 1. Add import: TailAdminLayout from './layouts/TailAdminLayout'
 * ☐ 2. Add import: '../styles/mobile-dashboard-utils.css'
 * ☐ 3. Create CustomerPortalContent function with ALL existing logic
 * ☐ 4. Wrap CustomerPortalContent in TailAdminLayout in export
 * ☐ 5. Change: Stats cards → dashboard-grid
 * ☐ 6. Change: Vehicle grid → dashboard-grid
 * ☐ 7. Change: Each table → wrap with responsive-table-wrapper
 * ☐ 8. Change: Form inputs → wrap with form-grid
 * ☐ 9. Change: Button groups → wrap with button-group
 * ☐ 10. Test: Mobile view (375px width)
 * ☐ 11. Test: Tablet view (768px width)
 * ☐ 12. Test: Desktop view (1280px width)
 * ☐ 13. Test: All tab navigation works
 * ☐ 14. Test: All forms submit correctly
 * ☐ 15. Test: API calls still trigger
 * 
 * =============================================================================
 */
