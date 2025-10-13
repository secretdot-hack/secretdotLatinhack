const { ethers } = require("ethers");

// Configuración
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const CONTRACT_ADDRESS = "0x775969a56f3EE47cd3F56Da602D6F5Bf2625296A";

// ABI simplificado - solo la función inbox
const ABI = [
  {
    "inputs": [],
    "name": "inbox",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "ipfs",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "t",
            "type": "uint256"
          }
        ],
        "internalType": "struct SecretDot.Msg[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testInbox(walletAddress) {
  try {
    console.log("🔗 Conectando a Paseo Asset Hub TestNet...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    console.log("📋 Conectando al contrato:", CONTRACT_ADDRESS);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    console.log("🔍 Llamando a inbox() para la dirección:", walletAddress);
    
    // Necesitamos un signer para llamar a inbox() ya que usa msg.sender
    // Por ahora solo probamos si el contrato responde
    try {
      // Intentar llamada estática especificando el from
      const messages = await contract.inbox.staticCall({
        from: walletAddress
      });
      
      console.log("✅ inbox() respondió correctamente");
      console.log("📦 Mensajes:", messages);
      console.log("📊 Cantidad:", messages.length);
      
      if (messages.length > 0) {
        messages.forEach((msg, i) => {
          console.log(`\n📨 Mensaje ${i + 1}:`);
          console.log("  - IPFS Hash:", msg.ipfs);
          console.log("  - From:", msg.from);
          console.log("  - Timestamp:", new Date(Number(msg.t) * 1000).toISOString());
        });
      } else {
        console.log("⚠️ No hay mensajes para esta dirección");
      }
      
    } catch (callError) {
      console.error("❌ Error al llamar inbox():", callError.message);
      console.error("Código:", callError.code);
      console.error("Detalles:", callError);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Detalles completos:", error);
  }
}

// Tomar dirección de la línea de comandos o usar una por defecto
const walletAddress = process.argv[2] || "0x0000000000000000000000000000000000000000";

console.log("========================================");
console.log("     TEST DE FUNCIÓN inbox()");
console.log("========================================");
console.log("");

testInbox(walletAddress);
