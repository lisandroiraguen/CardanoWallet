import { useState, useEffect } from 'react'
import * as CardanoLib from '@emurgo/cardano-serialization-lib-browser'
import { extractLovelaceFromUtxo, decodeUtxo, getNetworkName } from '../utils/cardano'

export const useWallet = () => {
  const [wallet, setWallet] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [adaBalance, setAdaBalance] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
  const [error, setError] = useState(null)
  const [showBalance, setShowBalance] = useState(true)
  const [network, setNetwork] = useState(null)

  const checkEternlInstalled = () => {
    return !!(window.cardano && window.cardano.eternl)
  }

  const updateBalance = async (apiInstance = wallet) => {
    if (!apiInstance) {
      console.log('❌ No hay instancia de API disponible')
      return
    }

    setIsUpdatingBalance(true)
    setError(null)

    try {
      let balanceValue = null
      
      try {
        console.log('🔍 [DEBUG] Intentando getBalance()...')
        const balance = await apiInstance.getBalance()
        console.log('✅ [DEBUG] Balance raw recibido:', balance)
        
        if (balance !== null && balance !== undefined) {
          if (typeof balance === 'string') {
            balanceValue = balance.startsWith('0x') ? BigInt(balance) : BigInt(balance)
          } else if (typeof balance === 'bigint') {
            balanceValue = balance
          } else if (typeof balance === 'number') {
            balanceValue = BigInt(Math.floor(balance))
          } else if (balance && typeof balance.toString === 'function') {
            balanceValue = BigInt(balance.toString())
          } else {
            throw new Error('Formato de balance no reconocido')
          }
          
          console.log('✅ [DEBUG] Balance procesado (lovelace):', balanceValue.toString())
        } else {
          throw new Error('Balance es null o undefined')
        }
      } catch (balanceError) {
        console.warn('⚠️ [DEBUG] getBalance() falló:', balanceError)
        console.log('🔄 [DEBUG] Intentando con getUtxos() como fallback...')
        
        try {
          const utxos = await apiInstance.getUtxos()
          console.log('📦 [DEBUG] UTxOs obtenidos:', utxos)
          
          if (utxos && Array.isArray(utxos) && utxos.length > 0) {
            console.log('🔍 [DEBUG] Procesando', utxos.length, 'UTxOs...')
            
            balanceValue = utxos.reduce((total, utxo, index) => {
              try {
                let lovelace = null
                
                if (typeof utxo === 'string') {
                  console.log(`🔓 [DEBUG] UTxO ${index + 1} es string hex, decodificando CBOR...`)
                  try {
                    const decodedUtxo = decodeUtxo(utxo)
                    lovelace = extractLovelaceFromUtxo(decodedUtxo)
                    if (lovelace) {
                      console.log(`✅ [DEBUG] Lovelace extraído del UTxO ${index + 1} (CBOR):`, lovelace.toString())
                      return total + lovelace
                    }
                  } catch (decodeError) {
                    console.error(`❌ [DEBUG] Error decodificando UTxO ${index + 1}:`, decodeError)
                  }
                } else {
                  lovelace = extractLovelaceFromUtxo(utxo)
                  if (lovelace) {
                    console.log(`✅ [DEBUG] Lovelace extraído del UTxO ${index + 1}:`, lovelace.toString())
                    return total + lovelace
                  }
                }
                
                if (Array.isArray(utxo) && utxo.length >= 3) {
                  const utxoData = utxo[2]
                  if (utxoData && utxoData.amount && Array.isArray(utxoData.amount)) {
                    const lovelaceAmount = utxoData.amount.find(a => 
                      a.unit === 'lovelace' || a.unit === '' || !a.unit || a.unit === undefined
                    )
                    if (lovelaceAmount && lovelaceAmount.quantity) {
                      const quantity = BigInt(String(lovelaceAmount.quantity))
                      return total + quantity
                    }
                  }
                }
                
                if (utxo.amount && Array.isArray(utxo.amount)) {
                  const lovelaceAmount = utxo.amount.find(a => 
                    a.unit === 'lovelace' || a.unit === '' || !a.unit || a.unit === undefined
                  )
                  if (lovelaceAmount && lovelaceAmount.quantity) {
                    const quantity = BigInt(String(lovelaceAmount.quantity))
                    return total + quantity
                  }
                }
                
                if (utxo.value && utxo.value.lovelace !== undefined) {
                  return total + BigInt(String(utxo.value.lovelace))
                }
                
                if (utxo.lovelace !== undefined) {
                  return total + BigInt(String(utxo.lovelace))
                }
                
                console.warn(`⚠️ [DEBUG] No se pudo extraer lovelace del UTxO ${index + 1}`)
              } catch (e) {
                console.error(`❌ [DEBUG] Error procesando UTxO ${index + 1}:`, e)
              }
              return total
            }, BigInt(0))
            
            console.log('✅ [DEBUG] Balance total calculado desde UTxOs (lovelace):', balanceValue.toString())
          } else {
            console.warn('⚠️ [DEBUG] No hay UTxOs disponibles o el array está vacío')
            balanceValue = BigInt(0)
          }
        } catch (utxoError) {
          console.error('❌ [DEBUG] Error obteniendo UTxOs:', utxoError)
          throw new Error(`No se pudo obtener el balance: ${utxoError.message}`)
        }
      }

      if (balanceValue === null) {
        throw new Error('No se pudo obtener el balance con ningún método')
      }

      const adaAmount = Number(balanceValue) / 1000000
      console.log('💰 [DEBUG] ADA amount calculado:', adaAmount)
      
      if (isNaN(adaAmount) || adaAmount < 0) {
        throw new Error(`Balance inválido: ${adaAmount}`)
      }
      
      setAdaBalance(adaAmount)
      setError(null)
      console.log('✅ [DEBUG] Balance actualizado exitosamente:', adaAmount, 'ADA')
    } catch (err) {
      console.error('❌ [DEBUG] Error obteniendo balance:', err)
      setError(`Error al obtener el balance: ${err.message}`)
      setAdaBalance(0)
    } finally {
      setIsUpdatingBalance(false)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (!window.cardano || !window.cardano.eternl) {
        throw new Error('Eternl wallet no está instalado. Por favor instala la extensión de Chrome.')
      }

      const api = await window.cardano.eternl.enable()
      setWallet(api)

      const addresses = await api.getUsedAddresses()
      if (addresses && addresses.length > 0) {
        setWalletAddress(addresses[0])
      }

      await updateBalance(api)

      const networkId = await api.getNetworkId()
      console.log('Network ID recibido:', networkId, 'Type:', typeof networkId)
      setNetwork(getNetworkName(networkId))

    } catch (err) {
      console.error('Error conectando wallet:', err)
      setError(err.message || 'Error al conectar con Eternl wallet')
      setWallet(null)
      setWalletAddress(null)
      setAdaBalance(0)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    setWalletAddress(null)
    setAdaBalance(0)
    setNetwork(null)
    setError(null)
  }

  // Dentro de useWallet.js
// ... después de disconnectWallet ...

// Nuevo useEffect para la reconexión automática/inicialización
useEffect(() => {
  const checkConnection = async () => {
    // Si ya estamos conectados (esto cubre el caso de que otro useEffect lo haya hecho), salimos.
    if (wallet) return 
    await new Promise(resolve => setTimeout(resolve, 300));
    // 1. Verificar si la billetera está instalada.
    if (!checkEternlInstalled()) return 

    try {
      // 2. Intentar habilitar la billetera (esto reconecta si ya dio permiso)
      // Usar window.cardano.eternl.isEnabled() para verificar el permiso es más seguro.
      // Pero si usamos enable() con un try/catch, forzamos la reconexión.
      
      const isEnabled = await window.cardano.eternl.isEnabled()
      
      if (isEnabled) {
        console.log('🔄 [DEBUG] Intentando reconexión silenciosa...')
        const api = await window.cardano.eternl.enable() // Re-habilitar
        
        // 3. ACTUALIZAR ESTADOS (¡Esto fuerza el re-renderizado!)
        setWallet(api) 
        
        const addresses = await api.getUsedAddresses()
        if (addresses && addresses.length > 0) {
          setWalletAddress(addresses[0])
        }

        const networkId = await api.getNetworkId()
        setNetwork(getNetworkName(networkId))
        
        // 4. Actualizar el balance después de la reconexión
        await updateBalance(api)
        
      }
    } catch (err) {
      console.warn('⚠️ [DEBUG] No se pudo reconectar automáticamente (puede que el permiso haya sido revocado o no se haya dado):', err)
      // No seteamos un error visible si solo es una falta de permiso de reconexión.
    }
  }

  checkConnection()
}, []) // Array de dependencias vacío para que se ejecute solo al montar.




  return {
    wallet,
    walletAddress,
    adaBalance,
    isConnecting,
    isUpdatingBalance,
    error,
    showBalance,
    setShowBalance,
    network,
    checkEternlInstalled,
    connectWallet,
    disconnectWallet,
    updateBalance,
    setError
  }
}

