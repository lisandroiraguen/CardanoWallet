export const Header = ({ network, wallet, isConnecting, isEternlInstalled, onConnect, onDisconnect }) => {
  return (
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
                onClick={onDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Desconectar
              </button>
            ) : (
              <button
                onClick={onConnect}
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
  )
}

