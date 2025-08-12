import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast'

interface ToastContextType {
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, toasts, dismiss } = useToast()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            className="min-w-[300px]"
          >
            <div className="flex-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            <ToastClose onClick={() => dismiss(toast.id)} />
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
} 