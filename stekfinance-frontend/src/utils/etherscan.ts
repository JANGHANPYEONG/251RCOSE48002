import { formatUnits } from "ethers/lib/utils";

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = "https://api-sepolia.etherscan.io/api";

export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  methodId: string;
  functionName: string;
}

export async function getTransactions(address: string): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "1" && data.message === "OK") {
      return data.result;
    }
    throw new Error(data.message || "Failed to fetch transactions");
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function getInternalTransactions(txHash: string): Promise<any> {
  try {
    const response = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=txlistinternal&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();

    if (
      data.status === "1" &&
      data.message === "OK" &&
      data.result.length > 0
    ) {
      return data.result[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching internal transactions:", error);
    return null;
  }
}

// 트랜잭션 캐시를 위한 Map 추가
const internalTxCache = new Map<string, any>();

export async function formatTransaction(transaction: Transaction) {
  const method = transaction.functionName.toLowerCase();
  const isUnstake = method.includes("unstake");

  try {
    let formattedValue = "0";
    let internalValue = null;

    console.log("Transaction details:", {
      hash: transaction.hash,
      method,
      isUnstake,
      originalValue: transaction.value,
    });

    // 언스테이킹인 경우 먼저 Internal Transaction 값을 확인
    if (isUnstake) {
      // 캐시된 내부 트랜잭션이 있는지 확인
      let internalTx = internalTxCache.get(transaction.hash);

      if (!internalTx) {
        internalTx = await getInternalTransactions(transaction.hash);
        if (internalTx) {
          internalTxCache.set(transaction.hash, internalTx);
        }
      }

      console.log("Internal transaction:", internalTx);

      if (internalTx && internalTx.value) {
        internalValue = formatUnits(internalTx.value, 18);
        console.log("Formatted internal value:", internalValue);
        formattedValue = internalValue;
      } else {
        // 내부 트랜잭션을 찾지 못한 경우 원본 트랜잭션 값 사용
        formattedValue = formatUnits(transaction.value || "0", 18);
        console.log("Using original transaction value:", formattedValue);
      }
    } else {
      // 언스테이킹이 아닌 경우에만 transaction.value 사용
      formattedValue = formatUnits(transaction.value || "0", 18);
    }

    console.log("Pre-formatting value:", formattedValue);

    // 숫자를 문자열로 변환할 때 지수 표기법 방지
    const numValue = parseFloat(formattedValue);
    formattedValue = numValue.toFixed(6); // 소수점 6자리까지 표시

    console.log("Final formatted value:", formattedValue);

    const timestamp = transaction.timeStamp
      ? new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(
          "ko-KR",
          {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
          }
        )
      : "";

    // 최종 결과 반환
    return {
      ...transaction,
      value: `${isUnstake ? "+" : "-"}${formattedValue} ETH`,
      gasPrice: formatUnits(transaction.gasPrice || "0", "gwei"),
      gasUsed: formatUnits(transaction.gasUsed || "0", "gwei"),
      timestamp: timestamp,
    };
  } catch (error) {
    console.error("Error formatting transaction:", error);
    console.error("Transaction data:", transaction);
    return {
      ...transaction,
      value: isUnstake
        ? "+0.000000 ETH"
        : "-" + formatUnits(transaction.value || "0", 18) + " ETH",
      gasPrice: formatUnits(transaction.gasPrice || "0", "gwei"),
      gasUsed: formatUnits(transaction.gasUsed || "0", "gwei"),
      timestamp: transaction.timeStamp
        ? new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(
            "ko-KR"
          )
        : "",
    };
  }
}

export function getTransactionType(tx: Transaction) {
  // Method ID와 Function Name을 기반으로 거래 유형 결정
  const method = tx.functionName.toLowerCase();

  if (method.includes("unstake")) {
    return {
      type: "언스테이킹",
      icon: "🔓",
      textColor: "text-purple-600",
    };
  } else if (method.includes("stake")) {
    return {
      type: "스테이킹",
      icon: "🔒",
      textColor: "text-blue-600",
    };
  } else if (method === "transfer" || method === "") {
    // 일반 전송의 경우
    return {
      type: tx.value === "0" ? "컨트랙트 호출" : "전송",
      icon: tx.value === "0" ? "📝" : "💸",
      textColor: "text-gray-600",
    };
  } else {
    // 기타 컨트랙트 함수 호출
    return {
      type: method || "컨트랙트 호출",
      icon: "📝",
      textColor: "text-gray-600",
    };
  }
}
