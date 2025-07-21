"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { OutputConsole } from "@/components/output-console"
import { useCodePlayground } from "@/hooks/use-code-playground"
import {
  PlayIcon,
  SaveIcon,
  Loader2Icon,
  TerminalIcon,
  CodeIcon,
  MenuIcon,
  FilePlusIcon,
  Trash2Icon,
  DownloadIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CodePlaygroundPage() {
  const {
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
  } = useCodePlayground()
  const [activeTab, setActiveTab] = useState("code")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [newSnippetName, setNewSnippetName] = useState("")
  const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null)

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

  const handleSaveAs = () => {
    setNewSnippetName("")
    setIsSaveAsDialogOpen(true)
  }

  const confirmSaveAs = async () => {
    if (!newSnippetName.trim()) {
      toast.error("Snippet name cannot be empty.")
      return
    }
    const result = await saveNewSnippet(newSnippetName)
    if (result.success) {
      toast.success("Snippet Saved!", {
        description: result.message,
      })
      setIsSaveAsDialogOpen(false)
      setIsSheetOpen(false) // Close sidebar after saving new
    } else {
      toast.error("Save Failed", {
        description: result.message,
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setSnippetToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (snippetToDelete) {
      const result = await deleteSnippet(snippetToDelete)
      if (result.success) {
        toast.success("Snippet Deleted!", {
          description: result.message,
        })
      } else {
        toast.error("Delete Failed", {
          description: result.message,
        })
      }
      setSnippetToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleExport = async () => {
    const result = await exportAllSnippets()
    if (result.success) {
      toast.success("Snippets Exported!", {
        description: result.message,
      })
    } else {
      toast.error("Export Failed", {
        description: result.message,
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-50">
      {" "}
      {/* Changed outer background to gray-950 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 shadow-lg shrink-0 md:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          {" "}
          {/* Changed gradient */}
          CodeSpark
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            aria-label="Run Code"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {" "}
            {/* Changed gradient */}
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
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-50 shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 bg-transparent"
              >
                <MenuIcon className="w-4 h-4 mr-2" /> Snippets
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-l border-gray-700/50 text-gray-50 flex flex-col">
              {" "}
              {/* Kept as gray-900 (slate) */}
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                  {" "}
                  {/* Changed gradient */}
                  My Snippets
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handleSaveAs}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md"
                >
                  {" "}
                  {/* Changed gradient */}
                  <FilePlusIcon className="w-4 h-4 mr-2" /> Save As New
                </Button>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-50 shadow-md bg-transparent"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" /> Export All
                </Button>
              </div>
              <Separator className="my-4 bg-gray-700/50" />
              <ScrollArea className="flex-1 pr-4">
                <div className="grid gap-2">
                  {snippets.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No snippets saved yet.</p>
                  ) : (
                    snippets.map((snippet) => (
                      <Card
                        key={snippet.id}
                        className={`bg-gray-800 border ${
                          currentSnippetId === snippet.id ? "border-blue-500" : "border-gray-700"
                        } hover:border-blue-500/50 transition-colors cursor-pointer`}
                      >
                        {" "}
                        {/* Changed snippet card background to gray-800, border to blue-500 */}
                        <CardContent className="p-3 flex items-center justify-between gap-2">
                          <div
                            onClick={() => {
                              loadSnippet(snippet.id)
                              setIsSheetOpen(false)
                            }}
                            className="flex-1"
                          >
                            <p className="font-semibold text-gray-100 truncate">{snippet.name}</p>
                            <p className="text-xs text-gray-400">{new Date(snippet.createdAt).toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(snippet.id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label={`Delete snippet ${snippet.name}`}
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-xl shadow-2xl bg-gray-900 border border-gray-700/50">
          {" "}
          {/* Kept as gray-900 (slate) */}
          {/* Desktop View: Split Panels */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col rounded-none border-none shadow-none bg-transparent">
              <CardHeader className="pb-2 border-b border-gray-700/50">
                <CardTitle className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <CodeIcon className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500" />{" "}
                  {/* Changed gradient */}
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
                  <TerminalIcon className="w-5 h-5 text-blue-400" /> Output Console{" "}
                  {/* Changed icon color to blue-400 */}
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
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-gray-700/50 bg-gray-900">
                {" "}
                {/* Kept as gray-900 (slate) */}
                <TabsTrigger
                  value="code"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-50 data-[state=active]:shadow-inner"
                >
                  {" "}
                  {/* Changed active background to gray-800 */}
                  <CodeIcon className="w-4 h-4 mr-2" /> Code
                </TabsTrigger>
                <TabsTrigger
                  value="output"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-50 data-[state=active]:shadow-inner"
                >
                  {" "}
                  {/* Changed active background to gray-800 */}
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
      {/* Save As Dialog */}
      <AlertDialog open={isSaveAsDialogOpen} onOpenChange={setIsSaveAsDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border border-gray-700 text-gray-50">
          {" "}
          {/* Changed background to gray-800 */}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              {" "}
              {/* Changed gradient */}
              Save Snippet As
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Enter a name for your new code snippet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="My Awesome Snippet"
            value={newSnippetName}
            onChange={(e) => setNewSnippetName(e.target.value)}
            className="bg-gray-700 border-gray-700 text-gray-50 focus-visible:ring-blue-500"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSaveAs}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {" "}
              {/* Changed gradient */}
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border border-gray-700 text-gray-50">
          {" "}
          {/* Changed background to gray-800 */}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this snippet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
