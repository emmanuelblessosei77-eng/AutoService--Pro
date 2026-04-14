const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api';
export const API_BASE = API_BASE_URL;

// Expose debug utilities to window for console access
declare global {
  interface Window {
    DEBUG_API: {
      clearCache: (endpoint?: string) => void;
    };
  }
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  skipCache?: boolean;
}

const DEV_TOKEN_PREFIX = 'dev-token';
const getAuthToken = () => {
  const t = localStorage.getItem('authToken');
  // For mock server development, allow dev tokens
  // For production, we'd validate real tokens
  if (!t) return null;
  return t;
};

// Simple response cache (GET requests only)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (endpoint: string, method?: string) => {
  return `${method || 'GET'}:${endpoint}`;
};

const getCachedResponse = (endpoint: string, method?: string) => {
  const key = getCacheKey(endpoint, method);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`♻️  Cache HIT: ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedResponse = (endpoint: string, data: any, method?: string) => {
  const key = getCacheKey(endpoint, method);
  responseCache.set(key, { data, timestamp: Date.now() });
};

// Export function to clear cache for a specific endpoint
export const clearCache = (endpoint?: string) => {
  if (endpoint) {
    const key = getCacheKey(endpoint, 'GET');
    if (responseCache.delete(key)) {
      console.log(`🗑️ Cache cleared for: ${endpoint}`);
    }
  } else {
    console.log(`🗑️ Clearing ALL cache (${responseCache.size} entries)`);
    responseCache.clear();
  }
};

// Expose clearCache to window for manual debugging via console
if (typeof window !== 'undefined') {
  (window as any).DEBUG_API = {
    clearCache,
  };
  console.log('✅ DEBUG_API exposed to window - use window.DEBUG_API.clearCache() from console');
}

const makeRequest = async (endpoint: string, options: RequestOptions = {}) => {
  const method = options.method || 'GET';
  const isGET = method === 'GET';
  
  // Try cache for GET requests ONLY if skipCache is not explicitly true
  if (isGET && !options.skipCache) {
    const cached = getCachedResponse(endpoint, method);
    if (cached) {
      console.log(`♻️  Cache HIT: ${endpoint} (skipCache=${options.skipCache})`);
      return cached;
    }
  } else if (isGET && options.skipCache) {
    console.log(`⏭️ SKIPPING CACHE for ${endpoint} (skipCache=true)`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔑 Auth token included in ${method} request`);
  } else {
    // Don't warn for public auth endpoints (register/login/verify)
    const isAuthEndpoint = endpoint.startsWith('/auth');
    if (!isAuthEndpoint) {
      console.warn(`⚠️ No auth token found for ${method} request`);
    } else {
      console.log(`ℹ️ No auth token (expected) for auth endpoint ${endpoint}`);
    }
  }

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 API Request: ${method} ${fullUrl}`, { hasToken: !!token });
    
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    console.log(`📨 API Response: ${response.status} ${response.statusText} for ${method} ${endpoint}`);

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = 'Could not read error body';
      }

      // If the backend responded with 401, clear stored auth and surface a clearer error
      if (response.status === 401) {
        console.warn('🔒 API returned 401 Unauthorized — clearing stored auth token');
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        } catch (e) {
          // ignore
        }
      }

      console.error(`🔴 API Error ${response.status} for ${method} ${endpoint}:`, errorBody);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    console.log(`✅ API Success (${method} ${endpoint}):`, data);
    
    // Cache GET responses
    if (isGET) {
      setCachedResponse(endpoint, data, method);
    }
    
    return data;
  } catch (error: any) {
    console.error(`🔴 API Request Failed (${method} ${endpoint}):`, error.message, error);
    throw error;
  }
};

// Auth
export const auth = {
  login: async (email: string, password: string) => {
    try {
      const result = await makeRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // Normalize backend response shapes so callers always get { token, user }
      // Possible shapes observed:
      // 1) { token, user }
      // 2) { success: true, data: { token, user } }
      // 3) { success: true, data: { token, user: { first_name, last_name, ... } } }
      if (result) {
        // Case: { success: true, data: { token, user } }
        if (result.data && (result.data.token || result.data.user)) {
          const token = result.data.token;
          let user = result.data.user || null;
          if (user && !user.name) {
            const first = user.first_name || user.firstName || '';
            const last = user.last_name || user.lastName || '';
            user = { ...user, name: (first + ' ' + last).trim() || user.email };
          }
          return { token, user };
        }

        // Case: { token, user }
        if (result.token && result.user) {
          let user = result.user;
          if (user && !user.name) {
            const first = user.first_name || user.firstName || '';
            const last = user.last_name || user.lastName || '';
            user = { ...user, name: (first + ' ' + last).trim() || user.email };
          }
          return { token: result.token, user };
        }
      }

      return result;
    } catch (err: any) {
      // Try to parse the error message to extract actual API error response
      const errorMsg = err.message || err.toString();
      
      // Look for JSON in the error message (from the error body we captured in makeRequest)
      let apiErrorResponse = null;
      try {
        // The error message format is typically: "API Error: 400 Bad Request - {json}"
        const jsonMatch = errorMsg.match(/\{[\s\S]*\}$/);
        if (jsonMatch) {
          apiErrorResponse = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Could not parse error response
      }

      // If we got a parsed error response from the API, return it
      if (apiErrorResponse && (apiErrorResponse.error || apiErrorResponse.success === false)) {
        return apiErrorResponse;
      }

      // If it's a network error or truly no backend response, use dev token
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Failed to parse')) {
        console.warn('❌ Backend unavailable, using development mock user:', err);
        return {
          token: 'dev-token-123',
          user: {
            id: '1',
            name: 'Dev User',
            email,
            role: 'customer',
          },
        };
      } else {
        // Return generic error response
        return {
          error: errorMsg,
          success: false,
        };
      }
    }
  },
  register: (data: any) =>
    makeRequest('/auth/register', {
      method: 'POST',
      body: data,
    }),
  verifyEmail: (token: string) =>
    makeRequest('/auth/verify-email', {
      method: 'POST',
      body: { token },
    }),
  resendVerificationEmail: (email: string) =>
    makeRequest('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    }),
};

// Users
export const users = {
  getProfile: () => makeRequest('/users/profile'),
  updateProfile: (data: any) =>
    makeRequest('/users/profile', {
      method: 'PUT',
      body: data,
    }),
  getAll: () => makeRequest('/users'),
  updateRole: (id: number, role: string) =>
    makeRequest(`/users/role-update/${id}`, {
      method: 'PUT',
      body: { role },
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    makeRequest('/users/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),
};

// Services
export const services = {
  getAll: () => makeRequest('/services'),
  getById: (id: string) => makeRequest(`/services/${id}`),
  create: (data: any) =>
    makeRequest('/services', {
      method: 'POST',
      body: data,
    }),
  update: (id: string, data: any) =>
    makeRequest(`/services/${id}`, {
      method: 'PUT',
      body: data,
    }),
  delete: (id: string) =>
    makeRequest(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// Bookings
export const bookings = {
  getAll: () => makeRequest('/bookings'),
  getByUser: (userId: string | number, skipCache?: boolean) => makeRequest(`/bookings/user/${userId}`, { skipCache }),
  getByMechanic: (mechanicId: string | number) => makeRequest(`/bookings/mechanic/${mechanicId}`, { skipCache: true }),
  getById: (id: string) => makeRequest(`/bookings/${id}`),
  create: (data: any) =>
    makeRequest('/bookings', {
      method: 'POST',
      body: data,
    }),
  update: (id: string, data: any) =>
    makeRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: data,
    }),
  assignMechanic: (id: string, mechanic_id: number) =>
    makeRequest(`/bookings/${id}/assign-mechanic`, {
      method: 'PUT',
      body: { mechanic_id },
    }),
  delete: (id: string) =>
    makeRequest(`/bookings/${id}`, {
      method: 'DELETE',
    }),
  verifyPayment: (reference: string) =>
    makeRequest(`/bookings/verify/${reference}`, { skipCache: true }),
};

// Vehicles
const transformVehicle = (v: any) => {
  if (!v) return v;
  return {
    ...v,
    fuelType: v.fuel_type || v.fuelType || 'petrol',
    mileage: v.mileage || 0,
  };
};

export const vehicles = {
  getAll: () => 
    makeRequest('/vehicles').then(data => 
      Array.isArray(data) ? data.map(transformVehicle) : data
    ),
  getByUser: (userId: string | number) =>
    makeRequest(`/vehicles/user/${userId}`).then(data => 
      Array.isArray(data) ? data.map(transformVehicle) : data
    ),
  create: (data: any) =>
    makeRequest('/vehicles', {
      method: 'POST',
      body: data,
    }).then(transformVehicle),
  update: (id: string, data: any) =>
    makeRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: data,
    }).then(transformVehicle),
  delete: (id: string) =>
    makeRequest(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
};

// Car Parts
export const carParts = {
  getAll: () => makeRequest('/car-parts'),
  getById: (id: string) => makeRequest(`/car-parts/${id}`),
  create: (data: any) =>
    makeRequest('/car-parts', {
      method: 'POST',
      body: data,
    }),
  update: (id: string, data: any) =>
    makeRequest(`/car-parts/${id}`, {
      method: 'PUT',
      body: data,
    }),
  delete: (id: string) =>
    makeRequest(`/car-parts/${id}`, {
      method: 'DELETE',
    }),
};

// Orders
export const orders = {
  getAll: async () => {
    try {
      return await makeRequest('/orders/all', { skipCache: true });
    } catch (err: any) {
      const message = err?.message || '';
      // Backward compatibility for older backend route shape.
      if (message.includes('404')) {
        return makeRequest('/orders/admin/all', { skipCache: true });
      }
      throw err;
    }
  },
  getMyOrders: () => makeRequest('/orders'),
  getById: (id: string) => makeRequest(`/orders/${id}`),
  create: (data: any) =>
    makeRequest('/orders', {
      method: 'POST',
      body: data,
    }),
  update: async (id: string, data: any) => {
    try {
      return await makeRequest(`/orders/${id}`, {
        method: 'PATCH',
        body: data,
      });
    } catch (err: any) {
      const message = err?.message || '';
      if (message.includes('404')) {
        return makeRequest(`/orders/${id}`, {
          method: 'PUT',
          body: data,
        });
      }
      throw err;
    }
  },
  delete: (id: string) =>
    makeRequest(`/orders/${id}`, {
      method: 'DELETE',
    }),
};

// Payments
export const payments = {
  initialize: (data: any) =>
    makeRequest('/payments/initialize', {
      method: 'POST',
      body: data,
    }),
  verify: (reference: string) =>
    makeRequest('/payments/verify', {
      method: 'POST',
      body: { reference },
    }),
  checkStatus: (reference: string) =>
    makeRequest(`/payments/check/${reference}`, { skipCache: true }),
  getStatus: (bookingId: string | number) =>
    makeRequest(`/payments/status/${bookingId}`),
  getHistory: (bookingId: string | number) =>
    makeRequest(`/payments/history/${bookingId}`),
  getAll: () => makeRequest('/payments'),
  processRefund: (data: any) =>
    makeRequest('/payments/refund', {
      method: 'POST',
      body: data,
    }),
  downloadInvoice: async (bookingId: string | number) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const fullUrl = `${API_BASE_URL}/payments/invoice/${bookingId}`;
      console.log(`📡 Downloading invoice from: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Invoice downloaded successfully`);
      return true;
    } catch (error: any) {
      console.error(`❌ Invoice download failed:`, error);
      throw error;
    }
  },
};

// Part Requests
export const partRequests = {
  create: (data: any) =>
    makeRequest('/part-requests', {
      method: 'POST',
      body: data,
    }),
  getMine: () => makeRequest('/part-requests/mechanic/mine', { skipCache: true }),
  getAll: () => makeRequest('/part-requests'),
  updateStatus: (id: string, status: string, approved_by?: number) =>
    makeRequest(`/part-requests/${id}`, {
      method: 'PUT',
      body: { status, approved_by },
    }),
  delete: (id: string) =>
    makeRequest(`/part-requests/${id}`, {
      method: 'DELETE',
    }),
};
// Carousel
export const carousel = {
  getAll: () => makeRequest('/carousel'),
  getById: (id: string) => makeRequest(`/carousel/${id}`),
  create: (data: any) =>
    makeRequest('/carousel', {
      method: 'POST',
      body: data,
    }),
  update: (id: string, data: any) =>
    makeRequest(`/carousel/${id}`, {
      method: 'PUT',
      body: data,
    }),
  delete: (id: string) =>
    makeRequest(`/carousel/${id}`, {
      method: 'DELETE',
    }),
};

// Emails
export const emails = {
  /**
   * Send booking confirmation email
   * @param bookingDetails Object containing booking information
   * @returns Promise with email send result
   */
  sendBookingConfirmation: (bookingDetails: {
    bookingId: number;
    userEmail: string;
    customerName: string;
    serviceType: string;
    bookingDate: string;
    bookingTime?: string;
    amount: number;
  }) =>
    makeRequest('/emails/booking-confirmation', {
      method: 'POST',
      body: bookingDetails,
    }),

  /**
   * Send generic email (legacy endpoint)
   */
  send: (data: any) =>
    makeRequest('/emails/send', {
      method: 'POST',
      body: data,
    }),
};