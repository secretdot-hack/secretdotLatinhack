"use client"

// Add ethereum type to window
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation";
import { Shield, Wallet, Lock, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { InlineLoader, FullScreenLoader } from "./ui/loader"
import { ASSET_HUB_CONFIG } from "../utils/ether";
import toast, { Toaster } from "react-hot-toast";

export default function LoginScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasNotified = useRef(false);

  // Redirige automáticamente al dashboard si hay cuenta conectada
  useEffect(() => {
    if (account && !hasNotified.current) {
      // Guarda la cuenta en localStorage para el dashboard
      localStorage.setItem("secretdot_account", account);
      localStorage.setItem("secretdot_chainId", chainId ? chainId.toString() : "");
      toast.success("Wallet conectada correctamente");
      hasNotified.current = true;
      router.push("/secure-messenger");
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
    } catch (err) {
      setError("Error al conectar con MetaMask");
      toast.error("Error al conectar con MetaMask");
    }
    setIsConnecting(false);
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${ASSET_HUB_CONFIG.chainId.toString(16)}` }],
      });
      toast.success("Red cambiada correctamente");
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
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
      <div className="w-full max-w-md mx-auto">
        {/* Estado de conexión */}
        {/* {account && (
          <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center">
            <span className="text-green-400 text-xs mb-1">Wallet conectada</span>
            <span className="text-white font-mono text-sm mb-2">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="text-xs text-red-400 hover:underline"
            >
              Desconectar
            </button>
          </div>
        )} */}
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SecretDot</h1>
          <p className="text-gray-400 text-sm">Powered by <span
              className="font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Polkadot
            </span></p>
        </div>
        {/* Main Card */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Value Proposition */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">
                Comparte datos sensibles de forma segura y simple
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Utiliza la tecnología blockchain de Polkadot para compartir información confidencial con máxima
                seguridad y transparencia.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Encriptación de extremo a extremo</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Verificación en blockchain</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Control total de tus datos</span>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="space-y-4">
              <h3 className="text-white font-medium text-center mb-4">Conecta tu wallet para comenzar</h3>

              {/* MetaMask Wallet */}
              <Button
                onClick={() => handleConnectWallet("MetaMask")}
                disabled={isConnecting}
                variant="outline"
                className="w-full border-gray-600 bg-gray-700/50 hover:bg-gray-700 text-white h-12 text-base font-medium"
              >
                {isConnecting ? (
                  <>
                    <InlineLoader size={20} />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 text-orange-400" />
                    <span>MetaMask</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Other Wallets */}
              <Button
                onClick={() => handleConnectWallet("Other")}
                disabled={isConnecting}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-700/50 h-10"
              >
                <span className="text-sm">Otras wallets compatibles</span>
              </Button>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Tu wallet permanece bajo tu control. Nunca almacenamos tus claves privadas ni tenemos acceso a tus
                    fondos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            ¿Necesitas ayuda?{" "}
            <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Contacta soporte</span>
          </p>
        </div>

        {/* Loader de conexión */}
        {isConnecting && (
          <FullScreenLoader message="Conectando con tu wallet..." />
        )}
      </div>
    </div>
  )
}
