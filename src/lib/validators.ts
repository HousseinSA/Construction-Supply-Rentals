export const validateMauritanianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s+/g, '')
  return /^[234]\d{7}$/.test(cleanPhone)
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}