import { ReactNode, useState } from 'react';
import { User } from '../App';
import { LogOut, Calendar, Bell, Menu, X, Settings, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { NotificationCenter } from './notification-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { users as apiUsers } from '../../services/api';

interface PortalLayoutProps {
  user: User;
  onLogout: () => void;
  title: string;
  children: ReactNode;
  unreadNotifications?: number;
}

export function PortalLayout({ user, onLogout, title, children, unreadNotifications = 0 }: PortalLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleProfileUpdate = () => {
    if (!phone || !address) {
      alert('Please fill in all fields');
      return;
    }
    
    // Call API to update profile
    apiUsers.updateProfile({ address, phone })
      .then(() => {
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      })
      .catch((error) => {
        console.error('Profile update failed:', error);
        alert('Failed to update profile. Please try again.');
      });
  };

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

    setPasswordSuccess('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-6">
              <div className="h-8 w-px bg-gray-200"></div>

              {/* Settings Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:text-blue-600">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-lg">Settings</DialogTitle>
                  </DialogHeader>
                  
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-2">
                      <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                      <TabsTrigger value="password" className="text-xs">Password</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-3">
                      <div className="space-y-1 bg-gray-50 p-2 rounded text-xs">
                        <div>
                          <label className="text-gray-600">Name</label>
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Email</label>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="address" className="text-xs">Address</Label>
                          <Input
                            id="address"
                            placeholder="Enter address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-xs">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>

                      {profileSuccess && (
                        <div className="text-xs text-green-600 bg-green-50 p-1.5 rounded">✓ {profileSuccess}</div>
                      )}
                      <Button
                        onClick={handleProfileUpdate}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs h-8"
                        disabled={!address || !phone}
                      >
                        Save
                      </Button>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password" className="space-y-2">
                      <div>
                        <Label htmlFor="current-pwd" className="text-xs">Current</Label>
                        <Input
                          id="current-pwd"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-pwd" className="text-xs">New</Label>
                        <Input
                          id="new-pwd"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-pwd" className="text-xs">Confirm</Label>
                        <Input
                          id="confirm-pwd"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="show-pwd"
                          checked={showPassword}
                          onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                        />
                        <Label htmlFor="show-pwd" className="text-xs font-normal cursor-pointer">
                          Show
                        </Label>
                      </div>
                      {passwordError && (
                        <div className="text-xs text-red-600 bg-red-50 p-1.5 rounded">{passwordError}</div>
                      )}
                      {passwordSuccess && (
                        <div className="text-xs text-green-600 bg-green-50 p-1.5 rounded">✓ {passwordSuccess}</div>
                      )}
                      <Button
                        onClick={handlePasswordChange}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs h-8"
                        disabled={!currentPassword || !newPassword || !confirmPassword}
                      >
                        Update
                      </Button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="text-gray-500 hover:text-red-600 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 pt-4 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-900">{user.name}</p>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="destructive" 
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}