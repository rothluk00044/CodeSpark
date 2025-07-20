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
        `console.log("Hello, CodeSpark!");\n\nfunction add(a, b) {\n  return a + b;\n}\n\nadd(5, 7); // This will be the final output`,
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

  const runCode = useCallback(async () => {
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
      // Wrap the user's code in an async IIFE to capture return value and handle promises
      // We explicitly return the result of the last expression
      const wrappedCode = `
        (async function() {
          let _result;
          try {
            // Use a block scope to prevent variable leakage and ensure last expression is captured
            _result = (function() {
              ${code}
            })(); // Execute the user's code
            
            if (_result instanceof Promise) {
              _result = await _result; // Await if it's a promise
            }
            return _result; // Explicitly return the result
          } catch (e) {
            throw e; // Re-throw to be caught by the outer try-catch
          }
        })();
      `

      // Execute the code in a new Function context for better isolation
      // Pass console to the function to allow user code to use it
      const executor = new Function("console", wrappedCode)
      const result = await executor(console) // Await the execution result from the executor

      let finalOutput = logs.join("\n")
      if (result !== undefined) {
        // Append the return value if it's not undefined
        if (finalOutput.length > 0) {
          finalOutput += "\n"
        }
        finalOutput += `=> ${typeof result === "object" && result !== null ? JSON.stringify(result, null, 2) : String(result)}`
      }
      setOutput(finalOutput)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Error: ${e.name}: ${e.message}\n${e.stack || ""}`)
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
