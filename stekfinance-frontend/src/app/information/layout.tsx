"use client";

import { useWeb3Auth } from "@/contexts/Web3AuthContext";
import Sidebar from "@/components/Sidebar";

export default function InformationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useWeb3Auth();

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && <Sidebar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
