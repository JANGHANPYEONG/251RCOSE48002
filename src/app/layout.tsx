import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Web3AuthProvider } from "@/contexts/Web3AuthContext";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STEK Finance",
  description: "Simplified Staking Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Web3AuthProvider>{children}</Web3AuthProvider>
      </body>
    </html>
  );
}
