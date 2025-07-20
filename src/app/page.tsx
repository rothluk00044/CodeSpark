"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { OutputConsole } from "@/components/output-console"
import { useCodePlayground } from "@/hooks/use-code-playground"
import { PlayIcon, SaveIcon, Loader2Icon } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
      toast({
        title: "Code Saved!",
        description: result.message,
      })
    } else {
      toast({
        title: "Save Failed",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0 md:px-6">
        <h1 className="text-xl font-bold tracking-tight">Code Playground</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleRun} disabled={isRunning} aria-label="Run Code">
            {isRunning ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            Run
          </Button>
          <Button onClick={handleSave} disabled={isSaving} variant="outline" aria-label="Save Code">
            {isSaving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Desktop View: Split Panels */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col rounded-none border-none shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Code Editor</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <CodeEditor value={code} onChange={setCode} />
              </CardContent>
            </Card>
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col rounded-none border-none shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Output</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <OutputConsole output={output} error={error} />
              </CardContent>
            </Card>
          </div>

          {/* Mobile View: Tabs */}
          <div className="flex md:hidden flex-1 flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="flex-1 p-0 overflow-hidden mt-0">
                <Card className="flex-1 flex flex-col rounded-none border-none shadow-none">
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <CodeEditor value={code} onChange={setCode} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="output" className="flex-1 p-0 overflow-hidden mt-0">
                <Card className="flex-1 flex flex-col rounded-none border-none shadow-none">
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
