import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "SecretDot - Secure Messenger",
  keywords: [
    "secure messenger",
    "end-to-end encryption",
    "private messaging",
    "decentralized chat",
    "web3 messaging",
    "blockchain chat",
    "crypto messaging",
    "peer-to-peer messaging",
    "anonymous chat",
    "secure communication"],
  description: "Mensajería privada y descentralizada con cifrado end-to-end en Polkadot",
  icons: [{ rel: "icon", type: "image/png", url: "/SecretDotLogo.png" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "500", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
