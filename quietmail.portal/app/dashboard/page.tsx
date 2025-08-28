"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Mail, BarChart3 } from "lucide-react"
import { startScan } from "@/lib/scanService"

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [emailCount, setEmailCount] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState([])
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const accessTokenFromUrl = searchParams.get("accessToken")
    const emailCountFromUrl = searchParams.get("emailCount")

    if (accessTokenFromUrl && emailCountFromUrl) {
      localStorage.setItem("accessToken", accessTokenFromUrl)
      localStorage.setItem("emailCount", emailCountFromUrl)
      router.replace("/dashboard", { scroll: false })
    }

    const token = localStorage.getItem("accessToken")
    const count = localStorage.getItem("emailCount")

    if (token && count) {
      setIsAuthenticated(true)
      setEmailCount(count)
    } else {
      router.push("/")
    }
  }, [router, searchParams])

  const handleStartScan = () => {
    setIsScanning(true)
    setProgress(0)
    setError("")
    setScanResults([])
    setSelectedRows(new Set())
    const token = localStorage.getItem("accessToken")

    startScan(
      token,
      (progressUpdate) => setProgress(progressUpdate),
      (results) => {
        setScanResults(results)
        setIsScanning(false)
      },
      (errorMessage) => {
        setError(errorMessage)
        setIsScanning(false)
      },
    )
  }

  const handleRowSelect = (sender, isSelected) => {
    const newSelected = new Set(selectedRows)
    if (isSelected) {
      newSelected.add(sender)
    } else {
      newSelected.delete(sender)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRows(new Set(scanResults.map((result) => result.sender)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem("accessToken")
      const sendersToDelete = Array.from(selectedRows)

      for (const sender of sendersToDelete) {
        await fetch("/api/delete-emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sender }),
        })
      }

      setScanResults((prev) => prev.filter((result) => !selectedRows.has(result.sender)))
      setSelectedRows(new Set())
    } catch (error) {
      setError("Failed to delete emails")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleIndividualDelete = async (sender) => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("accessToken")

      await fetch("/api/delete-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sender }),
      })

      setScanResults((prev) => prev.filter((result) => result.sender !== sender))
      setSelectedRows((prev) => {
        const newSelected = new Set(prev)
        newSelected.delete(sender)
        return newSelected
      })
    } catch (error) {
      setError("Failed to delete emails")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">EmailAnalyzer Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <Card className="mb-8 border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-foreground">Welcome to Your Dashboard</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your inbox contains <span className="font-semibold text-foreground">{emailCount || "..."}</span> total
                  emails
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Email Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">
              Perform a comprehensive scan of your inbox to analyze sender patterns and email engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Button
                onClick={handleStartScan}
                disabled={isScanning || isDeleting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isScanning ? "Analyzing..." : "Start Email Analysis"}
              </Button>
            </div>

            {isScanning && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Analyzing your emails...</p>
                  <span className="text-sm font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">Error: {error}</p>
              </div>
            )}

            {scanResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedRows.size === scanResults.length && scanResults.length > 0}
                        onCheckedChange={handleSelectAll}
                        disabled={isDeleting}
                      />
                      <label htmlFor="select-all" className="text-sm text-muted-foreground">
                        Select all ({scanResults.length})
                      </label>
                    </div>
                    {selectedRows.size > 0 && (
                      <span className="text-sm text-foreground">{selectedRows.size} selected</span>
                    )}
                  </div>

                  {selectedRows.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedRows.size})
                    </Button>
                  )}
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">
                          <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead className="text-foreground font-semibold">Sender</TableHead>
                        <TableHead className="text-foreground font-semibold">Total Emails</TableHead>
                        <TableHead className="text-foreground font-semibold">Opened Emails</TableHead>
                        <TableHead className="text-foreground font-semibold w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanResults.map((result, index) => (
                        <TableRow
                          key={result.sender}
                          className={`${index % 2 === 0 ? "bg-card" : "bg-muted/20"} hover:bg-accent/50 transition-colors`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.has(result.sender)}
                              onCheckedChange={(checked) => handleRowSelect(result.sender, checked)}
                              disabled={isDeleting}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{result.sender}</TableCell>
                          <TableCell className="text-muted-foreground">{result.totalEmails}</TableCell>
                          <TableCell className="text-muted-foreground">{result.openedEmails}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleIndividualDelete(result.sender)}
                              disabled={isDeleting}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete emails from {result.sender}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {scanResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No email data to display</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
