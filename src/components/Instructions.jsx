export const Instructions = ({ wallet }) => {
  if (wallet) return null

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-3">Cómo conectar tu wallet</h3>
      <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
        <li>Asegúrate de tener Eternl instalado en Chrome</li>
        <li>Configura tu wallet en modo Testnet o Preprod</li>
        <li>Haz clic en el botón "Conectar" en la parte superior</li>
        <li>Acepta la conexión en la extensión de Eternl</li>
        <li>¡Listo! Verás tu balance de ADA</li>
      </ol>
    </div>
  )
}

