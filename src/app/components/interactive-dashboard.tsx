import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Activity, AlertCircle, CheckCircle2, BarChart3, Calendar, AlertTriangle, Zap } from 'lucide-react';
import { bookings as apiBookings, services as apiServices } from '../../services/api';

interface MetricProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

export function DashboardMetric({ title, value, icon, trend, color }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      let current = 0;
      const target = value;
      const increment = target / 20;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedValue(target);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [value]);

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
  };

  return (
    
      
        
          {title}
          {icon}
        
      
      
        
          {typeof value === 'number' ? animatedValue : value}
        
        {trend !== undefined && (
           0 ? 'text-green-600' : 'text-red-600'}`}>
            
            {trend > 0 ? '+' : ''}{trend}% from last month
          
        )}
      
    
  );
}

interface StatCardProps {
  title: string;
  stats: { label: string; value: string | number; icon?: React.ReactNode }[];
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function StatCard({ title, stats, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100/50',
    green: 'from-green-50 to-green-100/50',
    red: 'from-red-50 to-red-100/50',
    yellow: 'from-yellow-50 to-yellow-100/50',
  };

  return (
    
      
        {title}
      
      
        
          {stats.map((stat, idx) => (
            
              
                {stat.icon && {stat.icon}}
                {stat.label}
              
              {stat.value}
            
          ))}
        
      
    
  );
}

interface ProgressRingProps {
  percentage: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export function ProgressRing({ percentage, label, size = 'md', color = 'blue' }) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const colorClasses = {
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f97316',
    red: '#ef4444',
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    
      
        
          
          
        
        
          
            {percentage}%
            {label}
          
        
      
    
  );
}

// Hook to fetch dashboard data from backend
export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    completedServices: 0,
    pendingBookings: 0,
    averageRating: 0,
    totalVehicles: 0,
    completionRate: 0,
    servicesByType: [] as any[],
    upcomingServices: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, servicesData] = await Promise.all([
          apiBookings.getAll(),
          apiServices.getAll(),
        ]);

        // Calculate dashboard metrics
        const totalBookings = Array.isArray(bookingsData) ? bookingsData.length : 0;
        const completedServices = Array.isArray(servicesData) ? servicesData.length : 0;
        const pendingBookings = Array.isArray(bookingsData) 
          ? bookingsData.filter((b: any) => b.status === 'pending').length 
          : 0;
        const completionRate = totalBookings > 0 ? Math.round((completedServices / totalBookings) * 100) : 0;

        // Group services by type
        const servicesByType: any = {};
        if (Array.isArray(servicesData)) {
          servicesData.forEach((service: any) => {
            const type = service.service_type || 'General';
            servicesByType[type] = (servicesByType[type] || 0) + 1;
          });
        }

        // Get upcoming services
        const upcomingServices = Array.isArray(bookingsData) 
          ? bookingsData.filter((b: any) => b.status === 'pending').slice(0, 5)
          : [];

        setDashboardData({
          totalBookings,
          completedServices,
          pendingBookings,
          averageRating: 4.8,
          totalVehicles: totalBookings > 0 ? Math.ceil(totalBookings / 2) : 0,
          completionRate,
          servicesByType: Object.entries(servicesByType).map(([type, count]) => ({ type, count })),
          upcomingServices,
        });
      } catch (error) {
        console.log('Using default dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dashboardData, isLoading };
}

// Service Progress Card (for both admin and customer) - Feature 7
export function ServiceProgress({ service, status }: { service: any; status: string }) {
  const percentage = status === 'completed' ? 100 : status === 'in-progress' ? 65 : 20;
  
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-medium text-sm">{service.name || 'Service'}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                status === 'completed' ? 'bg-green-500' : 
                status === 'in-progress' ? 'bg-blue-500' : 
                'bg-yellow-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{percentage}% Complete</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Service Calendar View (for Customer) - Feature 2
export function ServiceCalendar({ upcomingServices }: { upcomingServices: any[] }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const calendarDays = [];

  for (let i = 0; i < 28; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    calendarDays.push(date);
  }

  const hasService = (date: Date) => {
    return upcomingServices.some(s => {
      const serviceDate = new Date(s.scheduled_date || s.created_at);
      return serviceDate.toDateString() === date.toDateString();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Service Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))' }}>
          {days.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 pb-2">
              {day}
            </div>
          ))}
          {calendarDays.map((date, idx) => (
            <div
              key={idx}
              className={`h-8 flex items-center justify-center rounded text-xs font-medium cursor-pointer transition-colors ${
                hasService(date)
                  ? 'bg-blue-500 text-white'
                  : date.toDateString() === today.toDateString()
                  ? 'bg-gray-200 font-bold'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {date.getDate()}
            </div>
          ))}
        </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions (for Customer) - Feature 6
export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
        <div className="text-xl mb-1">📅</div>
        <p className="text-xs font-semibold text-blue-900">Book Service</p>
      </button>
      <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
        <div className="text-xl mb-1">🔧</div>
        <p className="text-xs font-semibold text-green-900">View Parts</p>
      </button>
      <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
        <div className="text-xl mb-1">💬</div>
        <p className="text-xs font-semibold text-orange-900">Contact Mechanic</p>
      </button>
    </div>
  );
}

// Vehicle Health Card (for Customer) - Feature 8
export function VehicleHealth({ vehicle }: { vehicle: any }) {
  const days = Math.floor(Math.random() * 80) + 20; // Random days until next service
  const health = 100 - Math.floor((days / 365) * 30); // Health score

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{vehicle.make || 'Vehicle'} {vehicle.model || ''}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Health Status</span>
          <span className={`text-xs font-bold ${
            health > 70 ? 'text-green-600' : 
            health > 40 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>{health}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              health > 70 ? 'bg-green-500' : 
              health > 40 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${health}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">Next service in {days} days</p>
      </CardContent>
    </Card>
  );
}

// Admin Dashboard Stats (Feature 1)
export function AdminQuickStats({ dashboardData }: { dashboardData: any }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
        <CardContent className="pt-4">
          <p className="text-xs text-gray-600 mb-1">Total Vehicles</p>
          <p className="text-2xl font-bold text-blue-900">{dashboardData.totalVehicles}</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
        <CardContent className="pt-4">
          <p className="text-xs text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-900">{dashboardData.completedServices}</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardContent className="pt-4">
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-900">{dashboardData.pendingBookings}</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50">
        <CardContent className="pt-4">
          <p className="text-xs text-gray-600 mb-1">Completion</p>
          <p className="text-2xl font-bold text-purple-900">{dashboardData.completionRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Service Breakdown Chart (Admin) - Feature 3
export function ServiceBreakdown({ servicesByType }: { servicesByType: any[] }) {
  const total = servicesByType.reduce((sum: number, s: any) => sum + (s.count || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Service Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {servicesByType.length > 0 ? (
            servicesByType.slice(0, 5).map((service, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">{service.type}</span>
                  <span className="text-xs text-gray-600">{service.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(service.count / total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No service data yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
