import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import LawyerSidebar from "@/components/lawyer/LawyerSidebar";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import BottomNav from "@/components/dashboard/BottomNav";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "citizen" && user.role !== "lawyer") redirect("/dashboard");

  if (user.role === "lawyer") {
    return <div className="min-h-screen bg-[#f5f3f0] md:pl-[240px]"><LawyerSidebar />{children}</div>;
  }

  return <div className="min-h-screen bg-[#f3f4f6] md:flex"><Sidebar /><div className="min-w-0 flex-1 md:ml-[240px] md:pb-0"><TopBar pageTitle="Messages" /><main>{children}</main></div><BottomNav /></div>;
}
