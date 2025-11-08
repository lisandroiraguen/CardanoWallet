import { Buffer } from 'buffer'
window.Buffer = Buffer

import wasm from 'vite-plugin-wasm'
import { useWallet } from './hooks/useWallet'
import { useTransactions } from './hooks/useTransactions'
import { Header } from './components/Header'
import { BalanceCard } from './components/BalanceCard'
import { ActionButtons } from './components/ActionButtons'
import { TransactionList } from './components/TransactionList'
import { SendModal } from './components/SendModal'
import { ReceiveModal } from './components/ReceiveModal'
import { WalletInfo } from './components/WalletInfo'
import { Instructions } from './components/Instructions'
import { ErrorMessage } from './components/ErrorMessage'
import { EternlInstallMessage } from './components/EternlInstallMessage'

function App() {
  const wallet = useWallet()
  const transactions = useTransactions(
    wallet.wallet,
    wallet.walletAddress,
    wallet.adaBalance,
    wallet.updateBalance,
    wallet.setError
  )

  const isEternlInstalled = wallet.checkEternlInstalled()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header
        network={wallet.network}
        wallet={wallet.wallet}
        isConnecting={wallet.isConnecting}
        isEternlInstalled={isEternlInstalled}
        onConnect={wallet.connectWallet}
        onDisconnect={wallet.disconnectWallet}
      />

      <div className="max-w-md mx-auto px-4 py-6">
        <ErrorMessage error={wallet.error} />
        <EternlInstallMessage isEternlInstalled={isEternlInstalled} wallet={wallet.wallet} />

        <BalanceCard
          wallet={wallet.wallet}
          adaBalance={wallet.adaBalance}
          walletAddress={wallet.walletAddress}
          showBalance={wallet.showBalance}
          setShowBalance={wallet.setShowBalance}
          isUpdatingBalance={wallet.isUpdatingBalance}
          isEternlInstalled={isEternlInstalled}
          isConnecting={wallet.isConnecting}
          onConnect={wallet.connectWallet}
        />

        <ActionButtons
          wallet={wallet.wallet}
          isUpdatingBalance={wallet.isUpdatingBalance}
          onUpdateBalance={() => wallet.updateBalance(wallet.wallet)}
          onSendClick={() => transactions.setShowSendModal(true)}
          onReceiveClick={() => transactions.setShowReceiveModal(true)}
        />

        <TransactionList transactions={transactions.transactions} />

        <WalletInfo
          wallet={wallet.wallet}
          walletAddress={wallet.walletAddress}
          network={wallet.network}
          adaBalance={wallet.adaBalance}
        />

        <Instructions wallet={wallet.wallet} />
      </div>

      <SendModal
        isOpen={transactions.showSendModal}
        onClose={() => {
          transactions.setShowSendModal(false)
          transactions.setSendAddress('')
          transactions.setSendAmount('')
          wallet.setError(null)
        }}
        sendAddress={transactions.sendAddress}
        setSendAddress={transactions.setSendAddress}
        sendAmount={transactions.sendAmount}
        setSendAmount={transactions.setSendAmount}
        adaBalance={wallet.adaBalance}
        isSending={transactions.isSending}
        error={wallet.error}
        onSend={transactions.sendTransaction}
      />

      <ReceiveModal
        isOpen={transactions.showReceiveModal}
        onClose={() => transactions.setShowReceiveModal(false)}
        walletAddress={wallet.walletAddress}
      />
    </div>
  )
}

export default App
