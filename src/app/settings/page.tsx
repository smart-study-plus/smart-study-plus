"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Change Email Handler
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);
    try {
      const supabase = createClient();
      // Only update email, do not re-authenticate here
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailSuccess('Email updated! Please check your inbox to confirm.');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Change Password Handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);
    setPassLoading(true);
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      setPassLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      // Get current user email safely
      const userResult = await supabase.auth.getUser();
      const userEmail = userResult.data.user?.email;
      if (!userEmail) throw new Error('Could not get current user email.');
      // Re-authenticate
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: oldPassword,
      });
      if (signInErr) throw signInErr;
      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassSuccess('Password updated successfully!');
    } catch (err) {
      setPassError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-gray-700 mb-6">Manage your account preferences and application settings here.</p>
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Change Email</h2>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={emailPassword}
                onChange={e => setEmailPassword(e.target.value)}
                required
              />
            </div>
            {emailError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600">{emailError}</div>}
            {emailSuccess && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">{emailSuccess}</div>}
            <Button type="submit" className="w-full" disabled={emailLoading}>{emailLoading ? 'Updating...' : 'Update Email'}</Button>
          </form>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600">{passError}</div>}
            {passSuccess && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">{passSuccess}</div>}
            <Button type="submit" className="w-full" disabled={passLoading}>{passLoading ? 'Updating...' : 'Update Password'}</Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
