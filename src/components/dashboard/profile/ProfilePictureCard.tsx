"use client";

import { useRef, useState } from "react";
import { User, Camera, Loader2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/app/(dashboard)/profile/page";

interface ProfilePictureCardProps {
  user: UserProfile;
  onUserUpdate: (updated: Partial<UserProfile>) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ProfilePictureCard({
  user,
  onUserUpdate,
  onSuccess,
  onError,
}: ProfilePictureCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function formatMemberSince(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Avatar must be an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError("Avatar must be 5MB or smaller");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.message ?? "Failed to upload avatar");
        return;
      }

      onUserUpdate({ avatarUrl: data.avatarUrl });
      onSuccess("Profile picture updated");
    } catch {
      onError("Something went wrong");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="p-6 md:p-8 bg-white rounded-2xl border border-[#554116]/10 shadow-sm">
      <p className="text-xs font-semibold text-[#554116]/60 uppercase tracking-wider mb-6">
        Profile Picture
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-[#f3f4f6] flex items-center justify-center overflow-hidden relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-[#554116]/30" />
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-white flex items-center justify-center hover:bg-[#c4922a] transition-colors disabled:opacity-50"
            aria-label="Upload profile picture"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 text-[#c4922a] animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-[#c4922a]" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#0a0a0a]">
              {user.name}
            </h2>
            <p className="text-sm md:text-base text-[#0a0a0a]/60">
              {user.email ?? "No email"}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs md:text-sm text-[#0a0a0a]/50">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {formatMemberSince(user.createdAt)}</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-10 px-5 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Camera className="w-4 h-4 text-[#c4922a]" />
            {uploading ? "Uploading..." : "Upload Photo"}
          </Button>

          <p className="text-xs text-[#0a0a0a]/40">
            JPEG, PNG, WebP or GIF · Max 5 MB
          </p>
        </div>
      </div>
    </Card>
  );
}