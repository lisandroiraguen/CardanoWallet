export const EternlInstallMessage = ({ isEternlInstalled, wallet }) => {
  if (isEternlInstalled || wallet) return null

  return (
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
  )
}

