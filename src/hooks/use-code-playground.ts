"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { saveCodeSnippet } from "@/lib/actions"

const LOCAL_STORAGE_KEY = "code-playground-snippet"
const DEBOUNCE_DELAY = 500 // milliseconds

export function useCodePlayground() {
  const [code, setCode] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load code from local storage on initial mount
  useEffect(() => {
    const savedCode = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedCode) {
      setCode(savedCode)
    } else {
      // Default code if nothing is saved
      setCode(
        `console.log("Hello, v0!");\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("World"));`,
      )
    }
  }, [])

  // Save code to local storage with debounce
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, code)
    }, DEBOUNCE_DELAY)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [code])

  const runCode = useCallback(() => {
    setIsRunning(true)
    setOutput("")
    setError("")

    // Capture console.log output
    const originalConsoleLog = console.log
    const logs: string[] = []
    console.log = (...args: unknown[]) => {
      logs.push(
        args
          .map((arg) => {
            if (typeof arg === "object" && arg !== null) {
              try {
                return JSON.stringify(arg, null, 2)
              } catch (e) {
                return String(arg) // Fallback for circular references
              }
            }
            return String(arg)
          })
          .join(" "),
      )
    }

    try {
      // Execute the code in a new Function context for better isolation
      // 'use strict' is added to prevent accidental global variable creation
      new Function("console", `'use strict';\n${code}`)(console)
      setOutput(logs.join("\n"))
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Error: ${e.message}`)
      } else {
        setError(`An unknown error occurred: ${String(e)}`)
      }
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog
      setIsRunning(false)
    }
  }, [code])

  const saveCode = useCallback(async () => {
    setIsSaving(true)
    try {
      // Simulate a server-side save operation using a Server Action
      const result = await saveCodeSnippet(code)
      return result
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { success: false, message: `Failed to save: ${e.message}` }
      } else {
        return { success: false, message: `Failed to save: An unknown error occurred.` }
      }
    } finally {
      setIsSaving(false)
    }
  }, [code])

  return {
    code,
    output,
    error,
    isRunning,
    isSaving,
    setCode,
    runCode,
    saveCode,
  }
}
