export const ErrorMessage = ({ error }) => {
  if (!error) return null

  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )
}

