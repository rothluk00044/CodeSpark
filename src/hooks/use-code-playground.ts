"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { saveCodeSnippetServerAction, exportSnippetsServerAction } from "@/lib/actions"
import { v4 as uuidv4 } from "uuid" // For generating unique IDs

// You'll need to install uuid: pnpm add uuid @types/uuid
// Or npm: npm install uuid @types/uuid

const LOCAL_STORAGE_KEY_CODE = "code-playground-current-snippet"
const LOCAL_STORAGE_KEY_SNIPPETS = "code-playground-saved-snippets"
const DEBOUNCE_DELAY = 500 // milliseconds

interface CodeSnippet {
  id: string
  name: string
  code: string
  createdAt: number
  lastModified: number
}

export function useCodePlayground() {
  const [code, setCode] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(null)

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load snippets and current code from local storage on initial mount
  useEffect(() => {
    const savedSnippets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_SNIPPETS) || "[]") as CodeSnippet[]
    setSnippets(savedSnippets)

    const savedCurrentCode = localStorage.getItem(LOCAL_STORAGE_KEY_CODE)
    if (savedCurrentCode) {
      setCode(savedCurrentCode)
      // Try to find if this code belongs to an existing snippet
      const matchingSnippet = savedSnippets.find((s) => s.code === savedCurrentCode)
      if (matchingSnippet) {
        setCurrentSnippetId(matchingSnippet.id)
      } else {
        setCurrentSnippetId(null) // It's unsaved or a new session
      }
    } else if (savedSnippets.length > 0) {
      // If no current code, load the most recently modified snippet
      const latestSnippet = savedSnippets.sort((a, b) => b.lastModified - a.lastModified)[0]
      setCode(latestSnippet.code)
      setCurrentSnippetId(latestSnippet.id)
    } else {
      // Default code if nothing is saved
      const defaultCode = `console.log("Hello, CodeSpark!");\n\nfunction add(a, b) {\n  return a + b;\n}\n\nadd(5, 7); // This will be the final output`
      setCode(defaultCode)
      setCurrentSnippetId(null)
    }
  }, [])

  // Save current code to local storage with debounce
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY_CODE, code)
      // If the current code matches a loaded snippet, update its lastModified time
      setSnippets((prevSnippets) =>
        prevSnippets.map((s) =>
          s.id === currentSnippetId && s.code === code ? { ...s, lastModified: Date.now() } : s,
        ),
      )
    }, DEBOUNCE_DELAY)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [code, currentSnippetId])

  // Persist snippets array to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SNIPPETS, JSON.stringify(snippets))
  }, [snippets])

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
      // If a snippet is currently loaded, update it
      if (currentSnippetId) {
        setSnippets((prevSnippets) =>
          prevSnippets.map((s) => (s.id === currentSnippetId ? { ...s, code: code, lastModified: Date.now() } : s)),
        )
        const result = await saveCodeSnippetServerAction(code, currentSnippetId) // Simulate server save
        return result
      } else {
        // If no snippet is loaded, prompt to save as new
        return { success: false, message: "No snippet loaded. Use 'Save As New' to save this code." }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { success: false, message: `Failed to save: ${e.message}` }
      } else {
        return { success: false, message: `Failed to save: An unknown error occurred.` }
      }
    } finally {
      setIsSaving(false)
    }
  }, [code, currentSnippetId, snippets])

  const saveNewSnippet = useCallback(
    async (name: string) => {
      setIsSaving(true)
      try {
        const newSnippet: CodeSnippet = {
          id: uuidv4(),
          name,
          code,
          createdAt: Date.now(),
          lastModified: Date.now(),
        }
        setSnippets((prevSnippets) => [...prevSnippets, newSnippet])
        setCurrentSnippetId(newSnippet.id) // Set the newly saved snippet as current
        const result = await saveCodeSnippetServerAction(code, newSnippet.id) // Simulate server save
        return result
      } catch (e: unknown) {
        if (e instanceof Error) {
          return { success: false, message: `Failed to save new snippet: ${e.message}` }
        } else {
          return { success: false, message: `Failed to save new snippet: An unknown error occurred.` }
        }
      } finally {
        setIsSaving(false)
      }
    },
    [code],
  )

  const loadSnippet = useCallback(
    (id: string) => {
      const snippetToLoad = snippets.find((s) => s.id === id)
      if (snippetToLoad) {
        setCode(snippetToLoad.code)
        setCurrentSnippetId(snippetToLoad.id)
        setOutput("")
        setError("")
      }
    },
    [snippets],
  )

  const deleteSnippet = useCallback(
    async (id: string) => {
      try {
        setSnippets((prevSnippets) => prevSnippets.filter((s) => s.id !== id))
        if (currentSnippetId === id) {
          // If the deleted snippet was the current one, clear editor or load another
          setCode(
            `// Snippet "${snippets.find((s) => s.id === id)?.name || "deleted"}" was removed.\n// Start a new one or load another from the sidebar.`,
          )
          setCurrentSnippetId(null)
          setOutput("")
          setError("")
        }
        // Simulate server-side delete confirmation
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { success: true, message: "Snippet deleted successfully (simulated)." }
      } catch (e: unknown) {
        if (e instanceof Error) {
          return { success: false, message: `Failed to delete snippet: ${e.message}` }
        } else {
          return { success: false, message: `Failed to delete snippet: An unknown error occurred.` }
        }
      }
    },
    [snippets, currentSnippetId],
  )

  const exportAllSnippets = useCallback(async () => {
    try {
      const result = await exportSnippetsServerAction(snippets)
      // In a real app, this would trigger a file download or similar.
      // For this simulation, the server action just logs it.
      return result
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { success: false, message: `Failed to export snippets: ${e.message}` }
      } else {
        return { success: false, message: `Failed to export snippets: An unknown error occurred.` }
      }
    }
  }, [snippets])

  return {
    code,
    output,
    error,
    isRunning,
    isSaving,
    setCode,
    runCode,
    saveCode,
    snippets,
    currentSnippetId,
    saveNewSnippet,
    loadSnippet,
    deleteSnippet,
    exportAllSnippets,
  }
}
