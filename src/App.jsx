import { useState, useEffect } from 'react'
import wasm from 'vite-plugin-wasm' // <-- 1. Importa el plugin
import * as CardanoLib from '@emurgo/cardano-serialization-lib-browser';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function App() {
  const [wallet, setWallet] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [adaBalance, setAdaBalance] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
  const [error, setError] = useState(null)
  const [showBalance, setShowBalance] = useState(true)
  const [network, setNetwork] = useState(null)

  // Verificar si Eternl está instalado
  useEffect(() => {
    checkEternlInstalled()
  }, [])

  const checkEternlInstalled = () => {
    if (window.cardano && window.cardano.eternl) {
      // Eternl está instalado
      return true
    }
    return false
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Verificar si Eternl está instalado
      if (!window.cardano || !window.cardano.eternl) {
        throw new Error('Eternl wallet no está instalado. Por favor instala la extensión de Chrome.')
      }

      // Conectar con Eternl
      const api = await window.cardano.eternl.enable()
      setWallet(api)

      // Obtener direcciones
      const addresses = await api.getUsedAddresses()
      if (addresses && addresses.length > 0) {
        const address = addresses[0]
        setWalletAddress(address)
      }

      // Obtener balance
      await updateBalance(api)

      // Obtener información de la red
      // Según CIP-30: 0 = Testnet, 1 = Mainnet
      const networkId = await api.getNetworkId()
      console.log('Network ID recibido:', networkId, 'Type:', typeof networkId)
      
      if (networkId === 0 || networkId === '0') {
        setNetwork('Testnet')
      } else if (networkId === 1 || networkId === '1') {
        setNetwork('Mainnet')
      } else {
        // Preprod o Pre-production testnet
        setNetwork('Preprod')
      }

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

// Función para decodificar UTxO desde formato CBOR hex
const decodeUtxo = (utxoHex) => {
  try {
    console.log('🔓 [DEBUG] Decodificando UTxO hex...')
    
    // Preparación del Hex y Buffer
    const hexString = utxoHex.startsWith('0x') ? utxoHex.slice(2) : utxoHex
    const bytes = Buffer.from(hexString, 'hex'); // Buffer ya debería estar disponible (solucionamos el error anterior)
    
    // Usar la librería de serialización de Cardano (Cardano ya debería estar inicializado)
    const transactionUnspentOutput = CardanoLib.TransactionUnspentOutput.from_bytes(bytes);
    const output = transactionUnspentOutput.output();
    const amount = output.amount();
    
    const lovelace = amount.coin().to_str();
    console.log('✅ [DEBUG] Lovelace encontrado:', lovelace)
    
    // Retorno en caso de ÉXITO
    return { 
      success: true,
      lovelace: lovelace,
      error: null
    };
    
  } catch (error) {
    console.error('❌ [DEBUG] Error con cardano-serialization-lib:', error)
    
    // ✅ MODIFICACIÓN CLAVE: NO LLAMAR a decodeUtxoManual
    // En su lugar, retornar un objeto de FALLO con el mensaje de error.
    return {
      success: false,
      lovelace: null,
      error: error.message || "Error desconocido al decodificar UTxO."
    };
  }
}

  // Función para extraer lovelace de un UTxO decodificado
  const extractLovelaceFromUtxo = (utxo) => {
    try {
      // Los UTxOs de Cardano tienen estructura: [txHash, outputIndex, output]
      // El output tiene: {address, amount: [{unit: "lovelace", quantity: "..."}]}
      if (Array.isArray(utxo) && utxo.length >= 3) {
        const output = utxo[2]
        if (output && output.amount) {
          // amount puede ser un array o un objeto
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
      
      // Formato alternativo: objeto con amount
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
      
      // Formato directo: {lovelace: ...}
      if (utxo.lovelace !== undefined) {
        return BigInt(String(utxo.lovelace))
      }
      
      return null
    } catch (error) {
      console.error('❌ [DEBUG] Error extrayendo lovelace:', error)
      return null
    }
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
      
      // DEBUG: Punto de breakpoint aquí
      //debugger; // Puedes poner un breakpoint aquí en VS Code
      
      // ESTRATEGIA 1: Intentar getBalance() primero (más directo)
      try {
        console.log('🔍 [DEBUG] Intentando getBalance()...')
        const balance = await apiInstance.getBalance()
        console.log('✅ [DEBUG] Balance raw recibido:', balance)
        console.log('📊 [DEBUG] Tipo:', typeof balance)
        console.log('📊 [DEBUG] Constructor:', balance?.constructor?.name)
        console.log('📊 [DEBUG] String representation:', String(balance))
        
        // DEBUG: Punto de breakpoint aquí
        //debugger;
        
        if (balance !== null && balance !== undefined) {
          if (typeof balance === 'string') {
            // Puede ser string numérico o hex
            if (balance.startsWith('0x')) {
              balanceValue = BigInt(balance)
            } else {
              balanceValue = BigInt(balance)
            }
          } else if (typeof balance === 'bigint') {
            balanceValue = balance
          } else if (typeof balance === 'number') {
            balanceValue = BigInt(Math.floor(balance))
          } else if (balance && typeof balance.toString === 'function') {
            const balanceStr = balance.toString()
            console.log('📊 [DEBUG] toString() result:', balanceStr)
            balanceValue = BigInt(balanceStr)
          } else {
            console.warn('⚠️ [DEBUG] Formato no reconocido, intentando JSON.stringify:', JSON.stringify(balance))
            throw new Error('Formato de balance no reconocido')
          }
          
          console.log('✅ [DEBUG] Balance procesado (lovelace):', balanceValue.toString())
        } else {
          throw new Error('Balance es null o undefined')
        }
      } catch (balanceError) {
        console.warn('⚠️ [DEBUG] getBalance() falló:', balanceError)
        console.log('🔄 [DEBUG] Intentando con getUtxos() como fallback...')
        
        // ESTRATEGIA 2: Fallback a getUtxos() con decodificación CBOR
        try {
          const utxos = await apiInstance.getUtxos()
          console.log('📦 [DEBUG] UTxOs obtenidos:', utxos)
          console.log('📊 [DEBUG] Número de UTxOs:', utxos ? utxos.length : 0)
          console.log('📊 [DEBUG] Tipo de UTxOs:', Array.isArray(utxos) ? 'Array' : typeof utxos)
          
          // DEBUG: Punto de breakpoint aquí
          //debugger;
          
          if (utxos && Array.isArray(utxos) && utxos.length > 0) {
            console.log('🔍 [DEBUG] Procesando', utxos.length, 'UTxOs...')
            
            balanceValue = utxos.reduce((total, utxo, index) => {
              try {
                console.log(`🔍 [DEBUG] UTxO ${index + 1}:`, utxo)
                console.log(`📊 [DEBUG] Tipo UTxO ${index + 1}:`, typeof utxo, Array.isArray(utxo) ? '(Array)' : '')
                
                let decodedUtxo = null
                let lovelace = null
                
                // Si es string hex (CBOR), decodificarlo
                if (typeof utxo === 'string') {
                  console.log(`🔓 [DEBUG] UTxO ${index + 1} es string hex, decodificando CBOR...`)
                  try {
                    decodedUtxo = decodeUtxo(utxo)
                    lovelace = extractLovelaceFromUtxo(decodedUtxo)
                    if (lovelace) {
                      console.log(`✅ [DEBUG] Lovelace extraído del UTxO ${index + 1} (CBOR):`, lovelace.toString())
                      return total + lovelace
                    }
                  } catch (decodeError) {
                    console.error(`❌ [DEBUG] Error decodificando UTxO ${index + 1}:`, decodeError)
                  }
                } else {
                  // Si ya es un objeto, intentar extraer lovelace directamente
                  lovelace = extractLovelaceFromUtxo(utxo)
                  if (lovelace) {
                    console.log(`✅ [DEBUG] Lovelace extraído del UTxO ${index + 1}:`, lovelace.toString())
                    return total + lovelace
                  }
                }
                
                // Formato 1: Array [txHash, outputIndex, {amount: [...]}]
                if (Array.isArray(utxo) && utxo.length >= 3) {
                  const utxoData = utxo[2]
                  console.log(`📦 [DEBUG] UTxO ${index + 1} formato Array, data:`, utxoData)
                  
                  if (utxoData && utxoData.amount && Array.isArray(utxoData.amount)) {
                    const lovelaceAmount = utxoData.amount.find(a => 
                      a.unit === 'lovelace' || a.unit === '' || !a.unit || a.unit === undefined
                    )
                    if (lovelaceAmount && lovelaceAmount.quantity) {
                      const quantity = BigInt(String(lovelaceAmount.quantity))
                      console.log(`✅ [DEBUG] Lovelace encontrado en UTxO ${index + 1}:`, quantity.toString())
                      return total + quantity
                    }
                  }
                }
                
                // Formato 2: Objeto {tx_hash, output_index, amount: [...]}
                if (utxo.amount && Array.isArray(utxo.amount)) {
                  console.log(`📦 [DEBUG] UTxO ${index + 1} formato Objeto con amount array`)
                  const lovelaceAmount = utxo.amount.find(a => 
                    a.unit === 'lovelace' || a.unit === '' || !a.unit || a.unit === undefined
                  )
                  if (lovelaceAmount && lovelaceAmount.quantity) {
                    const quantity = BigInt(String(lovelaceAmount.quantity))
                    console.log(`✅ [DEBUG] Lovelace encontrado en UTxO ${index + 1} (formato 2):`, quantity.toString())
                    return total + quantity
                  }
                }
                
                // Formato 3: {value: {lovelace: ...}}
                if (utxo.value && utxo.value.lovelace !== undefined) {
                  const quantity = BigInt(String(utxo.value.lovelace))
                  console.log(`✅ [DEBUG] Lovelace encontrado en UTxO ${index + 1} (formato 3):`, quantity.toString())
                  return total + quantity
                }
                
                // Formato 4: {lovelace: ...}
                if (utxo.lovelace !== undefined) {
                  const quantity = BigInt(String(utxo.lovelace))
                  console.log(`✅ [DEBUG] Lovelace encontrado en UTxO ${index + 1} (formato 4):`, quantity.toString())
                  return total + quantity
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

      // Convertir lovelace a ADA (1 ADA = 1,000,000 lovelace)
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

  const disconnectWallet = () => {
    setWallet(null)
    setWalletAddress(null)
    setAdaBalance(0)
    setNetwork(null)
    setError(null)
  }

  const formatBalance = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00'
    }
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }

  const formatAddress = (address) => {
    if (!address) return ''
    // Cardano addresses son bech32, mostrar primeros y últimos caracteres
    if (address.length > 20) {
      return `${address.slice(0, 10)}...${address.slice(-10)}`
    }
    return address
  }

  // Actualizar balance periódicamente cuando la wallet está conectada
  useEffect(() => {
    if (wallet) {
      updateBalance(wallet)
      const interval = setInterval(() => {
        updateBalance(wallet)
      }, 10000) // Actualizar cada 10 segundos

      return () => clearInterval(interval)
    }
  }, [wallet])

  const isEternlInstalled = checkEternlInstalled()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                ₳
              </div>
              <div>
                <h1 className="text-lg font-bold">Cardano Wallet</h1>
                <p className="text-xs text-gray-400">
                  {network ? `${network}` : 'Conecta tu wallet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {wallet ? (
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={!isEternlInstalled || isConnecting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEternlInstalled
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Install Eternl Message */}
        {!isEternlInstalled && !wallet && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-4">
            <p className="text-blue-400 text-sm mb-2">
              Para usar esta aplicación, necesitas instalar Eternl wallet.
            </p>
            <a
              href="https://chromewebstore.google.com/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 text-sm underline"
            >
              Instalar Eternl desde Chrome Web Store
            </a>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">Balance Total</p>
            {wallet && (
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showBalance ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0L3 15m3.59-8.41L15 3m0 0l3.59 3.59M15 3v12m0 0l-3.59-3.59" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="mb-6">
            {wallet ? (
              <>
                <div className="flex items-center gap-3">
                  {showBalance ? (
                    <h2 className="text-4xl font-bold mb-2">{formatBalance(adaBalance)} ₳</h2>
                  ) : (
                    <h2 className="text-4xl font-bold mb-2">••••••</h2>
                  )}
                  {isUpdatingBalance && (
                    <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                {walletAddress && (
                  <p className="text-gray-400 text-xs mt-2 font-mono">
                    {formatAddress(walletAddress)}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Conecta tu wallet para ver tu balance</p>
                <button
                  onClick={connectWallet}
                  disabled={!isEternlInstalled || isConnecting}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isEternlInstalled
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isConnecting ? 'Conectando...' : 'Conectar Eternl'}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {wallet && (
            <div className="grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Enviar</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Recibir</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Intercambiar</span>
              </button>
              <button 
                onClick={() => updateBalance(wallet)}
                disabled={isUpdatingBalance}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors border ${
                  isUpdatingBalance 
                    ? 'bg-gray-800/30 cursor-not-allowed border-gray-700/30' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50'
                }`}
              >
                <div className={`w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center ${isUpdatingBalance ? 'animate-spin' : ''}`}>
                  {isUpdatingBalance ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-medium">{isUpdatingBalance ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ADA Token Card */}
        {wallet && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mis Activos</h3>
            </div>
            <div className="bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-blue-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                    ₳
                  </div>
                  <div>
                    <h4 className="font-semibold">ADA</h4>
                    <p className="text-sm text-gray-400">Cardano</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatBalance(adaBalance)} ₳</p>
                  <p className="text-sm text-green-400">{network || 'Conectando...'}</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {formatBalance(adaBalance)} ADA disponible
              </div>
            </div>
          </div>
        )}

        {/* Wallet Info */}
        {wallet && walletAddress && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
            <h3 className="text-lg font-semibold mb-3">Información de la Wallet</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Red:</span>
                <span className="font-medium">{network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dirección:</span>
                <span className="font-mono text-xs">{formatAddress(walletAddress)}</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(walletAddress)}
                className="w-full mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                Copiar dirección completa
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!wallet && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-3">Cómo conectar tu wallet</h3>
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              <li>Asegúrate de tener Eternl instalado en Chrome</li>
              <li>Configura tu wallet en modo Testnet o Preprod</li>
              <li>Haz clic en el botón "Conectar" en la parte superior</li>
              <li>Acepta la conexión en la extensión de Eternl</li>
              <li>¡Listo! Verás tu balance de ADA</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
