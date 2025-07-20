import { cn } from "@/lib/utils"

interface OutputConsoleProps {
  output: string
  error: string
  className?: string
}

export function OutputConsole({ output, error, className }: OutputConsoleProps) {
  return (
    <div
      className={cn(
        "flex-1 w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-200 overflow-auto rounded-lg",
        className,
      )}
      aria-live="polite"
    >
      {error ? (
        <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
      ) : (
        <pre className="whitespace-pre-wrap">{output}</pre>
      )}
    </div>
  )
}
