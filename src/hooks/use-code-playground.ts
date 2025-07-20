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
setCode(`// Write your code below ->
// You can define functions and variables,
// then call them at the end to see the output.
// The final value will be shown in the output box,
// and console.log will show logs.

// Example:
console.log("Hello, CodeSpark!"); // This shows up as a log

function add(a, b) {
  return a + b;
}

// This result will be shown as the final output:
add(5, 7);
`);
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

    // Store original console methods
    const originalConsoleLog = console.log
    const originalConsoleError = console.error

    const logs: string[] = []

    // Override console.log and console.error to capture output
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
    console.error = (...args: unknown[]) => {
      logs.push("ERROR: " + args.map(String).join(" "))
    }

    let executionResult: unknown

    try {
      // Wrap the user's code in an async IIFE to handle promises and capture return value.
      // The `return` statement at the end of the IIFE ensures the last expression's value
      // or the resolved promise is returned by the `new Function` call.
      const codeToExecute = `
        'use strict';
        return (async function() {
          // Execute the user's code. The value of the last expression will be returned.
          ${code}
        })();
      `

      // Create a new Function. It executes in its own scope, but uses the global `console`
      // which we have temporarily overridden.
      const executor = new Function(codeToExecute)

      // Execute the function. It returns a Promise because of the async IIFE.
      executionResult = await executor()

      let finalOutput = logs.join("\n")
      if (executionResult !== undefined) {
        if (finalOutput.length > 0) {
          finalOutput += "\n"
        }
        // Format the result nicely
        finalOutput += `=> ${typeof executionResult === "object" && executionResult !== null ? JSON.stringify(executionResult, null, 2) : String(executionResult)}`
      }
      setOutput(finalOutput)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Error: ${e.name}: ${e.message}\n${e.stack || ""}`)
      } else {
        setError(`An unknown error occurred: ${String(e)}`)
      }
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog
      console.error = originalConsoleError
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
