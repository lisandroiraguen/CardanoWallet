import { formatBalance, formatAddress } from '../utils/formatters'

export const BalanceCard = ({ 
  wallet, 
  adaBalance, 
  walletAddress, 
  showBalance, 
  setShowBalance, 
  isUpdatingBalance,
  isEternlInstalled,
  isConnecting,
  onConnect 
}) => {
  return (
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
              onClick={onConnect}
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
    </div>
  )
}

