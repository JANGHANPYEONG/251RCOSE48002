"use client";

import {
  HomeIcon,
  ChartBarIcon,
  InformationCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "스테이킹", href: "/stake", icon: HomeIcon },
  { name: "대시보드", href: "/dashboard", icon: ChartBarIcon },
  { name: "내 지갑", href: "/wallet", icon: WalletIcon },
  { name: "서비스 안내", href: "/information", icon: InformationCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="relative flex h-screen flex-col bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] backdrop-blur-xl">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-green-50/20" />

      {/* Vertical line decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-green-200/50 to-transparent" />

      {/* Content */}
      <div className="relative">
        {/* 상단 로고 영역 */}
        <div className="flex h-24 items-center justify-center px-6 pt-8">
          <Link
            href="/"
            className="relative flex items-center transition-transform hover:scale-[0.98]"
          >
            <Image
              src="/logo.png"
              alt="STEK Finance Logo"
              width={180}
              height={45}
              priority
              className="w-44"
              style={{
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 space-y-2.5 px-4 py-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200/50"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent hover:text-green-600"
                }`}
              >
                {/* Hover highlight effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                {/* Active highlight line */}
                {isActive && (
                  <div className="absolute -right-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-green-400 to-green-600" />
                )}

                {/* Icon */}
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-green-600"
                  }`}
                  aria-hidden="true"
                />

                {/* Menu name */}
                <span className="relative">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 하단 정보 */}
        <div className="p-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            <div className="relative flex items-center space-x-3">
              <div className="flex h-2.5 w-2.5 items-center justify-center">
                <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-green-400 opacity-75"></div>
                <div className="relative h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                네트워크 상태: 정상
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
