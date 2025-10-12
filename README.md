
## 📦 Instalación para Desarrollo

```bash

git clone https://github.com/secretdot-hack/secretdot.git

cd secretdotfrontend

npm i

```

# 🔐 SecretDot

**Plataforma para compartir datos sensibles de forma segura y simple usando blockchain de Polkadot.**

---

## 📌 Idea Principal

SecretDot permite a cualquier usuario compartir información confidencial utilizando criptografía en el navegador, almacenamiento descentralizado (IPFS) y contratos inteligentes en la red Polkadot. Toda la información es encriptada antes de ser enviada y sólo los destinatarios autorizados pueden acceder a ella.

---

## 🚀 ¿Cómo Funciona?

1. El usuario accede a la plataforma y conecta su wallet.
2. Se le muestra su panel con:
   - **📥 Inbox**: mensajes recibidos.
   - **📤 Enviados**: mensajes enviados.
3. Si aún no hizo pública su `public key`, se le solicita hacerlo para poder recibir mensajes.
4. Para enviar datos sensibles:
   - Hace clic en **"Nuevo mensaje"**.
   - Sube la información que desea compartir.
   - Ingresa una o más direcciones públicas (wallets).
   - La información se **encripta en el frontend** con las claves públicas.
   - Se guarda un **hash de IPFS** en un **smart contract** en la blockchain.
   - Los destinatarios reciben un link, donde deben conectarse con su wallet y podrán ver la información **una sola vez**.

---

## 🧩 Funcionalidades Clave

- 🔒 **Encriptación local**: los datos se encriptan antes de salir del navegador.
- 🧬 **Privacidad garantizada**: sólo el destinatario correcto puede desencriptar el contenido.
- 👁️‍🗨️ **Acceso único**: la información puede verse una sola vez.
- 🌐 **Polkadot Ready**: interoperabilidad con múltiples blockchains.
- 🧾 **Auditoría transparente**: historial de accesos y comparticiones a través de la red.

---

## 🛠️ Tecnologías Usadas

- **Polkadot** – para contratos inteligentes e interoperabilidad entre blockchains.
- **Web3 / Polkadot.js** – para conectar con wallets.
- **Criptografía en cliente (JS)** – para encriptar datos antes de enviarlos.

---

## 🧪 Ejemplo de Uso

1. Conectás tu wallet.
2. Hacés pública tu clave para recibir mensajes.
3. Subís un archivo sensible.
4. Elegís los destinatarios (por dirección pública).
5. Se genera un contrato inteligente con el hash del archivo en IPFS.
6. El receptor accede al archivo una vez a través de un link seguro.

---
