import { useState, useEffect } from 'react'
import * as CardanoLib from '@emurgo/cardano-serialization-lib-browser'
import { Buffer } from 'buffer'

const STORAGE_KEY = 'cardanoTransactions'
const MAX_TRANSACTIONS = 50

export const useTransactions = (wallet, walletAddress, adaBalance, updateBalance, setError) => {
  const [transactions, setTransactions] = useState([])
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [sendAddress, setSendAddress] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setTransactions(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Error cargando transacciones:', err)
    }
  }

  const saveTransactions = (txs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txs))
      setTransactions(txs)
    } catch (err) {
      console.error('Error guardando transacciones:', err)
    }
  }

  const addTransaction = (tx) => {
    setTransactions(current => {
      const newTx = {
        ...tx,
        id: tx.id || Date.now().toString(),
        timestamp: tx.timestamp || new Date().toISOString()
      }
      const existingIndex = current.findIndex(t => t.id === newTx.id)
      let updated
      if (existingIndex >= 0) {
        updated = [...current]
        updated[existingIndex] = newTx
      } else {
        updated = [newTx, ...current].slice(0, MAX_TRANSACTIONS)
      }
      saveTransactions(updated)
      return updated
    })
  }

  const sendTransaction = async () => {
    if (!wallet || !sendAddress.trim() || !sendAmount || parseFloat(sendAmount) <= 0) {
      setError('Por favor completa todos los campos correctamente')
      return
    }

    const amount = parseFloat(sendAmount)
    if (amount > adaBalance) {
      setError('No tienes suficiente balance')
      return
    }

    setIsSending(true)
    setError(null)

    const pendingTx = {
      type: 'send',
      to: sendAddress,
      amount: amount,
      status: 'pending',
      from: walletAddress
    }
    addTransaction(pendingTx)

    try {
      const lovelaceAmount = BigInt(Math.floor(amount * 1000000))
      
      try {
        CardanoLib.Address.from_bech32(sendAddress)
      } catch (e) {
        throw new Error('Dirección de destino inválida')
      }

      const utxos = await wallet.getUtxos()
      if (!utxos || utxos.length === 0) {
        throw new Error('No hay UTxOs disponibles')
      }

      const linearFee = CardanoLib.LinearFee.new(
        CardanoLib.BigNum.from_str('44'),
        CardanoLib.BigNum.from_str('155381')
      )

      const txBuilderConfig = CardanoLib.TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .pool_deposit(CardanoLib.BigNum.from_str('500000000'))
        .key_deposit(CardanoLib.BigNum.from_str('2000000'))
        .coins_per_utxo_byte(CardanoLib.BigNum.from_str('4310'))
        .max_value_size(5000)
        .max_tx_size(16384)
        .build()

      const txBuilder = CardanoLib.TransactionBuilder.new(txBuilderConfig)

      const outputAddress = CardanoLib.Address.from_bech32(sendAddress)
      const outputValue = CardanoLib.Value.new(
        CardanoLib.BigNum.from_str(lovelaceAmount.toString())
      )
      const output = CardanoLib.TransactionOutput.new(outputAddress, outputValue)
      txBuilder.add_output(output)

      const changeAddress = CardanoLib.Address.from_bech32(walletAddress)
      let totalInput = BigInt(0)
      
      for (const utxo of utxos.slice(0, 20)) {
        let txHash, index, utxoValue
        
        if (Array.isArray(utxo) && utxo.length >= 3) {
          txHash = utxo[0]
          index = utxo[1]
          const utxoOutput = utxo[2]
          if (utxoOutput && utxoOutput.amount) {
            if (Array.isArray(utxoOutput.amount)) {
              const lovelaceEntry = utxoOutput.amount.find(a => 
                a.unit === 'lovelace' || a.unit === '' || !a.unit
              )
              if (lovelaceEntry && lovelaceEntry.quantity) {
                utxoValue = BigInt(String(lovelaceEntry.quantity))
              }
            }
          }
        } else if (utxo.tx_hash && utxo.output_index !== undefined) {
          txHash = utxo.tx_hash
          index = utxo.output_index
          if (utxo.amount) {
            if (Array.isArray(utxo.amount)) {
              const lovelaceEntry = utxo.amount.find(a => 
                a.unit === 'lovelace' || a.unit === '' || !a.unit
              )
              if (lovelaceEntry && lovelaceEntry.quantity) {
                utxoValue = BigInt(String(lovelaceEntry.quantity))
              }
            }
          }
        } else {
          continue
        }

        if (!txHash || index === undefined || !utxoValue) continue

        try {
          const txHashBytes = typeof txHash === 'string' 
            ? Buffer.from(txHash.replace('0x', ''), 'hex')
            : txHash
          const txHashObj = CardanoLib.TransactionHash.from_bytes(txHashBytes)
          const input = CardanoLib.TransactionInput.new(txHashObj, index)
          
          const inputValue = CardanoLib.Value.new(
            CardanoLib.BigNum.from_str(utxoValue.toString())
          )
          
          txBuilder.add_input(changeAddress, input, inputValue)
          totalInput += utxoValue
          
          if (totalInput >= lovelaceAmount + BigInt(200000)) {
            break
          }
        } catch (e) {
          console.warn('Error procesando UTxO:', e)
          continue
        }
      }

      if (totalInput < lovelaceAmount) {
        throw new Error('No hay suficientes fondos en los UTxOs disponibles')
      }

      txBuilder.add_change_if_needed(changeAddress)

      const txBody = txBuilder.build()
      const tx = CardanoLib.Transaction.new(txBody)
      const txBytes = tx.to_bytes()
      const txHex = Buffer.from(txBytes).toString('hex')

      const signedTx = await wallet.signTx(txHex, true)
      const txHash = await wallet.submitTx(signedTx)

      setTransactions(current => {
        const updated = current.map(tx => 
          tx.id === pendingTx.id 
            ? { ...tx, status: 'success', txHash: txHash }
            : tx
        )
        saveTransactions(updated)
        return updated
      })

      setSendAddress('')
      setSendAmount('')
      setShowSendModal(false)
      setError(null)

      setTimeout(() => {
        updateBalance(wallet)
      }, 3000)

    } catch (err) {
      console.error('Error enviando transacción:', err)
      setError(err.message || 'Error al enviar la transacción')
      
      setTransactions(current => {
        const updated = current.map(tx => 
          tx.id === pendingTx.id 
            ? { ...tx, status: 'failed', error: err.message }
            : tx
        )
        saveTransactions(updated)
        return updated
      })
    } finally {
      setIsSending(false)
    }
  }

  return {
    transactions,
    showSendModal,
    setShowSendModal,
    showReceiveModal,
    setShowReceiveModal,
    sendAddress,
    setSendAddress,
    sendAmount,
    setSendAmount,
    isSending,
    sendTransaction
  }
}

