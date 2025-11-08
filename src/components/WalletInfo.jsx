import { formatAddress, formatBalance } from '../utils/formatters'

export const WalletInfo = ({ wallet, walletAddress, network, adaBalance }) => {
  if (!wallet || !walletAddress) return null

  return (
    <>
      <div className="mb-6 mt-5">
        <div className="flex items-center justify-between ml-2">
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
    </>
  )
}

