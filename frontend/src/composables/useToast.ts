import { reactive } from 'vue'

export type ToastColor = 'success' | 'error' | 'warning' | 'info'

export function useToast() {
  const toast = reactive({
    show: false,
    message: '',
    color: 'success' as ToastColor,
  })

  const openToast = (message: string, color: ToastColor = 'success') => {
    toast.show = false
    toast.message = message
    toast.color = color
    setTimeout(() => {
      toast.show = true
    }, 10)
  }

  return {
    toast,
    openToast,
  }
}
