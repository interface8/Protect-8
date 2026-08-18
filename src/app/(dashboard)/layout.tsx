import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <div className="flex-1 ml-[240px] bg-[#f3f4f6]">
        <TopBar pageTitle="Home" />
        <main className="">{children}</main>
      </div>
    </div>
  );
}