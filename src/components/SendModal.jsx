import { formatBalance } from '../utils/formatters'

export const SendModal = ({ 
  isOpen, 
  onClose, 
  sendAddress, 
  setSendAddress, 
  sendAmount, 
  setSendAmount, 
  adaBalance, 
  isSending, 
  error, 
  onSend 
}) => {
  if (!isOpen) return null

  const isValid = sendAddress.trim() && sendAmount && parseFloat(sendAmount) > 0 && parseFloat(sendAmount) <= adaBalance

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Enviar ADA</h2>
          <button
            onClick={() => {
              onClose()
              setSendAddress('')
              setSendAmount('')
            }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dirección de destino
            </label>
            <input
              type="text"
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
              placeholder="addr1..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cantidad (ADA)
            </label>
            <input
              type="number"
              step="0.000001"
              min="0"
              max={adaBalance}
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Disponible: {formatBalance(adaBalance)} ₳
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={onSend}
            disabled={!isValid || isSending}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !isValid || isSending
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

