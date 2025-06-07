
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, Linkedin, Phone, Globe, Building, MapPin } from 'lucide-react';
import CountryCodeSelect from './CountryCodeSelect';
import SecureInput from '@/components/security/SecureInput';

interface PersonalInfoTabProps {
  credits: number;
  memberSince: string;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ credits, memberSince }) => {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    linkedin_url: '',
    phone_number: '',
    country_code: '+1',
    personal_website_url: '',
    company_size_preference: '',
    work_location_preference: ''
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

  // Auto-save profile changes with debounce
  useEffect(() => {
    if (!user || loading || isInitialLoad) return;
    
    const timeoutId = setTimeout(() => {
      handleUpdateProfile();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [profile]);

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
          personal_website_url: data.personal_website_url || '',
          company_size_preference: (data as any).company_size_preference || '',
          work_location_preference: (data as any).work_location_preference || ''
        });
      } else {
        setProfile({
          first_name: '',
          last_name: '',
          email: user?.email || '',
          linkedin_url: '',
          phone_number: '',
          country_code: '+1',
          personal_website_url: '',
          company_size_preference: '',
          work_location_preference: ''
        });
      }
      setIsInitialLoad(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
      setIsInitialLoad(false);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
          company_size_preference: profile.company_size_preference,
          work_location_preference: profile.work_location_preference,
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Personal Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                First Name
              </label>
              <SecureInput
                id="firstName"
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter your first name"
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                Last Name
              </label>
              <SecureInput
                id="lastName"
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter your last name"
                maxLength={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <SecureInput
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter your email address"
                maxLength={255}
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
                <SecureInput
                  id="phoneNumber"
                  type="tel"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                  placeholder="123 456 7890"
                  maxLength={20}
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
              <SecureInput
                id="linkedinUrl"
                type="url"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="https://linkedin.com/in/yourprofile"
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="personalWebsiteUrl" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                <Globe className="h-4 w-4 inline mr-1" />
                Personal Website/Portfolio URL
              </label>
              <SecureInput
                id="personalWebsiteUrl"
                type="url"
                value={profile.personal_website_url}
                onChange={(e) => setProfile({ ...profile, personal_website_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="https://yourportfolio.com"
                maxLength={500}
              />
            </div>
          </div>


        </div>
      </div>


      {/* Notification Settings and Privacy Settings - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>


      {/* Password Change and Account Management - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Change */}
        <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
          <div className="flex items-center mb-6">
            <Lock className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Change Password</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                New Password
              </label>
              <SecureInput
                id="newPassword"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Enter new password"
                maxLength={128}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
                Confirm New Password
              </label>
              <SecureInput
                id="confirmPassword"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
                placeholder="Confirm new password"
                maxLength={128}
              />
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
    </div>
  );
};

export default PersonalInfoTab;
