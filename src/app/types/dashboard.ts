// Dashboard Type Definitions

export type ServiceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type ServiceType = 'oilchange' | 'diagnostics' | 'engineservicing' | 'generalrepair' | 'tirereplacement';
export type BookingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type NotificationType = 'reminder' | 'alert' | 'info' | 'success' | 'error';

// Vehicle Interface
export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  mileage: number;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  color?: string;
  registrationExpiry?: string;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  currentServiceStatus?: string;
  image?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Service Record Interface
export interface ServiceRecord {
  id: string;
  userId: string;
  vehicleId: string;
  type: ServiceType;
  description: string;
  status: ServiceStatus;
  startDate: Date;
  endDate?: Date;
  cost: number;
  parts?: ServicePart[];
  mileageAtService: number;
  mechanic?: {
    id: string;
    name: string;
    shop: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePart {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

// Booking Interface
export interface ServiceBooking {
  id: string;
  userId: string;
  vehicleId: string;
  serviceType: ServiceType;
  status: BookingStatus;
  scheduledDate: Date;
  estimatedDuration: number; // in minutes
  shopId?: string;
  shopName?: string;
  shopAddress?: string;
  mechanic?: {
    id: string;
    name: string;
    specialization?: string;
  };
  description?: string;
  estimatedCost?: number;
  confirmationDetails?: string;
  // Payment tracking fields
  paymentStatus?: 'unpaid' | 'paid' | 'refund_pending' | 'refunded';
  amountPaid?: number;
  refundAmount?: number;
  refundDate?: Date;
  refundNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Request Interface
export interface ServiceRequest {
  id: string;
  userId: string;
  vehicleId: string;
  title: string;
  description: string;
  images?: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'submitted' | 'under-review' | 'quoted' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  quote?: Quote;
}

export interface Quote {
  id: string;
  requestId: string;
  estimatedCost: number;
  estimatedDuration: number;
  description: string;
  validUntil: Date;
  parts?: ServicePart[];
}

// Payment Record Interface
export interface Payment {
  id: string;
  userId: string;
  serviceId: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'bank-transfer' | 'mobile-money';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  invoiceNumber?: string;
  paymentDate?: Date;
  dueDate: Date;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  serviceId: string;
  date: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lineItems: InvoiceItem[];
  notes?: string;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  relatedTo?: {
    type: 'booking' | 'service' | 'payment' | 'vehicle';
    id: string;
  };
  createdAt: Date;
}

// User Profile Interface
export interface UserProfile {
  id: string;
  userId: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  profileImage?: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    serviceReminders: boolean;
    reminderDays: number;
    preferredShop?: string;
    preferredMechanic?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Statistics Interface
export interface DashboardStats {
  totalVehicles: number;
  activeServices: number;
  totalServiceCost: number;
  upcomingServices: number;
  completedServices: number;
  nextServiceDue: string | null;
  averageServiceCost: number;
  totalServiceHours: number;
}

// User Dashboard Data
export interface UserDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  profile: UserProfile;
  vehicles: Vehicle[];
  serviceRecords: ServiceRecord[];
  bookings: ServiceBooking[];
  serviceRequests: ServiceRequest[];
  payments: Payment[];
  invoices: Invoice[];
  notifications: Notification[];
  stats: DashboardStats;
}
