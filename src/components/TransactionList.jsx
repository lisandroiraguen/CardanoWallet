import { formatBalance, formatAddress } from '../utils/formatters'

export const TransactionList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null

  return (
    <div className="mt-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Transacciones Recientes</h3>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((tx) => (
          <div 
            key={tx.id} 
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'send' ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}>
                  {tx.type === 'send' ? (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {tx.type === 'send' ? 'Enviado' : 'Recibido'}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
                  {tx.type === 'send' ? '-' : '+'}{formatBalance(tx.amount)} ₳
                </p>
                <p className={`text-xs ${
                  tx.status === 'success' ? 'text-green-400' : 
                  tx.status === 'pending' ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {tx.status === 'success' ? 'Completado' : 
                   tx.status === 'pending' ? 'Pendiente' : 
                   'Fallido'}
                </p>
              </div>
            </div>
            {tx.txHash && (
              <p className="text-xs text-gray-500 font-mono mt-2">
                Hash: {tx.txHash.slice(0, 20)}...
              </p>
            )}
            {tx.error && (
              <p className="text-xs text-red-400 mt-1">{tx.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

