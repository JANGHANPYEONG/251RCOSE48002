"use client";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useWeb3Auth } from "@/contexts/Web3AuthContext";
import { useRouter } from "next/navigation";
import {
  getTransactions,
  formatTransaction,
  getTransactionType,
  Transaction,
} from "@/utils/etherscan";
import Link from "next/link";

export default function WalletPage() {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formattedTransactions, setFormattedTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const { user, isAuthenticated, isLoading, getBalance, withdraw } =
    useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user?.address) {
      fetchTransactions();
    }
  }, [user?.address]);

  const fetchTransactions = async () => {
    if (!user?.address) return;

    setIsLoadingTransactions(true);
    try {
      const txs = await getTransactions(user.address);
      console.log("Raw transactions:", txs);
      setTransactions(txs);

      // Format transactions sequentially to prevent race conditions
      const formatted = [];
      for (const tx of txs) {
        console.log(`Formatting transaction:`, tx);
        const result = await formatTransaction(tx);
        console.log(`Formatted result:`, result);
        formatted.push(result);
      }
      setFormattedTransactions(formatted);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!user?.address) return;

    try {
      await navigator.clipboard.writeText(user.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleWithdraw = async () => {
    if (!user?.address) return;

    // Validate inputs
    if (!recipientAddress || !amount) {
      setError("모든 필드를 입력해주세요");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("출금 금액은 0보다 커야 합니다");
      return;
    }

    if (parseFloat(amount) > parseFloat(user.balance)) {
      setError("잔액이 부족합니다");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");

      const hash = await withdraw(recipientAddress, amount);
      setTxHash(hash);

      // Reset form and close modal after a delay
      setTimeout(() => {
        setRecipientAddress("");
        setAmount("");
        setTxHash("");
        setIsWithdrawModalOpen(false);
        setIsProcessing(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "출금 중 오류가 발생했습니다");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#009A44] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
          내 지갑
        </h1>

        {/* 지갑 정보 카드 */}
        <div className="mt-8">
          <div className="group relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent rounded-2xl"></div>
            <div className="relative">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    지갑 주소
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">
                      {user.address}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="주소 복사하기"
                    >
                      {copySuccess ? (
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    보유 ETH
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {user.balance} ETH
                  </span>
                </div>
              </div>

              {/* 입출금 버튼 */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="flex-1 group relative rounded-xl bg-[#009A44] px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[#009A44]/20"
                >
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownIcon className="h-5 w-5" />
                    <span>입금하기</span>
                  </div>
                </button>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="flex-1 group relative rounded-xl bg-white px-6 py-3 text-lg font-semibold text-[#009A44] shadow-lg border-2 border-[#009A44] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUpIcon className="h-5 w-5" />
                    <span>출금하기</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 거래 내역 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            거래 내역
          </h2>
          {isLoadingTransactions ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#009A44] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">거래 내역을 불러오는 중...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      거래
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formattedTransactions.map((formattedTx, index) => {
                    const tx = transactions[index];
                    const txType = getTransactionType(tx);
                    return (
                      <tr key={tx.hash} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formattedTx.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{txType.icon}</span>
                            <span className={`text-sm ${txType.textColor}`}>
                              {txType.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-900 hover:text-[#009A44] flex items-center gap-1"
                          >
                            <span className="font-mono">
                              {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                            </span>
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <span
                            className={
                              txType.type === "언스테이킹"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {formattedTx.value}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            성공
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">출금하기</h2>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보유 ETH
                </label>
                <div className="text-xl font-bold text-gray-900">
                  {user.balance} ETH
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발신자 주소
                </label>
                <div className="font-mono text-sm text-gray-600 break-all">
                  {user.address}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수신자 주소
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009A44] focus:border-transparent"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출금 금액 (ETH)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009A44] focus:border-transparent"
                  placeholder="0.0"
                  step="0.000000000000000001"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              {txHash && (
                <div className="text-green-500 text-sm">
                  트랜잭션이 성공적으로 처리되었습니다!
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-[#009A44] hover:underline"
                  >
                    트랜잭션 확인하기
                  </a>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={isProcessing}
                className={`w-full bg-[#009A44] text-white py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isProcessing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#008a3d]"
                }`}
              >
                {isProcessing ? "처리 중..." : "출금하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">입금하기</h2>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  아래 주소로 ETH를 전송하시면 자동으로 입금됩니다.
                  <br />
                  <span className="text-red-500">
                    주의: Sepolia 테스트넷 ETH만 입금 가능합니다.
                  </span>
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      지갑 주소
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="주소 복사하기"
                    >
                      {copySuccess ? (
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 font-mono text-sm text-gray-900 break-all">
                    {user?.address}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  입금 안내
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sepolia 테스트넷에서만 입금이 가능합니다</li>
                  <li>
                    • 입금 후 잔액이 업데이트되기까지 시간이 걸릴 수 있습니다
                  </li>
                  <li>• 입금 내역은 거래 내역에서 확인할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
