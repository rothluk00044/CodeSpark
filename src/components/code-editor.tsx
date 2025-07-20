"use client"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChangeEvent } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CodeEditor({ value, onChange, className }: CodeEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder={`// Write your JavaScript code here\nconsole.log("Hello, v0!");`}
      className={cn(
        "flex-1 w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-50 border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none",
        className,
      )}
      spellCheck="false"
      aria-label="Code Editor"
    />
  )
}