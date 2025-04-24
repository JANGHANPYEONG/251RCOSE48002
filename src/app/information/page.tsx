"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useWeb3Auth } from "@/contexts/Web3AuthContext";

const OnboardingSteps = [
  {
    title: "이메일 지갑 생성",
    description: "기존 이메일로 1분 만에 안전한 지갑 생성",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6h-4M4 6h12M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
        <path d="M14 11h6v4h-6v-4z" />
      </svg>
    ),
  },
  {
    title: "예치 금액·기간 선택",
    description: "최소 0.01 ETH부터 원하는 기간만큼",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L4 12L12 16L20 12L12 2Z" />
        <path d="M4 12L12 22L20 12L12 16L4 12Z" />
      </svg>
    ),
  },
  {
    title: "리스크 확인 및 동의",
    description: "투명한 리스크 공시, 안전한 스테이킹",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const FAQItems = [
  {
    question: "스테이킹이란 무엇인가요?",
    answer:
      "스테이킹은 이더리움 네트워크의 안정성을 위해 ETH를 예치하고 보상을 받는 방식입니다. 은행 예금과 비슷하지만, 블록체인에서 진행됩니다.",
    isRisk: false,
  },
  {
    question: "슬래싱 리스크가 있나요?",
    answer:
      "STEK는 다중 검증인 분산 운영으로 슬래싱 위험을 최소화합니다. 만약의 경우를 대비해 보험 풀을 운영하고 있습니다.",
    isRisk: true,
  },
  {
    question: "언제든지 인출할 수 있나요?",
    answer:
      "네트워크 상황에 따라 인출에 최대 3-5일이 소요될 수 있습니다. 긴급 인출은 수수료가 발생할 수 있습니다.",
    isRisk: true,
  },
];

export default function InformationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [readRisks, setReadRisks] = useState<string[]>([]);
  const [amount, setAmount] = useState("0.01");
  const [period, setPeriod] = useState("12");
  const router = useRouter();
  const { isAuthenticated } = useWeb3Auth();

  const handleStartStaking = () => {
    if (isAuthenticated) {
      router.push("/stake");
    } else {
      router.push("/login");
    }
  };

  const calculateReward = () => {
    const principal = parseFloat(amount);
    const months = parseInt(period);
    const annualRate = 0.045; // 4.5%
    return ((principal * annualRate) / 12) * months;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 헤더 요약 배너 */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg backdrop-blur-sm border border-green-100/50 mb-12 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                이메일 하나로 안전 예치
                <br />
                <span className="text-5xl">연 4.5%</span>
                <span className="text-xl align-top">*</span>
              </h1>
              <p className="text-gray-600">
                * 네트워크 상황에 따라 변동될 수 있습니다
              </p>
            </div>
            <button
              onClick={handleStartStaking}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-lg hover:shadow-green-200/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              스테이킹 시작하기
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>

        {/* 3-Step 온보딩 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            스테이킹 시작하기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OnboardingSteps.map((step, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                  currentStep > index + 1
                    ? "border-2 border-green-500"
                    : "border border-green-100/50"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-4 text-white shadow-lg">
                      {step.icon}
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 버튼 */}
        <div className="flex justify-center mb-16">
          <button
            onClick={handleStartStaking}
            className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-semibold shadow-lg hover:shadow-green-200/50 transition-all duration-300 hover:-translate-y-1"
          >
            {isAuthenticated ? "스테이킹 시작하기" : "이메일로 시작하기"}
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* FAQ/리스크 아코디언 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {FAQItems.map((item, index) => (
              <Disclosure key={index}>
                {({ open }) => (
                  <div className="group rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Disclosure.Button className="w-full px-8 py-6 text-left flex justify-between items-center">
                      <span className="text-xl font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                        {item.question}
                      </span>
                      <div className="flex items-center">
                        {!readRisks.includes(item.question) && item.isRisk && (
                          <span className="mr-3 px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full font-medium">
                            읽지 않음
                          </span>
                        )}
                        <ChevronDownIcon
                          className={`w-6 h-6 text-green-600 transform transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Transition
                      show={open}
                      enter="transition duration-200 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-150 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel
                        static
                        className="px-8 py-6 text-gray-600 border-t border-gray-100 bg-gradient-to-b from-green-50/50 to-transparent"
                        onClick={() => {
                          if (
                            item.isRisk &&
                            !readRisks.includes(item.question)
                          ) {
                            setReadRisks([...readRisks, item.question]);
                          }
                        }}
                      >
                        {item.answer}
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </section>

        {/* 보상 시뮬레이터 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            예상 보상 계산
          </h2>
          <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  예치 금액 (ETH)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-lg"
                  placeholder="0.01"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  예치 기간
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-lg"
                >
                  <option value="3">3개월</option>
                  <option value="6">6개월</option>
                  <option value="12">12개월</option>
                </select>
              </div>
            </div>
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50">
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium text-gray-800">
                  예상 수익
                </span>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-green-600">
                    {calculateReward().toFixed(4)} ETH
                  </span>
                  <span className="text-sm text-gray-500">
                    ≈ ${(calculateReward() * 3500).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
