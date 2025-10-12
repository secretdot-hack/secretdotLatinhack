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
import { getContract } from "~/utils/contract"
import { toast } from "react-hot-toast"
import { ethers, keccak256, toUtf8Bytes } from "ethers";
import { getSignedContract } from "~/utils/contract";

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

  const handleSend = async () => {
    try {
        const contract = getContract();
        const pubKey = await checkAddress(addresses.trim());
        if (!pubKey) {
            toast.error("No se pudo obtener la clave pública del receptor.");
            return;
        }

        const encryptedMessage = message + pubKey; // Encriptar el mensaje con la clave pública del receptor

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signedContract = await getSignedContract(signer);

        if (typeof signedContract.SendMessage === "function") {
            const tx = await signedContract.SendMessage(addresses.trim(), encryptedMessage); // Enviar mensaje al contrato
            console.log("Transacción enviada:", tx.hash);
            toast("Transacción enviada. Esperando confirmación...", { icon: "⏳" });

            const receipt = await tx.wait();
            console.log("Transacción confirmada:", receipt);
            toast.success("Mensaje enviado exitosamente");

            // Limpiar el formulario y cerrar el modal
            setAddresses("");
            setMessage("");
            onOpenChange(false);
        } else {
            toast.error("La función SendMessage no está disponible en el contrato.");
            return;
        }
    } catch (error) {
        toast.error("Hubo un error al enviar el mensaje");
        console.error(error);
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
    if (contract.GetUserPubKey) {
      try {
        const pubKey = await contract.GetUserPubKey(address);
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
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent">
        <Card className="w-full border-slate-200 shadow-xl">
          <CardHeader className="pb-4 relative">
              {/* <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-6 w-6" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button> */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 -mt-2 mb-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
                className="min-h-[40px] -mb-4 resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
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
                    className={`min-h-[80px] resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                    addressValid === true
                      ? "border-green-400"
                      : addressValid === false
                      ? "border-red-400"
                      : ""
                  }`}
                />
                {/* Icono visual de validación */}
                {addresses.trim() && (
                  <span className="absolute right-2 top-2">
                    {addressCheckLoading ? (
                      <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : addressValid === true ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : addressValid === false ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
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
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                  disabled={!message.trim() || !addresses.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
              >
                    <Shield className="w-4 h-4 mr-2" />
                    Enviar Seguro
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
    // </div>
  )
}
