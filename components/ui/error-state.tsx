// components/ui/error-state.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message?: string
}

export function ErrorState({ title = "Erro", message = "Ocorreu um erro" }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="flex items-start gap-2">
      <AlertCircle className="h-4 w-4 mt-1" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  )
}
