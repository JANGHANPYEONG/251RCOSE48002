"use client";

import Sidebar from "@/components/Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-container flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
