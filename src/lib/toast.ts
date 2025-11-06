import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => toast.success(message, { duration: 2000 }),
  error: (message: string) => toast.error(message, { duration: 2000 }),
}