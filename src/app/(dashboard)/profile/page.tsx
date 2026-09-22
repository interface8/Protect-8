"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
import ProfilePictureCard from "@/components/dashboard/profile/ProfilePictureCard";
import ProfileInfoCard from "@/components/dashboard/profile/ProfileInfoCard";

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: { name: string };
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Called by children when user data changes
  function handleUserUpdate(updated: Partial<UserProfile>) {
    if (user) setUser({ ...user, ...updated });
  }

  function handleSuccess(message: string) {
    setSuccessMessage(message);
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <p className="text-red-500">{error || "Failed to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f3f4f6]">
      <div className="w-full xl:w-[60%] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-6">
        {/* Page Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[#554116]/60 hover:text-[#c4922a] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#0a0a0a]">
            My Profile
          </h1>
          <p className="text-sm md:text-base text-[#0a0a0a]/60 mt-1">
            Manage your personal information and profile picture.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Profile Picture Card */}
        <ProfilePictureCard
          user={user}
          onUserUpdate={handleUserUpdate}
          onSuccess={handleSuccess}
          onError={setError}
        />

        {/* Personal Information Card */}
        <ProfileInfoCard
          user={user}
          onUserUpdate={handleUserUpdate}
          onSuccess={handleSuccess}
          onError={setError}
        />
      </div>
    </div>
  );
}