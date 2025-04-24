"use client";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
          대시보드
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Staked */}
          <div className="group relative rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">
                  총 스테이킹
                </h3>
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">0 ETH</p>
                <p className="mt-1 text-sm text-gray-500">≈ $0.00 USD</p>
              </div>
            </div>
          </div>

          {/* Total Rewards */}
          <div className="group relative rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">총 수익</h3>
                <ArrowDownIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-green-600">0 ETH</p>
                <p className="mt-1 text-sm text-gray-500">≈ $0.00 USD</p>
              </div>
            </div>
          </div>

          {/* APR */}
          <div className="group relative rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">
                  현재 수익률
                </h3>
                <ClockIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">4.5%</p>
                <p className="mt-1 text-sm text-gray-500">변동금리</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staking History */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            스테이킹 내역
          </h2>
          <div className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-gray-100 p-4 mx-auto mb-4 w-fit">
                    <ClockIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">스테이킹 내역이 없습니다</p>
                  <p className="text-sm text-gray-400">
                    첫 스테이킹을 시작하고 수익을 얻어보세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards History */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">수익 내역</h2>
          <div className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="rounded-full bg-gray-100 p-4 mx-auto mb-4 w-fit">
                    <ArrowDownIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">수익 내역이 없습니다</p>
                  <p className="text-sm text-gray-400">
                    스테이킹을 시작하면 여기에서 수익을 확인할 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
