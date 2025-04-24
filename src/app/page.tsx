"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const metrics = {
    apr: "4.5%",
    totalStaked: "$15M+",
    activeUsers: "3K+",
  };

  // 로그인 상태에 따라 로고 클릭 시 리다이렉션
  const handleLogoClick = () => {
    // TODO: 실제 로그인 상태 체크 로직 추가
    const isLoggedIn = false;
    if (isLoggedIn) {
      router.push("/stake");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F8F9FA] via-white to-[#F1F8F4]">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,154,68,0.05),transparent)]" />

      {/* 로고만 있는 헤더 */}
      <div className="relative z-20">
        <div className="px-6 py-6">
          <div onClick={handleLogoClick} className="cursor-pointer w-fit">
            <Image
              src="/logo.png"
              alt="STEK Finance"
              width={120}
              height={30}
              priority
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl w-full px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* 왼쪽: 텍스트 영역 */}
            <div className="flex flex-col items-start justify-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#0B1527]">
                이메일 하나로 시작하는
                <br />
                안전한 <span className="text-[#009A44]">ETH 스테이킹</span>
              </h1>
              <div className="mt-4 flex items-center gap-2">
                <p className="text-xl text-gray-700">
                  연 4.5% 예상 수익, 지금 바로 예치하세요
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/login"
                  className="group relative rounded-xl bg-[#009A44] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[#009A44]/20"
                >
                  스테이킹 시작하기
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="/information"
                  className="group rounded-xl border-2 border-[#009A44] bg-white px-8 py-4 text-lg font-semibold text-[#009A44] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-center"
                >
                  더 알아보기
                </Link>
              </div>

              {/* Key Metrics */}
              <div className="mt-12 grid grid-cols-3 gap-6 w-full">
                <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-[#009A44]">
                    {metrics.apr}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">연간 수익률</p>
                </div>
                <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-[#009A44]">
                    {metrics.totalStaked}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">총 예치 금액</p>
                </div>
                <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-[#009A44]">
                    {metrics.activeUsers}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">활성 사용자</p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 이미지 영역 */}
            <div className="relative flex items-center justify-center">
              {/* 크리스탈 빛나는 효과 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,154,68,0.15)_0%,transparent_70%)]"
                />
                <motion.div
                  animate={{
                    scale: [1.1, 1.3, 1.1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,154,68,0.1)_0%,transparent_60%)]"
                />
              </div>

              {/* 파티클 효과 */}
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, i % 2 === 0 ? 10 : -10, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                    className="absolute w-2 h-2 rounded-full bg-[#009A44]/20"
                    style={{
                      left: `${45 + Math.random() * 10}%`,
                      top: `${45 + Math.random() * 10}%`,
                    }}
                  />
                ))}
              </div>

              {/* 메인 로고 */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="relative h-[400px] w-[400px] sm:h-[500px] sm:w-[500px]"
              >
                <Image
                  src="/landing_logo.png"
                  alt="STEK Finance 로고"
                  fill
                  priority
                  className="object-contain"
                />
              </motion.div>

              {/* 빛나는 효과 */}
              <motion.div
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,154,68,0.1),transparent)] blur-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
