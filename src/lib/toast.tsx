import { toast as sonnerToast } from "sonner"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"

const toastWithIcons = {
  success: (message: string) => {
    sonnerToast.success(message, {
      icon: <CheckCircle2 className="w-5 h-5" />,
    })
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      icon: <XCircle className="w-5 h-5" />,
    })
  },
  info: (message: string) => {
    sonnerToast.info(message, {
      icon: <Info className="w-5 h-5" />,
    })
  },
  warning: (message: string) => {
    sonnerToast.warning(message, {
      icon: <AlertTriangle className="w-5 h-5" />,
    })
  },
}

export const toast = toastWithIcons
export const showToast = toastWithIcons
