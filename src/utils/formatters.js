export const formatBalance = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00'
  }
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount)
}

export const formatAddress = (address) => {
  if (!address) return ''
  // Cardano addresses son bech32, mostrar primeros y últimos caracteres
  if (address.length > 20) {
    return `${address.slice(0, 10)}...${address.slice(-10)}`
  }
  return address
}

