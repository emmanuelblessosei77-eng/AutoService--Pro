import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ServiceBooking } from '../types/dashboard';


interface UpcomingBookingsCardProps {
  bookings: ServiceBooking[];
  compact?: boolean;
}

export function UpcomingBookingsCard({ bookings, compact }: UpcomingBookingsCardProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 w-full">
        <div className="text-center py-8">
          <Calendar className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming bookings scheduled</p>
        </div>
      </div>
    );
  }

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const bookingDate = new Date(booking.scheduledDate);
      const dateKey = bookingDate.toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(booking);
      return acc;
    }, {} as Record<string, ServiceBooking[]>);
  }, [bookings]);

  // Get calendar days for current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Create calendar grid
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  const sortedBookingDates = Object.keys(bookingsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const defaultSelectedDate = sortedBookingDates[0] || today.toDateString();
  const selectedDateObj = new Date(selectedDate || defaultSelectedDate);
  const bookingsForSelectedDate = bookingsByDate[selectedDateObj.toDateString()] || [];
  const totalBookings = bookingsForSelectedDate.length;

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' });

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date.toDateString());
  };

  const formatTime = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBookingAmount = (booking: ServiceBooking): number => {
    const b = booking as any;
    const raw =
      b.total_cost
      ?? b.totalCost
      ?? b.amountPaid
      ?? b.amount_paid
      ?? b.payment_amount
      ?? b.paymentAmount
      ?? b.amount
      ?? b.billingAmount
      ?? b.estimatedCost
      ?? 0;
    const parsed = parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">next booking</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
            {getDayName(selectedDateObj)}, {selectedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">bookings</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{totalBookings}</p>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{monthName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{currentYear}</span>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Two-column layout: calendar + bookings list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Calendar Grid */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          {/* Day headers */}
          <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              const dateObj = new Date(currentYear, currentMonth, day);
              const dateKey = dateObj.toDateString();
              const hasBookings = bookingsByDate[dateKey];
              const isSelected = dateKey === (selectedDate || defaultSelectedDate);
              const isToday = dateObj.toDateString() === today.toDateString();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded text-xs font-semibold transition-all relative ${
                    isSelected
                      ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-black shadow scale-105 border border-yellow-500'
                      : isToday
                      ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow border border-blue-600'
                      : hasBookings
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100 hover:bg-blue-200 dark:hover:bg-blue-800/40 border border-blue-200 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                  }`}
                >
                  {day}
                  {hasBookings && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {Array.from({ length: Math.min(hasBookings.length, 2) }).map((_, i) => (
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
              <span className="text-gray-600 dark:text-gray-400">Booked</span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex flex-col">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            {bookingsForSelectedDate.length > 0
              ? `${bookingsForSelectedDate.length} booking${bookingsForSelectedDate.length !== 1 ? 's' : ''} — ${selectedDateObj.toLocaleDateString()}`
              : `No bookings — ${selectedDateObj.toLocaleDateString()}`
            }
          </h4>

          {bookingsForSelectedDate.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {bookingsForSelectedDate.map((booking) => {
                const b = booking as any;
                return (
                <div key={booking.id} className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {b.service_name || booking.serviceType || b.type || booking.description || 'Car Service'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatTime(booking.scheduledDate)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                      GH₵{getBookingAmount(booking).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-4">
                <Calendar className="h-7 w-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">No bookings on this date</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
