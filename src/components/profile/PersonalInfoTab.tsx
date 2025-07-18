
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, Linkedin, Phone, Globe, Building, MapPin } from 'lucide-react';
import UnifiedPhoneInput from './UnifiedPhoneInput';
import { SavedDataInput } from '@/components/ui/saved-data-input';

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
        .update({
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
        })
        .eq('id', user?.id);

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
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-muted-foreground mr-2" />
          <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SavedDataInput
                id="firstName"
                label="First Name"
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                maxLength={50}
              />
            </div>

            <div>
              <SavedDataInput
                id="lastName"
                label="Last Name"
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                maxLength={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SavedDataInput
                id="email"
                label={
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Address
                  </span>
                }
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                maxLength={255}
              />
            </div>

            <div>
              <UnifiedPhoneInput
                countryCode={profile.country_code}
                phoneNumber={profile.phone_number}
                onCountryCodeChange={(value) => setProfile({ ...profile, country_code: value })}
                onPhoneNumberChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SavedDataInput
                id="linkedinUrl"
                label={
                  <span className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-1" />
                    LinkedIn Profile URL
                  </span>
                }
                type="url"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                maxLength={500}
              />
            </div>

            <div>
              <SavedDataInput
                id="personalWebsiteUrl"
                label={
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Personal Website/Portfolio URL
                  </span>
                }
                type="url"
                value={profile.personal_website_url}
                onChange={(e) => setProfile({ ...profile, personal_website_url: e.target.value })}
                maxLength={500}
              />
            </div>
          </div>


        </div>
      </div>


      {/* Notification Settings and Privacy Settings - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center mb-6">
            <Mail className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-medium text-foreground">Notification Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-foreground">Email Notifications</label>
                <p className="text-sm text-muted-foreground">Receive notifications about your CV analysis results</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-foreground">Marketing Emails</label>
                <p className="text-sm text-muted-foreground">Receive tips, updates, and promotional content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center mb-6">
            <Lock className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-medium text-foreground">Privacy Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-foreground mb-2">Data Privacy Level</label>
              <select
                defaultValue="standard"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-input text-foreground"
              >
                <option value="minimal">Minimal - Only essential data</option>
                <option value="standard">Standard - Standard analytics and improvements</option>
                <option value="enhanced">Enhanced - Help us improve our services</option>
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                Controls how your data is used to improve our services
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Password Change and Account Management - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Change */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center mb-6">
            <Lock className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-medium text-foreground">Change Password</h3>
          </div>

          <div className="space-y-4">
            <div>
              <SavedDataInput
                id="newPassword"
                label="New Password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                maxLength={128}
              />
            </div>

            <div>
              <SavedDataInput
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                maxLength={128}
              />
            </div>

          </div>
        </div>

        {/* Account Management */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-medium text-foreground">Account Management</h3>
          </div>
          
          <div className="bg-destructive-50 border border-destructive rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">Request Account Deactivation</h4>
            <p className="text-sm text-destructive/80 mb-4">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
              Request Deactivation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
