export const ReceiveModal = ({ isOpen, onClose, walletAddress }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recibir ADA</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <p className="text-sm text-gray-400 mb-2">Tu dirección de recepción:</p>
            <p className="font-mono text-sm break-all text-white">{walletAddress}</p>
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(walletAddress)
              alert('Dirección copiada al portapapeles')
            }}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors text-white"
          >
            Copiar dirección
          </button>
        </div>
      </div>
    </div>
  )
}

