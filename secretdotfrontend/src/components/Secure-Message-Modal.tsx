"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Shield, Lock, X, CheckCircle2, AlertCircle } from "lucide-react"
import { InlineLoader, FullScreenLoader } from "./ui/loader"
import { getContract } from "~/utils/contract"
import { toast } from "react-hot-toast"
import { ethers, keccak256, toUtf8Bytes } from "ethers";
import { getSignedContract } from "~/utils/contract";
import { encrypt } from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { addPaseoNetwork, isCorrectNetwork } from "~/utils/ether";

export default function SecureMessageModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [addresses, setAddresses] = useState("")
  const [message, setMessage] = useState("")
  const [addressValid, setAddressValid] = useState<null | boolean>(null)
  const [addressCheckLoading, setAddressCheckLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    try {
        setSending(true);
        
        if (!window?.ethereum) {
            toast.error("MetaMask no está disponible");
            return;
        }

        // Verificar que estamos en la red correcta antes de enviar
        const correctNetwork = await isCorrectNetwork();
        if (!correctNetwork) {
            const switched = await addPaseoNetwork();
            if (!switched) {
                toast.error("Por favor, cambia manualmente a la red Paseo Asset Hub TestNet en MetaMask");
                return;
            }
            toast.success("Conectado a la red Paseo");
        }

        const contract = getContract();
        const recipientPubKey = await checkAddress(addresses.trim());
        if (!recipientPubKey) {
            toast.error("No se pudo obtener la clave pública del receptor.");
            return;
        }

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔐 INICIANDO PROCESO DE ENCRIPTACIÓN");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📨 Mensaje original (texto plano):", message);
        console.log("🔑 Clave pública del destinatario:", recipientPubKey);
        console.log("📍 Dirección del destinatario:", addresses.trim());

        // Encriptar el mensaje usando la librería de MetaMask
        console.log("\n⚙️ Encriptando con algoritmo x25519-xsalsa20-poly1305...");
        const encryptedData = encrypt({
            publicKey: recipientPubKey,
            data: message,
            version: 'x25519-xsalsa20-poly1305'
        });

        console.log("✅ Encriptación completada!");
        console.log("📦 Estructura del mensaje encriptado:");
        console.log("  - version:", encryptedData.version);
        console.log("  - nonce:", encryptedData.nonce);
        console.log("  - ephemPublicKey:", encryptedData.ephemPublicKey);
        console.log("  - ciphertext (primeros 50 chars):", encryptedData.ciphertext.substring(0, 50) + "...");

        // Convertir a string JSON
        const encryptedMessage = JSON.stringify(encryptedData);
        console.log("\n📝 Mensaje encriptado convertido a JSON:");
        console.log("  Longitud:", encryptedMessage.length, "caracteres");
        console.log("  Primeros 100 chars:", encryptedMessage.substring(0, 100) + "...");

        // Crear un hash IPFS-like que será usado tanto en localStorage como en el contrato
        const timestamp = Date.now().toString();
        console.log("\n🔨 Generando hash IPFS-like...");
        console.log("  Timestamp:", timestamp);

        const hashInput = encryptedMessage + timestamp + addresses.trim();
        const fullHash = ethers.keccak256(ethers.toUtf8Bytes(hashInput));
        console.log("  Hash completo (keccak256):", fullHash);

        // Formato IPFS-like (Qm + 46 caracteres del hash)
        const ipfsLikeHash = `Qm${fullHash.slice(2, 48)}`;
        console.log("  ✅ Hash IPFS-like generado:", ipfsLikeHash);

        // Guardar el mensaje cifrado en localStorage usando el hash IPFS-like
        const storageKey = `secretdot_msg_${ipfsLikeHash}`;
        console.log("\n💾 Guardando en localStorage...");
        console.log("  Clave de almacenamiento:", storageKey);

        localStorage.setItem(storageKey, encryptedMessage);

        // Verificar que se guardó correctamente
        const verificacion = localStorage.getItem(storageKey);
        if (verificacion === encryptedMessage) {
            console.log("  ✅ Verificado: Mensaje guardado correctamente en localStorage");
        } else {
            console.error("  ❌ ERROR: El mensaje no se guardó correctamente!");
        }

        console.log("\n🔗 Preparando transacción blockchain...");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const signedContract = await getSignedContract(signer);

        if (typeof signedContract.send === "function") {
            console.log("\n📤 ENVIANDO TRANSACCIÓN A LA BLOCKCHAIN");
            console.log("  Destinatario:", addresses.trim());
            console.log("  Hash IPFS-like:", ipfsLikeHash);
            console.log("  Función del contrato: send(address, string)");

            // SecretDot.sol usa send(address to, string calldata h)
            const tx = await signedContract.send(addresses.trim(), ipfsLikeHash);
<<<<<<< HEAD
            console.log("\n⏳ Transacción enviada a la red");
            console.log("  Hash de la transacción:", tx.hash);
            toast("Transacción enviada. Esperando confirmación...", { icon: "⏳" });
=======
            console.log("✅ Transacción enviada:", tx.hash);
>>>>>>> baba878322f882379f3b83ade38d2efc65e465ca

            const receipt = await tx.wait();
            console.log("\n✅ TRANSACCIÓN CONFIRMADA EN LA BLOCKCHAIN");
            console.log("  Block number:", receipt.blockNumber);
            console.log("  Block hash:", receipt.blockHash);
            console.log("  Gas usado:", receipt.gasUsed.toString());
            console.log("  Eventos emitidos:", receipt.logs.length);
            
            // Parsear el evento para ver el destinatario
            if (receipt.logs && receipt.logs.length > 0) {
                try {
                    const log = receipt.logs[0];
                    console.log("📋 Log completo:", log);
                    console.log("📋 Topics:", log.topics);
                    console.log("📋 Data:", log.data);
                    
                    // Parsear manualmente los topics
                    // topics[0] = event signature
                    // topics[1] = sender (indexed)
                    // topics[2] = recipient (indexed)
                    if (log.topics && log.topics.length >= 3) {
                        const sender = ethers.getAddress('0x' + log.topics[1].slice(26));
                        const recipient = ethers.getAddress('0x' + log.topics[2].slice(26));
                        
                        console.log("📨 Evento MessageSent parseado:", {
                            sender: sender,
                            recipient: recipient,
                            destinatarioIntroducido: addresses.trim(),
                            match: recipient.toLowerCase() === addresses.trim().toLowerCase()
                        });
                        
                        if (recipient.toLowerCase() !== addresses.trim().toLowerCase()) {
                            console.warn("⚠️ ADVERTENCIA: El destinatario en el evento no coincide con la dirección ingresada");
                            console.warn(`   Esperado: ${addresses.trim()}`);
                            console.warn(`   Recibido: ${recipient}`);
                        } else {
                            console.log("✅ El destinatario coincide correctamente");
                        }
                    }
                } catch (e) {
                    console.log("No se pudo parsear el evento:", e);
                }
            }

            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("✅ PROCESO DE ENCRIPTACIÓN Y ENVÍO COMPLETADO");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📊 Resumen:");
            console.log("  ✓ Mensaje encriptado con éxito");
            console.log("  ✓ Almacenado en localStorage con hash:", ipfsLikeHash);
            console.log("  ✓ Transacción confirmada en blockchain");
            console.log("  ✓ Destinatario:", addresses.trim());
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            toast.success("Mensaje enviado exitosamente");

            // Limpiar el formulario y cerrar el modal
            setAddresses("");
            setMessage("");
            onOpenChange(false);
        } else {
            toast.error("La función send no está disponible en el contrato.");
            return;
        }
    } catch (error) {
        toast.error("Hubo un error al enviar el mensaje");
        console.error("Error detallado:", error);
    } finally {
        setSending(false);
    }
  }

  const handleCancel = () => {
    setAddresses("")
    setMessage("")
    onOpenChange(false)
  }

  const checkAddress = async (address :  string) : Promise<string | undefined> => {
    // validar la direccion ingresada
    const contract = getContract()
    if (contract.keyOf) {
      try {
        // SecretDot.sol usa keyOf(address) para obtener la clave pública
        const pubKey = await contract.keyOf(address);
        console.log("Se encontro el receptor: ", pubKey);
        return pubKey;
      } catch (err) {
        console.log("Error checking public key:", err);
        return "";
      }
    }
  }

  useEffect(() => {
    // Solo chequear si hay address y no está vacía
    if (!addresses.trim()) {
      setAddressValid(null)
      return
    }
    setAddressCheckLoading(true)
    const check = async () => {
      const pubKey = await checkAddress(addresses.trim())
      if (pubKey && pubKey.length > 0) {
        setAddressValid(true)
      } else {
        setAddressValid(false)
      }
      setAddressCheckLoading(false)
    }
    check()
  }, [addresses])

  return (
    // <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <Dialog open={open} onOpenChange={onOpenChange}>
        {/* <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Lock className="w-4 h-4 mr-2" />
            Enviar Mensaje Seguro
          </Button>
        </DialogTrigger> */}
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent animate-fade-in-up">
        <Card className="w-full border-slate-200 shadow-xl">
          <CardHeader className="pb-4 relative">
              {/* <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-6 w-6" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button> */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 animate-lock-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Mensaje Seguro</CardTitle>
                <CardDescription className="text-slate-600">
                  Comparte información sensible de forma segura
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Explicación de seguridad */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 -mt-2 mb-4 animate-fade-in-up stagger-item-1">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-lock-pulse" />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Tu mensaje será encriptado localmente en tu dispositivo antes de ser compartido
                  </p>
                </div>
              </div>
              {/* Campo de mensaje */}
            <div className="space-y-2">
              <Label htmlFor="secure-message" className="text-sm font-medium text-slate-700">
                Información Sensible
              </Label>
              <Textarea
                id="secure-message"
                placeholder="Escribe aquí tu mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[40px] -mb-4 resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
              />
            </div>

            {/* Campo de direcciones */}
            <div className="space-y-2">
              <Label htmlFor="addresses" className="text-sm font-medium text-slate-700">
                Address de Destinatario
              </Label>
              <div className="relative">
                <Textarea
                  id="addresses"
                  placeholder="0x1a23...b45c"
                  value={addresses}
                  onChange={(e) => setAddresses(e.target.value)}
                    className={`min-h-[80px] resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10 transition-all duration-200 ${
                    addressValid === true
                      ? "border-green-400 bg-green-50/30"
                      : addressValid === false
                      ? "border-red-400 bg-red-50/30"
                      : ""
                  }`}
                />
                {/* Icono visual de validación */}
                {addresses.trim() && (
                  <span className="absolute right-2 top-2 animate-fade-in-up">
                    {addressCheckLoading ? (
                      <InlineLoader size={20} />
                    ) : addressValid === true ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 animate-fade-in-up" />
                    ) : addressValid === false ? (
                      <AlertCircle className="w-5 h-5 text-red-500 animate-fade-in-up" />
                    ) : null}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Esta dirección será utilizada para cifrar el mensaje y solo el destinatario podrá descifrarlo. 
              </p> 
              <p className="text-xs text-slate-500">
                {(addressValid === false && !addressCheckLoading) && (
                <span className="text-red-500">Dirección inválida o sin clave pública registrada.</span>
                )}
                {(addressValid === true && !addressCheckLoading) && (
                <span className="text-green-600">Dirección válida.</span>
                )}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover-lift"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || !addresses.trim() || sending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 hover-lift"
              >
                {sending ? (
                  <InlineLoader size={16} className="mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                {sending ? "Enviando..." : "Enviar Seguro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>

      {/* Loader de envío */}
      {sending && (
        <FullScreenLoader message="Cifrando y enviando mensaje a la blockchain..." />
      )}
    </Dialog>
    // </div>
  )
}
