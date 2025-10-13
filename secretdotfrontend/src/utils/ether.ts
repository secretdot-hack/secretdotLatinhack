import { JsonRpcProvider, BrowserProvider, Signer } from "ethers";

// Configuración de la red - Paseo Asset Hub
export const ASSET_HUB_CONFIG = {
  name: 'Polkadot Hub TestNet',
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io', 
  chainId: 420420422, 
  chainIdHex: '0x1911f0a6',
  blockExplorer: 'https://blockscout-passet-hub.parity-testnet.parity.io',
  symbol: 'PAS',
  decimals: 18,
};

/**
 * Agrega la red Paseo Asset Hub a MetaMask si no existe
 */
export const addPaseoNetwork = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    console.error("MetaMask no está disponible");
    return false;
  }

  try {
    // Intentar cambiar a la red Paseo
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ASSET_HUB_CONFIG.chainIdHex }],
    });
    console.log("✅ Cambiado a red Paseo exitosamente");
    return true;
  } catch (switchError: any) {
    // Si la red no existe (código 4902), agregarla
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: ASSET_HUB_CONFIG.chainIdHex,
            chainName: ASSET_HUB_CONFIG.name,
            nativeCurrency: {
              name: 'Paseo',
              symbol: ASSET_HUB_CONFIG.symbol,
              decimals: ASSET_HUB_CONFIG.decimals,
            },
            rpcUrls: [ASSET_HUB_CONFIG.rpc],
            blockExplorerUrls: [ASSET_HUB_CONFIG.blockExplorer],
          }],
        });
        console.log("✅ Red Paseo agregada exitosamente");
        return true;
      } catch (addError) {
        console.error("Error al agregar red Paseo:", addError);
        return false;
      }
    }
    console.error("Error al cambiar de red:", switchError);
    return false;
  }
};

/**
 * Verifica si MetaMask está en la red correcta (Paseo)
 */
export const isCorrectNetwork = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return false;
  }

  try {
    const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
    return chainId === ASSET_HUB_CONFIG.chainIdHex;
  } catch (error) {
    console.error("Error verificando red:", error);
    return false;
  }
};

// Función para obtener un proveedor JSON-RPC
export const getProvider = (): JsonRpcProvider => {
  return new JsonRpcProvider(ASSET_HUB_CONFIG.rpc, {
    chainId: ASSET_HUB_CONFIG.chainId,
    name: ASSET_HUB_CONFIG.name,
  });
};

// Función para obtener un signer desde el navegador
export const getSigner = async (provider?: JsonRpcProvider): Promise<Signer> => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    const browserProvider = new BrowserProvider((window as any).ethereum);
    return browserProvider.getSigner();
  }
  throw new Error("No Ethereum browser provider detected");
};
