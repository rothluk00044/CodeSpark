"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { OutputConsole } from "@/components/output-console"
import { useCodePlayground } from "@/hooks/use-code-playground"
import { PlayIcon, SaveIcon, Loader2Icon, TerminalIcon, CodeIcon } from "lucide-react"
import { toast } from "sonner"

export default function CodePlaygroundPage() {
  const { code, output, error, isRunning, isSaving, setCode, runCode, saveCode } = useCodePlayground()
  const [activeTab, setActiveTab] = useState("code")

  const handleRun = async () => {
    setActiveTab("output")
    runCode()
  }

  const handleSave = async () => {
    const result = await saveCode()
    if (result.success) {
      toast.success("Code Saved!", {
        description: result.message,
      })
    } else {
      toast.error("Save Failed", {
        description: result.message,
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-gray-50">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 shadow-lg shrink-0 md:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">
          CodeSpark
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            aria-label="Run Code"
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {isRunning ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            Run
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="outline"
            aria-label="Save Code"
            className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-50 shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 bg-transparent"
          >
            {isSaving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-xl shadow-2xl bg-gray-900 border border-gray-700/50">
          {/* Desktop View: Split Panels */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col rounded-none border-none shadow-none bg-transparent">
              <CardHeader className="pb-2 border-b border-gray-700/50">
                <CardTitle className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <CodeIcon className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600" />{" "}
                  Code Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <CodeEditor value={code} onChange={setCode} />
              </CardContent>
            </Card>
          </div>
          <Separator orientation="vertical" className="hidden md:block bg-gray-700/50" />
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col rounded-none border-none shadow-none bg-transparent">
              <CardHeader className="pb-2 border-b border-gray-700/50">
                <CardTitle className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <TerminalIcon className="w-5 h-5 text-teal-400" /> Output Console
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <OutputConsole output={output} error={error} />
              </CardContent>
            </Card>
          </div>

          {/* Mobile View: Tabs */}
          <div className="flex md:hidden flex-1 flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-gray-700/50 bg-gray-800">
                <TabsTrigger
                  value="code"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50 data-[state=active]:shadow-inner"
                >
                  <CodeIcon className="w-4 h-4 mr-2" /> Code
                </TabsTrigger>
                <TabsTrigger
                  value="output"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50 data-[state=active]:shadow-inner"
                >
                  <TerminalIcon className="w-4 h-4 mr-2" /> Output
                </TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="flex-1 p-0 overflow-hidden mt-0">
                <Card className="flex-1 flex flex-col rounded-none border-none shadow-none bg-transparent">
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <CodeEditor value={code} onChange={setCode} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="output" className="flex-1 p-0 overflow-hidden mt-0">
                <Card className="flex-1 flex flex-col rounded-none border-none shadow-none bg-transparent">
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <OutputConsole output={output} error={error} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
