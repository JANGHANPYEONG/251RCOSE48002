"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ethers } from "ethers";

interface Web3AuthContextType {
  web3auth: Web3Auth | null;
  provider: ethers.providers.Web3Provider | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    address: string;
    balance: string;
  } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getBalance: () => Promise<string>;
  withdraw: (to: string, amount: string) => Promise<string>;
  stake: (amount: string) => Promise<string>;
  unstake: (amount: string) => Promise<string>;
}

const Web3AuthContext = createContext<Web3AuthContextType>({
  web3auth: null,
  provider: null,
  isLoading: true,
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  getBalance: async () => "0",
  withdraw: async () => "",
  stake: async () => "",
  unstake: async () => "",
});

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

// 스테이킹 컨트랙트 ABI와 주소 추가
const STAKING_ABI = [
  "function stake() external payable",
  "function unstake(uint256 _amount) external",
  "function getUserInfo(address _user) external view returns (uint256 amount, uint256 pendingRewards)",
];

const STAKING_CONTRACT_ADDRESS = "0x7b60f68A6eF0f25Cccb584f3a6d520712424e5F9";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testnet",
  blockExplorer: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const web3AuthConfig = {
  clientId,
  chainConfig,
  uiConfig: {
    theme: "light",
    loginMethodsOrder: ["google", "facebook"],
    defaultLanguage: "ko",
    appName: "STEK Finance",
    logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
    logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
  },
};

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ address: string; balance: string } | null>(
    null
  );

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0xaa36a7", // Sepolia chainId
            rpcTarget: process.env.NEXT_PUBLIC_RPC_URL || "",
            displayName: "Ethereum Sepolia",
            blockExplorer: "https://sepolia.etherscan.io",
            ticker: "ETH",
            tickerName: "Ethereum",
          },
          web3AuthNetwork: "testnet",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "testnet",
            uxMode: "popup",
            whiteLabel: {
              defaultLanguage: "ko",
              mode: "light",
              theme: { primary: "#009A44" },
            },
            loginConfig: {
              google: {
                name: "Google로 로그인",
                verifier: "google",
                typeOfLogin: "google",
                clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
              },
            },
          },
        });

        web3auth.configureAdapter(openloginAdapter);

        await web3auth.initModal();
        setWeb3auth(web3auth);

        if (web3auth.connected) {
          const web3Provider = new ethers.providers.Web3Provider(
            web3auth.provider!
          );
          setProvider(web3Provider);
          setIsAuthenticated(true);

          // 사용자 정보 설정
          const signer = web3Provider.getSigner();
          const address = await signer.getAddress();
          const balance = await web3Provider.getBalance(address);
          setUser({
            address,
            balance: ethers.utils.formatEther(balance),
          });
        }
      } catch (error) {
        console.error("Failed to initialize Web3Auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      throw new Error("Web3Auth not initialized");
    }

    try {
      const web3authProvider = await web3auth.connect();
      const web3Provider = new ethers.providers.Web3Provider(web3authProvider!);
      setProvider(web3Provider);
      setIsAuthenticated(true);

      // 사용자 정보 설정
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      const balance = await web3Provider.getBalance(address);
      setUser({
        address,
        balance: ethers.utils.formatEther(balance),
      });
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!web3auth) {
      throw new Error("Web3Auth not initialized");
    }

    try {
      await web3auth.logout();
      setProvider(null);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  };

  const getBalance = async () => {
    if (!provider || !user) {
      return "0";
    }

    try {
      const balance = await provider.getBalance(user.address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  };

  const withdraw = async (to: string, amount: string) => {
    if (!provider || !user) {
      throw new Error("Not authenticated");
    }

    try {
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update balance after successful transaction
      const newBalance = await provider.getBalance(user.address);
      setUser({
        ...user,
        balance: ethers.utils.formatEther(newBalance),
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to withdraw:", error);
      throw error;
    }
  };

  const stake = async (amount: string) => {
    if (!provider || !user) {
      throw new Error("Not authenticated");
    }

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        signer
      );

      // Get current gas price
      const gasPrice = await provider.getGasPrice();

      // Parse the amount
      const parsedAmount = ethers.utils.parseEther(amount);

      console.log("Starting stake transaction with parameters:", {
        contract: STAKING_CONTRACT_ADDRESS,
        from: user.address,
        amount: parsedAmount.toString(),
        gasPrice: gasPrice.toString(),
      });

      // Estimate gas with a reasonable initial limit
      let estimatedGas;
      try {
        estimatedGas = await contract.estimateGas.stake({
          value: parsedAmount,
          gasLimit: 150000, // Reduced initial gas limit
        });
        console.log("Estimated gas:", estimatedGas.toString());
      } catch (error) {
        console.error("Gas estimation failed:", error);
        estimatedGas = ethers.BigNumber.from(100000); // Lower fallback gas limit
      }

      // Add 15% buffer to gas limit
      const adjustedGasLimit = estimatedGas.mul(115).div(100);

      console.log("Sending stake transaction with parameters:", {
        value: parsedAmount.toString(),
        gasPrice: gasPrice.toString(),
        gasLimit: adjustedGasLimit.toString(),
      });

      // Send transaction with optimized gas settings
      const tx = await contract.stake({
        value: parsedAmount,
        gasPrice: gasPrice.mul(90).div(100), // Use 90% of current gas price
        gasLimit: adjustedGasLimit,
      });

      console.log("Transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      });

      // Update balance after successful transaction
      const newBalance = await provider.getBalance(user.address);
      setUser({
        ...user,
        balance: ethers.utils.formatEther(newBalance),
      });

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Failed to stake:", error);
      if (error.error) {
        console.error("Error details:", {
          code: error.error.code,
          message: error.error.message,
          data: error.error.data,
        });
      }
      if (error.transaction) {
        console.error("Transaction details:", {
          from: error.transaction.from,
          to: error.transaction.to,
          value: error.transaction.value,
          data: error.transaction.data,
        });
      }
      throw error;
    }
  };

  const unstake = async (amount: string) => {
    if (!provider || !user) {
      throw new Error("Not authenticated");
    }

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_ABI,
        signer
      );

      const parsedAmount = ethers.utils.parseEther(amount);
      const tx = await contract.unstake(parsedAmount);

      const receipt = await tx.wait();

      // Update balance after successful transaction
      const newBalance = await provider.getBalance(user.address);
      setUser({
        ...user,
        balance: ethers.utils.formatEther(newBalance),
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to unstake:", error);
      throw error;
    }
  };

  return (
    <Web3AuthContext.Provider
      value={{
        web3auth,
        provider,
        isLoading,
        isAuthenticated,
        user,
        login,
        logout,
        getBalance,
        withdraw,
        stake,
        unstake,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
}

export function useWeb3Auth() {
  return useContext(Web3AuthContext);
}
