"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, KeyRound, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function validateForm(): string | null {
    if (!currentPassword) return "Please enter your current password.";
    if (!newPassword) return "Please enter a new password.";
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword) return "New passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Success — clear the form
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences.</p>
      </div>

      {/* ── Account Info ──────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          Account
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {user?.name || "—"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {user?.email || "—"}
            </div>
            <p className="text-xs text-gray-400">
              To change your email address, please contact support.
            </p>
          </div>
        </div>
      </section>

      {/* ── Change Password ───────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <KeyRound className="h-4 w-4 text-gray-400" />
          Change Password
        </h2>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="font-medium text-gray-900">Password updated successfully</p>
            <p className="text-sm text-gray-500">Your new password is active.</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setSuccess(false)}
            >
              Change Again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />

            <div className="space-y-1">
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error === "New passwords do not match.") setError("");
                }}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
              />
              {/* Live match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="pt-1">
              <Button type="submit" disabled={saving}>
                {saving
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                  : "Update Password"}
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your AuthorLoft account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          className="text-red-600 hover:bg-red-50 border-red-200"
          onClick={() => alert("To delete your account, please contact support@authorloft.com")}
        >
          Delete Account
        </Button>
      </section>
    </div>
  );
}
