import * as CardanoLib from '@emurgo/cardano-serialization-lib-browser';
import { Buffer } from 'buffer';

// Función para decodificar UTxO desde formato CBOR hex
export const decodeUtxo = (utxoHex) => {
  try {
    console.log('🔓 [DEBUG] Decodificando UTxO hex...')
    
    const hexString = utxoHex.startsWith('0x') ? utxoHex.slice(2) : utxoHex
    const bytes = Buffer.from(hexString, 'hex')
    
    const transactionUnspentOutput = CardanoLib.TransactionUnspentOutput.from_bytes(bytes);
    const output = transactionUnspentOutput.output();
    const amount = output.amount();
    
    const lovelace = amount.coin().to_str();
    console.log('✅ [DEBUG] Lovelace encontrado:', lovelace)
    
    return { 
      success: true,
      lovelace: lovelace,
      error: null
    };
    
  } catch (error) {
    console.error('❌ [DEBUG] Error con cardano-serialization-lib:', error)
    return {
      success: false,
      lovelace: null,
      error: error.message || "Error desconocido al decodificar UTxO."
    };
  }
}

// Función para extraer lovelace de un UTxO decodificado
export const extractLovelaceFromUtxo = (utxo) => {
  try {
    if (Array.isArray(utxo) && utxo.length >= 3) {
      const output = utxo[2]
      if (output && output.amount) {
        if (Array.isArray(output.amount)) {
          const lovelaceEntry = output.amount.find(a => 
            a.unit === 'lovelace' || a.unit === '' || !a.unit || a.unit === undefined
          )
          if (lovelaceEntry && lovelaceEntry.quantity) {
            return BigInt(String(lovelaceEntry.quantity))
          }
        } else if (output.amount.lovelace !== undefined) {
          return BigInt(String(output.amount.lovelace))
        }
      }
    }
    
    if (utxo.amount) {
      if (Array.isArray(utxo.amount)) {
        const lovelaceEntry = utxo.amount.find(a => 
          a.unit === 'lovelace' || a.unit === '' || !a.unit || a.unit === undefined
        )
        if (lovelaceEntry && lovelaceEntry.quantity) {
          return BigInt(String(lovelaceEntry.quantity))
        }
      } else if (utxo.amount.lovelace !== undefined) {
        return BigInt(String(utxo.amount.lovelace))
      }
    }
    
    if (utxo.lovelace !== undefined) {
      return BigInt(String(utxo.lovelace))
    }
    
    return null
  } catch (error) {
    console.error('❌ [DEBUG] Error extrayendo lovelace:', error)
    return null
  }
}

// Función para obtener el nombre de la red
export const getNetworkName = (networkId) => {
  if (networkId === 0 || networkId === '0') {
    return 'Testnet'
  } else if (networkId === 1 || networkId === '1') {
    return 'Mainnet'
  } else {
    return 'Preprod'
  }
}

