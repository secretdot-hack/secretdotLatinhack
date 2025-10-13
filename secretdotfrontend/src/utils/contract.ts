import { Contract, JsonRpcProvider, Signer } from "ethers";
import { getProvider } from "./ether";
import StorageABI from "../abis/SecretDot.json";

// Dirección del contrato desplegado en Paseo Asset Hub
export const CONTRACT_ADDRESS = "0x775969a56f3EE47cd3F56Da602D6F5Bf2625296A";


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
