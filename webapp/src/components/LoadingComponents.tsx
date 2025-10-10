import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({ value, max = 100, className, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Processing...</span>
        {showPercentage && (
          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}