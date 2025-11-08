export const ActionButtons = ({ 
  wallet, 
  isUpdatingBalance, 
  onUpdateBalance, 
  onSendClick, 
  onReceiveClick 
}) => {
  if (!wallet) return null

  return (
    <div className="grid grid-cols-4 gap-3">
      <button 
        onClick={onSendClick}
        className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50"
      >
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <span className="text-xs font-medium">Enviar</span>
      </button>
      <button 
        onClick={onReceiveClick}
        className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50"
      >
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
        onClick={onUpdateBalance}
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
  )
}

