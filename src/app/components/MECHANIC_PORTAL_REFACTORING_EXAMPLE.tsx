/**
 * MECHANIC PORTAL REFACTORING EXAMPLE
 * 
 * This file shows the exact pattern for refactoring mechanic-portal.tsx
 * Smallest of the three (840 lines), so refactoring is quickest.
 * 
 * MAIN SECTIONS:
 * 1. Assigned Jobs Table
 * 2. Jobs Status/Filter
 * 3. Job Details/Actions
 * 4. Quick Stats
 */

import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { TailAdminLayout } from './layouts/TailAdminLayout'; // NEW IMPORT
import '../styles/mobile-dashboard-utils.css'; // NEW IMPORT
import {
  Clock, CheckCircle2, AlertCircle, MapPin, Phone,
  Edit2, Eye, CheckCheck, XCircle, Plus, Search,
  Wrench, Calendar, DollarSign, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface MechanicPortalProps {
  user: User;
  onLogout: () => void;
}

/**
 * =============================================================================
 * Extract all existing mechanic logic into this component
 * =============================================================================
 */
function MechanicPortalContent({ user }: { user: User }) {
  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('active');
  const [selectedJob, setSelectedJob] = useState(null);

  // ... paste all your existing mechanic logic here ...
  // State management, API calls, event handlers, etc.

  return (
    <div className="space-y-6">
      {/* QUICK STATS - Mobile First Grid */}
      <div className="stats-grid">
        <StatCard
          label="Active Jobs"
          value={jobs.filter(j => j.status === 'active').length}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={jobs.filter(j => j.status === 'completed').length}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Pending"
          value={jobs.filter(j => j.status === 'pending').length}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          label="Earnings"
          value="₹12,500"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* FILTER BUTTONS - Responsive button group */}
      <div className="button-group">
        <Button
          variant={filterStatus === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('active')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Active ({jobs.filter(j => j.status === 'active').length})
        </Button>
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('pending')}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Pending ({jobs.filter(j => j.status === 'pending').length})
        </Button>
        <Button
          variant={filterStatus === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('completed')}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed ({jobs.filter(j => j.status === 'completed').length})
        </Button>
      </div>

      {/* SEARCH BAR - Mobile responsive */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by customer, vehicle, or system..."
          className="pl-10"
        />
      </div>

      {/* JOBS TABLE - Responsive with horizontal scroll on mobile */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Assigned Jobs</h2>

        {/* Desktop view: Table */}
        {/* 🎯 CHANGE 1: ADD responsive-table-wrapper */}
        <div className="hidden md:block responsive-table-wrapper">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-sm">Job ID</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Vehicle</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Service</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs
                .filter(job => job.status === filterStatus)
                .map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm font-medium">#{job.id}</td>
                    <td className="px-4 py-3 text-sm">{job.customerName}</td>
                    <td className="px-4 py-3 text-sm">{job.vehicleInfo}</td>
                    <td className="px-4 py-3 text-sm">{job.serviceName}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(job.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={
                          job.status === 'completed'
                            ? 'default'
                            : job.status === 'active'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view: Card layout */}
        {/* 🎯 CHANGE 2: Mobile card layout for small screens */}
        <div className="md:hidden grid gap-3">
          {jobs
            .filter(job => job.status === filterStatus)
            .map((job) => (
              <div
                key={job.id}
                className="dashboard-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Job #{job.id}</h3>
                    <p className="text-xs text-gray-500">{job.customerName}</p>
                  </div>
                  <Badge
                    variant={
                      job.status === 'completed'
                        ? 'default'
                        : job.status === 'active'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <span>{job.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{job.vehicleInfo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(job.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {job.status === 'active' && (
                    <Button size="sm" className="flex-1">
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}

          {jobs.filter(job => job.status === filterStatus).length === 0 && (
            <div className="empty-state">
              <AlertCircle className="empty-state-icon" />
              <p className="empty-state-title">No jobs found</p>
              <p className="empty-state-description">
                You have no {filterStatus} jobs at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* JOB DETAILS MODAL/DRAWER */}
      {selectedJob && (
        <JobDetailCard
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

// Helper: Stats Card
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    yellow: 'bg-yellow-500 text-yellow-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">{value}</p>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper: Job Detail Component
function JobDetailCard({
  job,
  onClose,
}: {
  job: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-md md:max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4 md:px-6 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Job Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* 🎯 CHANGE 3: Job details in mobile-responsive layout */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                Job ID
              </p>
              <p className="text-lg font-bold">#{job.id}</p>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                Customer
              </p>
              <p className="text-sm font-medium">{job.customerName}</p>
              <p className="text-xs text-gray-500">{job.customerPhone}</p>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                Vehicle
              </p>
              <p className="text-sm font-medium">{job.vehicleInfo}</p>
              <p className="text-xs text-gray-500">{job.vehicleRegistration}</p>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                Service
              </p>
              <p className="text-sm font-medium">{job.serviceName}</p>
              <p className="text-xs text-gray-500 mt-1">{job.serviceDescription}</p>
            </div>

            <div className="border-t pt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                  Date
                </p>
                <p className="text-sm font-medium">
                  {new Date(job.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                  Time
                </p>
                <p className="text-sm font-medium">{job.time}</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                Status
              </p>
              <Badge className="mt-2">{job.status}</Badge>
            </div>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="button-group mt-6 border-t pt-4">
            <Button variant="outline" className="flex-1" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {job.status === 'active' && (
              <Button className="flex-1" size="sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * MAIN EXPORT WITH NEW RESPONSIVE LAYOUT
 * =============================================================================
 */
export function MechanicPortal({ user, onLogout }: MechanicPortalProps) {
  return (
    <TailAdminLayout
      user={user}
      onLogout={onLogout}
      title="Mechanic Dashboard"
      subtitle="Manage your assigned jobs and tasks"
    >
      <MechanicPortalContent user={user} />
    </TailAdminLayout>
  );
}

export default MechanicPortal;

/**
 * =============================================================================
 * CHECKLIST FOR MECHANIC PORTAL REFACTORING
 * =============================================================================
 * 
 * ☐ 1. Add imports: TailAdminLayout, mobile-dashboard-utils.css
 * ☐ 2. Create MechanicPortalContent with all existing logic
 * ☐ 3. Wrap with TailAdminLayout in export
 * ☐ 4. Stats → Use stats-grid class
 * ☐ 5. Filter buttons → Use button-group class
 * ☐ 6. Jobs table → Wrap with responsive-table-wrapper
 * ☐ 7. Add mobile card layout as fallback (hide-mobile/hide-desktop)
 * ☐ 8. Test mobile view (375px)
 * ☐ 9. Test tablet view (768px)
 * ☐ 10. Test desktop view (1280px)
 * ☐ 11. Test job details drawer on mobile
 * ☐ 12. Verify all job actions work (Complete, Edit, etc.)
 * ☐ 13. Test filter buttons
 * ☐ 14. Verify API calls execute correctly
 * ☐ 15. Test responsive layout on actual devices if possible\n * \n * =============================================================================\n */\n