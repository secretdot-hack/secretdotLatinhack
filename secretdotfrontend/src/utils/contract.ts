import { Contract, JsonRpcProvider, Signer } from "ethers";
import { getProvider } from "./ether";
import StorageABI from "../abis/SecretDot.json";

// Dirección del contrato desplegado
export const CONTRACT_ADDRESS = "0x068592Ad3355F4C6Ec5106B9633AeED34F09d42c";

// ABI del contrato (tipado como cualquier[] para evitar errores)
export const CONTRACT_ABI = StorageABI.abi as any[];

/**
 * Obtiene una instancia del contrato solo-lectura (sin firma)
 */
export const getContract = (): Contract => {
  const provider: JsonRpcProvider = getProvider();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

/**
 * Obtiene una instancia del contrato firmada (para escritura)
 */
export const getSignedContract = async (signer: Signer): Promise<Contract> => {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
