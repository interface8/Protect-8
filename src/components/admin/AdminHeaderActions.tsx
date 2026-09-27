"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminHeaderActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      clearCurrentUser();
      router.replace("/login");
      router.refresh();
    }
  }

  return <button type="button" onClick={() => void logout()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"><LogOut className="h-4 w-4" />{loading ? "Signing out…" : "Sign out"}</button>;
}
