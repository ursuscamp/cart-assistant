interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
  show: boolean
}

const toast = reactive<Toast>({
  message: '',
  type: 'success',
  show: false
})

export function useToast() {
  function show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    toast.message = message
    toast.type = type
    toast.show = true
    setTimeout(() => {
      toast.show = false
    }, 3000)
  }

  function success(message: string) {
    show(message, 'success')
  }

  function error(message: string) {
    show(message, 'error')
  }

  function info(message: string) {
    show(message, 'info')
  }

  return {
    toast,
    show,
    success,
    error,
    info
  }
}
