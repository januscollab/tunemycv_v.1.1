
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, Save, Linkedin, Phone, Globe } from 'lucide-react';
import CountryCodeSelect from './CountryCodeSelect';

interface PersonalInfoTabProps {
  credits: number;
  memberSince: string;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ credits, memberSince }) => {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    linkedin_url: '',
    phone_number: '',
    country_code: '+1',
    personal_website_url: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user?.email || '',
          linkedin_url: data.linkedin_url || '',
          phone_number: data.phone_number || '',
          country_code: data.country_code || '+1',
          personal_website_url: data.personal_website_url || ''
        });
      } else {
        setProfile({
          first_name: '',
          last_name: '',
          email: user?.email || '',
          linkedin_url: '',
          phone_number: '',
          country_code: '+1',
          personal_website_url: ''
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          linkedin_url: profile.linkedin_url,
          phone_number: profile.phone_number,
          country_code: profile.country_code,
          personal_website_url: profile.personal_website_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update email in auth if changed
      if (profile.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });
        if (emailError) throw emailError;
        toast({ 
          title: 'Success', 
          description: 'Profile updated! Please check your new email for verification.' 
        });
      } else {
        toast({ title: 'Success', description: 'Profile updated successfully!' });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update profile', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }

    if (passwords.new.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(passwords.new);
      if (error) throw error;

      toast({ title: 'Success', description: 'Password updated successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update password', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Profile Information</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <div className="flex gap-2">
                <CountryCodeSelect
                  value={profile.country_code}
                  onChange={(value) => setProfile({ ...profile, country_code: value })}
                  className="w-32"
                />
                <input
                  id="phoneNumber"
                  type="tel"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                  placeholder="123 456 7890"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                <Linkedin className="h-4 w-4 inline mr-1" />
                LinkedIn Profile URL
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label htmlFor="personalWebsiteUrl" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                <Globe className="h-4 w-4 inline mr-1" />
                Personal Website/Portfolio URL
              </label>
              <input
                id="personalWebsiteUrl"
                type="url"
                value={profile.personal_website_url}
                onChange={(e) => setProfile({ ...profile, personal_website_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-zapier-orange text-white rounded-md hover:bg-zapier-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center mb-6">
          <Lock className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Change Password</h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !passwords.new || !passwords.confirm}
            className="flex items-center px-4 py-2 bg-zapier-orange text-white rounded-md hover:bg-zapier-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Lock className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center mb-6">
          <Mail className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Notification Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700 dark:text-apple-core/80">Email Notifications</label>
              <p className="text-sm text-gray-500 dark:text-apple-core/60">Receive notifications about your CV analysis results</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zapier-orange/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zapier-orange"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700 dark:text-apple-core/80">Marketing Emails</label>
              <p className="text-sm text-gray-500 dark:text-apple-core/60">Receive tips, updates, and promotional content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={false}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zapier-orange/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zapier-orange"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center mb-6">
          <Lock className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Privacy Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-apple-core/80 mb-2">Data Privacy Level</label>
            <select
              defaultValue="standard"
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
            >
              <option value="minimal">Minimal - Only essential data</option>
              <option value="standard">Standard - Standard analytics and improvements</option>
              <option value="enhanced">Enhanced - Help us improve our services</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-apple-core/60 mt-1">
              Controls how your data is used to improve our services
            </p>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Account Management</h3>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Request Account Deactivation</h4>
          <p className="text-sm text-red-700 mb-4">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Request Deactivation
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
