"use client";

import { useState, useEffect } from "react";
import {
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useWeb3Auth } from "@/contexts/Web3AuthContext";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { parseEther, formatEther } from "ethers/lib/utils";
import { toast } from "react-hot-toast";

// 스테이킹 컨트랙트 ABI
const STAKING_ABI = [
  "function stake() external payable",
  "function unstake(uint256 _amount) external",
  "function getUserInfo(address _user) external view returns (uint256 amount, uint256 pendingRewards)",
];

const STAKING_CONTRACT_ADDRESS = "0x7b60f68A6eF0f25Cccb584f3a6d520712424e5F9";

export default function StakePage() {
  const [amount, setAmount] = useState("");
  const [ethPrice] = useState(3500); // USD
  const [stakedAmount, setStakedAmount] = useState("0");
  const [pendingRewards, setPendingRewards] = useState("0");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({
    amount: "",
    timestamp: "",
    hash: "",
  });
  const { isAuthenticated, user, logout, provider, stake } = useWeb3Auth();
  const router = useRouter();

  const calculateUsdValue = () => {
    if (!amount) return "0.00";
    return (parseFloat(amount) * ethPrice).toFixed(2);
  };

  const calculateAnnualRewards = () => {
    if (!amount) return "0.00";
    return (parseFloat(amount) * 0.045).toFixed(4);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // 스테이킹 정보 조회
  const fetchStakingInfo = async () => {
    if (!isAuthenticated || !provider || !user?.address) {
      console.log("Cannot fetch staking info - prerequisites not met");
      return;
    }

    try {
      console.log("Fetching staking info for address:", user.address);
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        provider
      );

      const [amount, rewards] = await contract.getUserInfo(user.address);
      console.log("Staking info received:", {
        stakedAmount: formatEther(amount),
        pendingRewards: formatEther(rewards),
      });

      setStakedAmount(formatEther(amount));
      setPendingRewards(formatEther(rewards));
    } catch (error: any) {
      console.error("Failed to fetch staking info:", error);
      toast.error("스테이킹 정보를 가져오는데 실패했습니다.");
    }
  };

  // 스테이킹 실행
  const handleStake = async () => {
    if (!isAuthenticated || !amount) {
      toast.error("스테이킹에 필요한 정보가 부족합니다.");
      return;
    }

    if (parseFloat(amount) > parseFloat(user?.balance || "0")) {
      toast.error("잔액이 부족합니다.");
      return;
    }

    setIsStaking(true);
    try {
      const hash = await stake(amount);
      setTransactionHash(hash);
      toast.loading("스테이킹이 진행 중입니다. 잠시만 기다려주세요...");

      setSuccessDetails({
        amount: amount,
        timestamp: new Date().toLocaleString(),
        hash: hash,
      });

      await fetchStakingInfo();
      setAmount("");
      setIsConfirmModalOpen(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Staking failed:", error);
      toast.error(error.message || "스테이킹 중 오류가 발생했습니다.");
    } finally {
      setIsStaking(false);
    }
  };

  // 언스테이킹 실행
  const handleUnstake = async (amount: string) => {
    if (!isAuthenticated || !provider) return;

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        signer
      );

      const tx = await contract.unstake(parseEther(amount));

      toast.loading("언스테이킹 진행 중...");
      await tx.wait();
      toast.success("언스테이킹이 완료되었습니다!");

      // 정보 갱신
      fetchStakingInfo();
    } catch (error) {
      console.error("Unstaking failed:", error);
      toast.error("언스테이킹 중 오류가 발생했습니다.");
    }
  };

  // 주기적으로 스테이킹 정보 업데이트
  useEffect(() => {
    if (isAuthenticated && provider) {
      fetchStakingInfo();

      // 10초마다 스테이킹 정보 업데이트
      const interval = setInterval(fetchStakingInfo, 10000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, provider, user?.address]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 상단 네비게이션 바 */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
          >
            <span>로그아웃</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Staking Form */}
          <div className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  ETH 스테이킹
                </h2>
                <div
                  className={`flex items-center rounded-full px-4 py-2 text-sm font-medium ${
                    isAuthenticated
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <span>
                    {isAuthenticated ? "지갑 연결됨" : "지갑 연결 필요"}
                  </span>
                  <InformationCircleIcon className="ml-1.5 h-5 w-5" />
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-white p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <WalletIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      내 지갑 잔액
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-xl font-bold text-gray-900">
                        {user?.balance || "0"}
                      </p>
                      <p className="text-sm font-medium text-gray-500">ETH</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      ≈ $
                      {(parseFloat(user?.balance || "0") * ethPrice).toFixed(2)}{" "}
                      USD
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm border border-gray-100/50">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-3xl font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <span className="text-xl font-semibold text-gray-900 ml-3">
                    ETH
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    ≈ ${calculateUsdValue()} USD
                  </span>
                  <button
                    className="text-green-600 font-medium hover:text-green-700 transition-colors"
                    onClick={() => user?.balance && setAmount(user.balance)}
                  >
                    최대
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">연간 수익률</span>
                  <span className="text-lg font-semibold text-green-600">
                    4.5%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">예상 연간 수익</span>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {calculateAnnualRewards()} ETH
                    </div>
                    <div className="text-sm text-gray-500">
                      ≈ $
                      {(
                        parseFloat(calculateAnnualRewards()) * ethPrice
                      ).toFixed(2)}{" "}
                      USD
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={!isAuthenticated || !amount || isStaking}
                  className={`w-full rounded-xl bg-[#009A44] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 ${
                    !isAuthenticated || !amount || isStaking
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:-translate-y-0.5 hover:shadow-[#009A44]/20"
                  }`}
                >
                  {isStaking ? (
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span>스테이킹 진행 중...</span>
                    </div>
                  ) : (
                    "스테이킹 시작하기"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircleIcon className="w-16 h-16 text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-semibold text-white">
                    스테이킹 시작하기
                  </h3>
                  <p className="mt-2 text-white/80">
                    3분 만에 배우는 안전한 스테이킹
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  스마트한 스테이킹의 시작
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  원하는 만큼 예치하고, 연 4.5%의 수익을 받아가세요.
                  이메일만으로 시작하는 안전한 스테이킹을 경험해보세요.
                </p>
                <a
                  href="/information"
                  className="mt-6 inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors group"
                >
                  자세히 알아보기
                  <ArrowRightIcon className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Section */}
        <div className="mt-12">
          <div className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                나의 스테이킹 현황
              </h2>
              <div className="flex flex-col space-y-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">지갑 주소</span>
                      <span className="text-gray-900 font-medium">
                        {user.address.slice(0, 6)}...{user.address.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">스테이킹된 ETH</span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {parseFloat(stakedAmount).toFixed(4)} ETH
                        </div>
                        <div className="text-sm text-gray-500">
                          ≈ ${(parseFloat(stakedAmount) * ethPrice).toFixed(2)}{" "}
                          USD
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">획득한 리워드</span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {parseFloat(pendingRewards).toFixed(4)} ETH
                        </div>
                        <div className="text-sm text-gray-500">
                          ≈ $
                          {(parseFloat(pendingRewards) * ethPrice).toFixed(2)}{" "}
                          USD
                        </div>
                      </div>
                    </div>
                    {parseFloat(stakedAmount) > 0 && (
                      <button
                        onClick={() => handleUnstake(stakedAmount)}
                        className="mt-4 w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                      >
                        언스테이킹하기
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <p className="mb-4">아직 스테이킹 중인 자산이 없습니다.</p>
                    <p className="text-sm text-gray-400">
                      지갑을 연결하고 스테이킹을 시작해보세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                스테이킹 확인
              </h2>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isStaking}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">스테이킹 금액</p>
                <p className="text-2xl font-bold text-gray-900">{amount} ETH</p>
                <p className="text-sm text-gray-500">
                  ≈ ${calculateUsdValue()} USD
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-800 mb-2">
                  예상 연간 수익
                </h3>
                <p className="text-lg font-semibold text-green-600">
                  {calculateAnnualRewards()} ETH
                </p>
                <p className="text-sm text-gray-500">
                  ≈ $
                  {(parseFloat(calculateAnnualRewards()) * ethPrice).toFixed(2)}{" "}
                  USD
                </p>
              </div>

              {transactionHash && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    트랜잭션이 제출되었습니다. 완료될 때까지 기다려주세요.
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    트랜잭션 확인하기 →
                  </a>
                </div>
              )}

              <button
                onClick={handleStake}
                disabled={isStaking}
                className={`w-full bg-[#009A44] text-white py-4 px-6 rounded-xl font-semibold transition-colors ${
                  isStaking
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#008a3d]"
                }`}
              >
                {isStaking ? (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <span>처리 중...</span>
                  </div>
                ) : (
                  "스테이킹 확인"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                스테이킹 완료!
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-500">스테이킹 금액</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {successDetails.amount} ETH
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">스테이킹 시간</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {successDetails.timestamp}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">트랜잭션 해시</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${successDetails.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {successDetails.hash}
                  </a>
                </div>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
