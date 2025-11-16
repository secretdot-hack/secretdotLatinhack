"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation";
import { Wallet, Lock, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { InlineLoader, FullScreenLoader } from "./ui/loader"
import { PolkadotLoader } from "./ui/loader-polkadot"
import { ASSET_HUB_CONFIG } from "../utils/ether";
import toast, { Toaster } from "react-hot-toast";

export default function LoginScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasNotified = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirige automáticamente al dashboard si hay cuenta conectada
  useEffect(() => {
    if (account && !hasNotified.current) {
      setIsRedirecting(true);
      // Guarda la cuenta en localStorage para el dashboard
      localStorage.setItem("secretdot_account", account);
      localStorage.setItem("secretdot_chainId", chainId ? chainId.toString() : "");
      toast.success("Wallet conectada correctamente");
      hasNotified.current = true;
      
      // Pequeño delay para asegurar que el loader se vea
      setTimeout(() => {
        router.push("/secure-messenger");
      }, 500);
    }
  }, [account, chainId, router]);



  // MetaMask connect logic
  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask no detectado. Instala MetaMask para continuar.");
      toast.error("MetaMask no detectado. Instala MetaMask para continuar.");
      setIsConnecting(false);
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // Cambia de red si es necesario
      if (currentChainId !== ASSET_HUB_CONFIG.chainId) {
        await switchNetwork();
      }
      
      // NO ponemos setIsConnecting(false) aquí
      // El loader se mantendrá visible hasta que se complete la redirección
    } catch (err) {
      setError("Error al conectar con MetaMask");
      toast.error("Error al conectar con MetaMask");
      setIsConnecting(false);
    }
  };

  const switchNetwork = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Ethereum provider not available");
      }
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${ASSET_HUB_CONFIG.chainId.toString(16)}` }],
      });
      toast.success("Red cambiada correctamente");
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          if (!window.ethereum) {
            throw new Error("Ethereum provider not available");
          }
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${ASSET_HUB_CONFIG.chainId.toString(16)}`,
                chainName: ASSET_HUB_CONFIG.name,
                rpcUrls: [ASSET_HUB_CONFIG.rpc],
                blockExplorerUrls: [ASSET_HUB_CONFIG.blockExplorer],
              },
            ],
          });
          toast.success("Red agregada y cambiada correctamente");
        } catch {
          setError("No se pudo agregar la red a MetaMask");
          toast.error("No se pudo agregar la red a MetaMask");
        }
      } else {
        setError("No se pudo cambiar de red");
        toast.error("No se pudo cambiar de red");
      }
    }
  };

  // Cambia el handler para MetaMask
  const handleConnectWallet = (walletType: string) => {
    if (walletType === "MetaMask") {
      connectMetaMask();
      return;
    }
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      toast("Funcionalidad de otras wallets próximamente", { icon: "⏳" });
      // console.log(`Connecting to ${walletType}...`);
    }, 2000);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setError(null);
    toast("Wallet desconectada", { icon: "👋" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-lg mx-auto">
        {/* Compact Header - Logo on top */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center mb-3">
            <PolkadotLoader size={64} />
          </div>
          <h1 className="text-2xl font-bold text-white">SecretDot</h1>
          <p className="text-gray-400 text-xs mt-1">Powered by <span
              className="font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Polkadot
            </span></p>
        </div>

        {/* Main Card - Ultra Compact */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            {/* Hero - 2 líneas máximo */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-white">
                Comparte datos sensibles de forma segura
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Blockchain de Polkadot con encriptación E2E
              </p>
            </div>

            {/* Features Horizontal */}
            <div className="grid grid-cols-3 gap-3 mb-6 md:gap-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-300 leading-tight">E2E Encryption</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-300 leading-tight">Blockchain Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-300 leading-tight">Full Control</span>
              </div>
            </div>

            {/* Dominant CTA */}
            <Button
              onClick={() => handleConnectWallet("MetaMask")}
              disabled={isConnecting}
              variant="outline"
              className="w-full border-purple-500 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold h-11 text-sm transition-all duration-200"
            >
              {isConnecting ? (
                <>
                  <InlineLoader size={18} />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Conectar Wallet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* Minimal Security Note */}
            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30 flex gap-2">
              <Lock className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-300">
                Tus claves privadas siempre bajo tu control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer - Ultra Minimal */}
        <p className="text-center text-gray-500 text-xs mt-4">
          <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Soporte</span>
        </p>

        {/* Loader de conexión y redirección */}
        {(isConnecting || isRedirecting) && (
          <FullScreenLoader 
            message={isRedirecting ? "Redirigiendo..." : "Conectando..."} 
          />
        )}
      </div>
    </div>
  )
}
