"use client"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChangeEvent, UIEvent } from "react"
import { useRef, useState, useEffect } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CodeEditor({ value, onChange, className }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = useState(1)

  const updateLineNumbers = () => {
    if (textareaRef.current) {
      const lines = textareaRef.current.value.split("\n").length
      setLineCount(lines)
    }
  }

  useEffect(() => {
    updateLineNumbers()
  }, [value]) // Update line numbers when code changes

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    updateLineNumbers()
  }

  return (
    <div className={cn("relative flex h-full w-full overflow-hidden rounded-lg", className)}>
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 w-10 bg-gray-800 text-gray-400 text-right pr-2 pt-4 font-mono text-sm overflow-hidden select-none border-r border-gray-700/50"
        aria-hidden="true"
      >
        {" "}
        {/* Changed background to gray-800 */}
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="h-[1.25rem] leading-5">
            {i + 1}
          </div>
        ))}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder={`// Write your JavaScript code here\nconsole.log("Hello, CodeSpark!");\n\n// Try returning a value:\nlet a = 10;\nlet b = 20;\na * b; // This will be the output`}
        className="flex-1 w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-50 border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none leading-5"
        spellCheck="false"
        aria-label="Code Editor"
      />
    </div>
  )
}
