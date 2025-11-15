"use client"

import { useEffect, useState } from "react"
import SecureMessageModal from "./Secure-Message-Modal"
import OnboardingModal from "./OnboardingModal"
import { Plus, Shield, Key, Clock, CheckCircle, Send, Inbox, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { MessageSkeletonList } from "./ui/message-skeleton"
import { getContract } from "~/utils/contract"
import { getSignedContract } from "~/utils/contract"
import { ethers } from "ethers"
import { Toaster, toast } from "react-hot-toast"
import { addPaseoNetwork, isCorrectNetwork } from "~/utils/ether"
import { Buffer } from "buffer"

// Copy/Textos de la aplicación
const DASHBOARD_COPY = {
  common: {
    yourIdentity: "Tu public key",
    yourAddress: "Tu dirección",
    chainId: "ID de la cadena",
  },
  header: {
    title: "SecretDot",
    subtitle: "Mensajería privada y descentralizada con cifrado end-to-end en Polkadot",
    subtitleHighlight: "Polkadot",
  },
  tip: {
    label: "💡",
    description: "¿Quieres probar? Envía un mensaje a tu propia dirección para verlo aparecer en tu bandeja de entrada.",
  },
  tabs: {
    inbox: "Bandeja de entrada",
    sent: "Enviados",
  },
  encryptionKey: {
    title: "Prepara tu privacidad",
    description: "Necesitas activar el cifrado local para recibir mensajes privados. Tu clave se guarda únicamente en tu dispositivo, tú eres quien controla todo.",
    button: "Activar cifrado local",
    keyRegistrationSuccess: "¡Listo! Tu cifrado está activado",
    keyRegistrationError: "No se pudo activar el cifrado. Intenta de nuevo",
  },
  inbox: {
    title: "Mensajes privados",
    emptyState: "Sin mensajes por ahora",
    noMessagesFound: "Aún no tienes mensajes",
    refreshButton: "Actualizar",
    refreshingButton: "Actualizando...",
    decryptedMessage: "Mensaje",
    fromLabel: "De:",
  },
  sent: {
    title: "Enviados",
    toLabel: "Para:",
    status: {
      delivered: "Entregado",
      pending: "Enviando",
    },
  },
  floatingButton: {
    label: "Nuevo mensaje",
    ariaLabel: "Enviar nuevo mensaje privado",
  },
  messages: {
    network: {
      switching: "Conectando a la red...",
      switchedSuccess: "Conectado a Paseo Asset Hub TestNet",
      switchError: "No pudimos cambiar de red. Cámbialo manualmente en MetaMask a Paseo Asset Hub TestNet",
      checkError: "Error al verificar la red",
    },
    encryption: {
      unavailable: "No pudimos acceder a tu cifrado",
      notConnected: "Tu billetera no está conectada",
      success: "Cifrado activado desde tu billetera",
      error: "Error al activar el cifrado",
    },
    messages: {
      unavailable: "MetaMask no está disponible",
      notFound: "No encontramos mensajes en tu bandeja de entrada",
      fetchError: "Error al cargar los mensajes",
      decryptError: "No pudimos desencriptar el mensaje",
      successFetch: "Mensajes descargados y listos",
    },
  },
  security: {
    localEncryption: "Tu cifrado siempre local",
    localEncryptionDescription: "Cada mensaje se cifra en tu navegador. Solo tú tienes acceso a tus mensajes",
    endToEnd: "Privacidad garantizada",
    decentralized: "Sin intermediarios",
  },
} as const

// Simulated data
const receivedMessages = [
  {
    id: "1",
    from: "0x742d35Cc6634C0532925a3b8D4C0d8b3f8e4C2f1",
    fromAlias: "Alice",
    subject: "Smart Contract Audit Results",
    preview: "The audit has been completed successfully. All vulnerabilities have been addressed...",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    encrypted: true,
  },
  {
    id: "2",
    from: "0x8ba1f109551bD432803012645Hac136c22C177e9",
    fromAlias: "Bob",
    subject: "DeFi Protocol Update",
    preview: "New liquidity pools are now available. Check out the updated tokenomics...",
    timestamp: "2024-01-14T15:45:00Z",
    isRead: true,
    encrypted: true,
  },
  {
    id: "3",
    from: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    fromAlias: "Charlie",
    subject: "Governance Proposal #42",
    preview: "Please review and vote on the latest governance proposal regarding...",
    timestamp: "2024-01-13T09:15:00Z",
    isRead: true,
    encrypted: true,
  },
]

const sentMessages = [
  {
    id: "1",
    to: "0x742d35Cc6634C0532925a3b8D4C0d8b3f8e4C2f1",
    toAlias: "Alice",
    subject: "Re: Smart Contract Audit",
    preview: "Thank you for the comprehensive audit report. I'll implement the suggested changes...",
    timestamp: "2024-01-15T11:00:00Z",
    status: "delivered",
    encrypted: true,
  },
  {
    id: "2",
    to: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    toAlias: "Dave",
    subject: "Token Distribution Schedule",
    preview: "Here's the updated token distribution schedule for Q1 2024...",
    timestamp: "2024-01-14T14:20:00Z",
    status: "pending",
    encrypted: true,
  },
]

export default function Dashboard() {
  const [hasPublicKey, setHasPublicKey] = useState(false)
  const [activeTab, setActiveTab] = useState("inbox")
  const [modalOpen, setModalOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {    
    // Recupera los datos de la wallet conectada
    setAccount(localStorage.getItem("secretdot_account"));
    setChainId(localStorage.getItem("secretdot_chainId"));

    // Verifica y cambia a la red Paseo si es necesario
    const checkAndSwitchNetwork = async () => {
      try {
        const correctNetwork = await isCorrectNetwork();
        if (!correctNetwork) {
          toast.loading(DASHBOARD_COPY.messages.network.switching);
          const switched = await addPaseoNetwork();
          if (switched) {
            toast.dismiss();
            toast.success(DASHBOARD_COPY.messages.network.switchedSuccess);
          } else {
            toast.dismiss();
            toast.error(DASHBOARD_COPY.messages.network.switchError);
          }
        }
      } catch (error) {
        console.error("Error al verificar/cambiar red:", error);
        toast.error(DASHBOARD_COPY.messages.network.checkError);
      }
    };

    checkAndSwitchNetwork();
  }, []);

  useEffect(() => {
    //Obtener de la wallet la public key
    async function fetchEncryptionKey() {
      try {
        if (!window?.ethereum) {
          console.error("MetaMask no está disponible");
          toast.error(DASHBOARD_COPY.messages.encryption.unavailable);
          return;
        }
    
        if (!account) {
          console.error("No hay cuenta conectada");
          toast.error(DASHBOARD_COPY.messages.encryption.notConnected);
          return;
        }
    
        const publicKey = await window.ethereum.request({
          method: "eth_getEncryptionPublicKey",
          params: [account],
        });
        
        setPublicKey(publicKey);
        console.log("Public Key obtenida desde MetaMask:", publicKey);
        toast.success(DASHBOARD_COPY.messages.encryption.success);
        
      } catch (error) {
        console.error("Error al obtener la clave pública:", error);
        toast.error(DASHBOARD_COPY.messages.encryption.error);
        // Podrías mostrar un mensaje de error al usuario aquí
      }
    }

    //verifica si existe la clave publica en el blockchain
    const checkPublicKey = async () => {
      const contract = getContract();
    
      if (contract.keyOf) {
        try {
          const pubKey = await contract.keyOf(account);
          
          console.log("Clave pública obtenida: ", pubKey);
          console.log("Tipo de pubKey:", typeof pubKey);
          console.log("Longitud de pubKey:", pubKey?.length);
    
          // Verificación corregida - una clave pública existe si:
          // 1. No es null/undefined
          // 2. No es una cadena vacía
          // 3. No es "0x0000..." (dirección/hash vacío)
          if (pubKey && 
              pubKey !== "" && 
              pubKey !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
              pubKey.length > 0) {
            
            console.log("La clave pública ya existe en la blockchain");
            setHasPublicKey(true);
            
          } else {
            console.log("No existe clave pública, obteniendo una nueva...");
            // Solo se llama a fetchEncryptionKey si no existe pubKey
            await fetchEncryptionKey();
          }
          
        } catch (err) {
          console.log("Error checking public key:", err);
          // En caso de error, también intentamos obtener la clave
          await fetchEncryptionKey();
        }
      }
    };

    account ? checkPublicKey() : null;

  },[account]);

  // Cargar mensajes cuando se tiene la clave pública registrada
  useEffect(() => {
    if (hasPublicKey && account) {
      fetchAndDecryptMessages();
    }
  }, [hasPublicKey, account]);

  // Mostrar el modal de onboarding cuando no hay clave pública y hay cuenta conectada
  useEffect(() => {
    if (!hasPublicKey && account && publicKey && !onboardingOpen) {
      // Pequeño delay para que la animación se vea mejor
      const timer = setTimeout(() => {
        setOnboardingOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasPublicKey, account, publicKey]);

/*
  useEffect(() => {
    const contract = getContract();
    if (!contract) {
      setError("No se pudo conectar al contrato inteligente.");
      return;
    }

    const fetchData = async () => {
      try {
        // Aquí podrías llamar a funciones del contrato para obtener datos adicionales
        // Por ejemplo, verificar si la clave pública está registrada
        const result = await (contract.GetMyMessages?.(account));
        const pubId = await (contract.GetMyPubKey?.(account));
        console.log("Public Key ID:", pubId);
        setMessages(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Error al obtener datos del contrato:", err);
        setError("Error al obtener datos del contrato.");
      }
    }

    fetchData();

    console.log(messages);
    
  }, []);
*/

  const handleMakePublicKey = async () => {
    try {
      console.log("Registrando clave pública en la blockchain...");

      // Verificar que tenemos la clave pública
      if (!publicKey) {
        console.error("No hay clave pública disponible");
        toast.error(DASHBOARD_COPY.messages.encryption.unavailable);
        return;
      }

      if (!window.ethereum) {
        toast.error(DASHBOARD_COPY.messages.encryption.unavailable);
        return;
      }

      // Verificar que estamos en la red correcta
      const correctNetwork = await isCorrectNetwork();
      if (!correctNetwork) {
        toast.loading(DASHBOARD_COPY.messages.network.switching);
        const switched = await addPaseoNetwork();
        toast.dismiss();
        if (!switched) {
          toast.error(DASHBOARD_COPY.messages.network.switchError);
          return;
        }
        toast.success(DASHBOARD_COPY.messages.network.switchedSuccess);
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const signedContract = await getSignedContract(signer);
      
      console.log("Signed Contract:", signedContract);
      
      if (signedContract.setKey) {
        console.log("Registrando clave pública en el contrato...");
        
        // Ejecutar la transacción - SecretDot.sol usa setKey()
        const tx = await signedContract.setKey(publicKey);
        console.log("Transacción enviada:", tx.hash);
        toast("Transacción enviada. Esperando confirmación...", { icon: "⏳" });
        
        // Esperar confirmación
        const receipt = await tx.wait();
        console.log("Transacción confirmada:", receipt);
        toast.success(DASHBOARD_COPY.encryptionKey.keyRegistrationSuccess);
        
        // Solo cambiar el estado después de que la transacción sea exitosa
        setHasPublicKey(true);
        
      } else {
        console.error("setKey no está definido en el contrato.");
        toast.error(DASHBOARD_COPY.encryptionKey.keyRegistrationError);
      }

    } catch (error) {
      console.error("Error al registrar la clave pública:", error);
      toast.error(DASHBOARD_COPY.encryptionKey.keyRegistrationError);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  const fetchAndDecryptMessages = async () => {
    try {
        setLoadingMessages(true);
        
        if (!window?.ethereum) {
            console.error("MetaMask no está disponible");
            toast.error(DASHBOARD_COPY.messages.messages.unavailable);
            return;
        }

        if (!account) {
            console.error("No hay cuenta conectada");
            toast.error(DASHBOARD_COPY.messages.encryption.notConnected);
            return;
        }

        console.log("📥 Consultando mensajes para la dirección:", account);
        
        // Obtener el contrato con el proveedor conectado a la cuenta
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const signedContract = await getSignedContract(signer);
        
        console.log("� Verificando función inbox en contrato:", typeof signedContract.inbox);
        
        if (!signedContract.inbox) {
            throw new Error("inbox no está definido en el contrato.");
        }

        // Obtener mensajes del receptor desde la blockchain - SecretDot.sol usa inbox()
        console.log("🔍 Llamando a inbox()...");
        const messages = await signedContract.inbox();
        console.log("📦 Mensajes recibidos desde blockchain:", messages);
        console.log("📊 Cantidad de mensajes:", messages.length);
        console.log("📊 Tipo de messages:", typeof messages);
        console.log("📊 Es array?:", Array.isArray(messages));

        if (messages.length === 0) {
            console.log("⚠️ No hay mensajes para mostrar");
            console.log("💡 Tip: Asegúrate de enviar el mensaje a la dirección:", account);
            setDecryptedMessages([]);
            toast(DASHBOARD_COPY.inbox.noMessagesFound, { icon: "ℹ️" });
            return;
        }

        // Descifrar cada mensaje usando MetaMask
        const decryptedMessagesPromises = messages.map(async (message: any, index: number) => {
            try {
                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`🔓 INICIANDO DESENCRIPTACIÓN - Mensaje #${index + 1}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

                const sender = message.from; // SecretDot.sol usa 'from' en lugar de 'sender'
                const ipfsHash = message.ipfs;
                const timestamp = message.t;

                console.log("📨 Metadata del mensaje:");
                console.log("  De (sender):", sender);
                console.log("  Hash IPFS-like:", ipfsHash);
                console.log("  Timestamp:", timestamp, "→", new Date(Number(timestamp) * 1000).toISOString());

                // Buscar el mensaje cifrado en localStorage
                const storageKey = `secretdot_msg_${ipfsHash}`;
                console.log("\n🔍 Buscando mensaje encriptado en localStorage...");
                console.log("  Clave de búsqueda:", storageKey);

                const encryptedMessage = localStorage.getItem(storageKey);

                if (!encryptedMessage) {
                    console.warn("\n❌ MENSAJE NO ENCONTRADO EN LOCALSTORAGE");
                    console.log("  Hash buscado:", ipfsHash);
                    console.log("  Clave buscada:", storageKey);

                    const allSecretDotKeys = Array.from({length: localStorage.length}, (_, i) => localStorage.key(i))
                        .filter(k => k && k.startsWith('secretdot_msg_'));

                    console.log(`  Total de mensajes SecretDot en localStorage: ${allSecretDotKeys.length}`);
                    if (allSecretDotKeys.length > 0) {
                        console.log("  Claves disponibles:", allSecretDotKeys);
                    }
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

                    return {
                        sender,
                        decryptedMessage: DASHBOARD_COPY.messages.messages.notFound,
                        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
                    };
                }

                console.log("✅ Mensaje encriptado encontrado en localStorage");
                console.log("  Longitud del mensaje:", encryptedMessage.length, "caracteres");

                // El mensaje encriptado es un objeto JSON, lo parseamos
                console.log("\n⚙️ Parseando mensaje encriptado...");
                const encryptedData = JSON.parse(encryptedMessage);

                console.log("📦 Estructura del mensaje encriptado:");
                console.log("  - version:", encryptedData.version);
                console.log("  - nonce:", encryptedData.nonce?.substring(0, 20) + "...");
                console.log("  - ephemPublicKey:", encryptedData.ephemPublicKey?.substring(0, 20) + "...");
                console.log("  - ciphertext (primeros 50 chars):", encryptedData.ciphertext?.substring(0, 50) + "...");

                // Desencriptar usando MetaMask
                if (!window.ethereum) {
                    throw new Error("MetaMask no disponible");
                }

                console.log("\n🔐 Preparando desencriptación con MetaMask...");
                console.log("  Cuenta que desencripta:", account);
                console.log("  Algoritmo:", encryptedData.version);

                // Convertir el objeto JSON a Buffer y luego a hex con prefijo 0x
                // Según documentación de MetaMask: eth_decrypt espera formato hexadecimal
                const buf = Buffer.from(JSON.stringify(encryptedData), 'utf8');
                const encryptedHex = '0x' + buf.toString('hex');

                console.log("  Formato convertido a hex (primeros 100 chars):", encryptedHex.substring(0, 100) + "...");
                console.log("  Longitud total del hex:", encryptedHex.length, "caracteres");

                console.log("\n⏳ Llamando a MetaMask eth_decrypt...");
                const decryptedMessage = await window.ethereum.request({
                    method: "eth_decrypt",
                    params: [encryptedHex, account],
                });

                console.log("\n✅ DESENCRIPTACIÓN EXITOSA!");
                console.log("  Mensaje original recuperado:", decryptedMessage);
                console.log("  Remitente verificado:", sender);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                return {
                    sender,
                    decryptedMessage: decryptedMessage,
                    timestamp: message.t ? new Date(Number(message.t) * 1000).toISOString() : new Date().toISOString(),
                };
            } catch (error: any) {
                console.error("\n❌ ERROR EN LA DESENCRIPTACIÓN");
                console.error("  Mensaje:", error?.message);
                console.error("  Código:", error?.code);
                console.error("  Stack:", error?.stack);

                if (error?.code === 4001) {
                    console.error("  → Usuario rechazó la desencriptación en MetaMask");
                } else if (error?.message?.includes("decrypt")) {
                    console.error("  → Error de desencriptación - posible clave incorrecta");
                } else if (error?.message?.includes("parse")) {
                    console.error("  → Error de parseo - formato de mensaje incorrecto");
                }
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

                return {
                    sender: message.from,
                    decryptedMessage: DASHBOARD_COPY.messages.messages.decryptError,
                    timestamp: message.t ? new Date(Number(message.t) * 1000).toISOString() : new Date().toISOString()
                };
            }
        });

        console.log("\n⏳ Procesando todos los mensajes en paralelo...");
        const decryptedMessages = await Promise.all(decryptedMessagesPromises);

        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ PROCESO DE DESENCRIPTACIÓN COMPLETADO");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📊 Resumen:");
        console.log(`  Total de mensajes procesados: ${decryptedMessages.length}`);
        console.log(`  Mensajes descifrados con éxito: ${decryptedMessages.filter(m => !m.decryptedMessage.includes('Error') && !m.decryptedMessage.includes('encontrado')).length}`);
        console.log(`  Mensajes con error: ${decryptedMessages.filter(m => m.decryptedMessage.includes('Error') || m.decryptedMessage.includes('encontrado')).length}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        setDecryptedMessages(decryptedMessages);
        toast.success("Mensajes obtenidos y descifrados exitosamente");
    } catch (error: any) {
        console.error("❌ Error al obtener mensajes:", error);
        console.error("❌ Error name:", error?.name);
        console.error("❌ Error message:", error?.message);
        console.error("❌ Error stack:", error?.stack);
        console.error("❌ Error code:", error?.code);
        
        // Si es un error específico de ethers
        if (error?.code) {
            toast.error(`Error (${error.code}): ${error.message}`);
        } else {
            toast.error("Error al obtener mensajes desde la blockchain.");
        }
        
        // Reintentar si es un error de red
        if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
            console.log("⚠️ Error de red detectado. Considera reintentar.");
        }
    } finally {
        setLoadingMessages(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace unos minutos"
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toaster position="top-right" />
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-emerald-400 animate-lock-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {DASHBOARD_COPY.header.title}
            </h1>
          </div>
          <p className="text-slate-400 font-mono text-sm">
            {DASHBOARD_COPY.header.subtitle.split(DASHBOARD_COPY.header.subtitleHighlight)[0]}
            <span
              className="font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {DASHBOARD_COPY.header.subtitleHighlight}
            </span>
            {DASHBOARD_COPY.header.subtitle.split(DASHBOARD_COPY.header.subtitleHighlight)[1]}
          </p>
          {/* Datos de la wallet */}
          {account && (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-xs text-emerald-400 font-mono">
                  <b>{DASHBOARD_COPY.common.yourIdentity}:</b> {account}
                </span>
                {chainId && (
                  <span className="text-xs text-cyan-400 font-mono md:ml-4">
                    <b>{DASHBOARD_COPY.common.chainId}:</b> {chainId}
                  </span>
                )}
              </div>
              <div className="text-xs text-amber-400 font-mono border-t border-slate-800 pt-2">
                <b>{DASHBOARD_COPY.tip.label}</b> {DASHBOARD_COPY.tip.description}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800">
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400 flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              {DASHBOARD_COPY.tabs.inbox}
              {!hasPublicKey && (
                <Badge variant="destructive" className="ml-2 h-5 text-xs">
                  !
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="text-slate-400 data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-400 flex items-center gap-2"
            >
              <Send className="h-4 w-4 text-slate-400" />
              {DASHBOARD_COPY.tabs.sent}
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="mt-6">
            {!hasPublicKey ? (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <Key className="h-4 w-4 text-amber-500 animate-lock-pulse" />
                <AlertTitle className="text-amber-500">{DASHBOARD_COPY.encryptionKey.title}</AlertTitle>
                <AlertDescription className="text-slate-300 mb-4">
                  {DASHBOARD_COPY.encryptionKey.description}
                </AlertDescription>
                <div className="flex gap-3">
                  <Button onClick={handleMakePublicKey} className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white hover-lift">
                    <Key className="h-4 w-4 mr-2" />
                    {DASHBOARD_COPY.encryptionKey.button}
                  </Button>
                  <Button 
                    onClick={() => setOnboardingOpen(true)} 
                    variant="outline"
                    className="w-fit border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 hover-lift"
                  >
                    <Shield className="h-4 w-4 mr-2 animate-lock-pulse" />
                    Ver guía
                  </Button>
                </div>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">
                    {DASHBOARD_COPY.inbox.title} ({decryptedMessages.length})
                  </h3>
                  <Button
                    onClick={fetchAndDecryptMessages}
                    disabled={loadingMessages}
                    size="sm"
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800 hover-lift"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingMessages ? 'animate-spin' : ''}`} />
                    {loadingMessages ? DASHBOARD_COPY.inbox.refreshingButton : DASHBOARD_COPY.inbox.refreshButton}
                  </Button>
                </div>
                {loadingMessages ? (
                  <MessageSkeletonList count={3} />
                ) : decryptedMessages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 animate-fade-in-up">
                    <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{DASHBOARD_COPY.inbox.emptyState}</p>
                  </div>
                ) : (
                  decryptedMessages.map((message, index) => (
                    <Card
                      key={index}
                      className={`bg-slate-900/50 border-slate-800 hover:border-slate-700 hover-glow transition-all animate-fade-in-up stagger-item-${Math.min(index + 1, 10)}`}
                    >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10 bg-slate-800">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-900 font-bold">
                              <Shield className="h-3 w-3 text-black" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-200">{formatAddress(message.sender)}</span>
                              <Shield className="h-3 w-3 text-emerald-400 animate-lock-pulse" />
                            </div>
                            <h3 className="font-medium text-white mb-1">{DASHBOARD_COPY.inbox.decryptedMessage}</h3>
                            <p className="text-sm text-slate-400">{message.decryptedMessage}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-slate-500 font-mono">{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {sentMessages.map((message, index) => (
                <Card
                  key={message.id}
                  className={`bg-slate-900/50 border-slate-800 hover:border-slate-700 hover-glow transition-all animate-fade-in-up stagger-item-${Math.min(index + 1, 10)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-10 w-10 bg-slate-800">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-400 text-slate-900 font-bold">
                            {message.to[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-slate-400">{DASHBOARD_COPY.sent.toLabel}</span>
                            <span className="font-semibold text-slate-200">{formatAddress(message.to)}</span>
                            {/* <span className="font-semibold text-slate-200">{message.toAlias}</span> */}
                            {/* <span className="text-xs font-mono text-slate-500">{formatAddress(message.to)}</span> */}
                            {message.encrypted && <Shield className="h-3 w-3 text-emerald-400 animate-lock-pulse" />}
                          </div>
                          <h3 className="font-medium text-slate-300 mb-1">{message.subject}</h3>
                          <p className="text-sm text-slate-400 line-clamp-2">{message.preview}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-slate-500 font-mono">{formatTime(message.timestamp)}</span>
                        <Badge
                          variant={message.status === "delivered" ? "default" : "secondary"}
                          className={`text-xs ${
                            message.status === "delivered"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {message.status === "delivered" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {DASHBOARD_COPY.sent.status.delivered}
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              {DASHBOARD_COPY.sent.status.pending}
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/40"
          onClick={() => setModalOpen(true)}
          aria-label={DASHBOARD_COPY.floatingButton.ariaLabel}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">{DASHBOARD_COPY.floatingButton.ariaLabel}</span>
        </Button>

        {/* Onboarding Modal */}
        <OnboardingModal 
          open={onboardingOpen} 
          onComplete={() => setOnboardingOpen(false)}
          onPublishKey={handleMakePublicKey}
        />

        {/* Secure Message Modal */}
        <SecureMessageModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </div>
  )
}
