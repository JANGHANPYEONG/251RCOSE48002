"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useWeb3Auth } from "@/contexts/Web3AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/stake");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      await login();
      router.push("/stake");
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FA] via-white to-[#F1F8F4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#009A44] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F8F9FA] via-white to-[#F1F8F4]">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,154,68,0.05),transparent)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center">
          {/* 로고 */}
          <div className="mb-12">
            <Image
              src="/logo.png"
              alt="STEK Finance"
              width={200}
              height={50}
              priority
            />
          </div>

          {/* 로그인 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-xl"
          >
            <h1 className="text-2xl font-bold text-center text-[#0B1527] mb-8">
              로그인
            </h1>

            <button
              onClick={handleLogin}
              className="w-full group relative rounded-xl bg-[#009A44] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[#009A44]/20"
            >
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              Web3Auth로 시작하기
            </button>

            <p className="mt-6 text-sm text-center text-gray-600">
              이메일로 간편하게 로그인하고
              <br />
              ETH 스테이킹을 시작하세요
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
