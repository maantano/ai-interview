"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertTriangle, RefreshCw, Home, ChevronDown, Bug } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props)
    this.state = { hasError: false }
  }

  private getErrorType(error?: Error): string {
    if (!error) return "Unknown Error"
    
    if (error.message.includes("ChunkLoadError") || error.message.includes("Loading chunk")) {
      return "Network Error"
    }
    if (error.message.includes("localStorage") || error.message.includes("sessionStorage")) {
      return "Storage Error"
    }
    if (error.message.includes("Cannot read properties") || error.message.includes("undefined")) {
      return "Data Error"
    }
    return "Application Error"
  }

  private getErrorSolution(error?: Error): string {
    if (!error) return "페이지를 새로고침해주세요."
    
    if (error.message.includes("ChunkLoadError") || error.message.includes("Loading chunk")) {
      return "네트워크 연결을 확인하고 페이지를 새로고침해주세요."
    }
    if (error.message.includes("localStorage") || error.message.includes("sessionStorage")) {
      return "브라우저 저장소를 확인하고 쿠키를 허용해주세요."
    }
    if (error.message.includes("Cannot read properties") || error.message.includes("undefined")) {
      return "일시적인 데이터 오류입니다. 처음부터 다시 시작해주세요."
    }
    return "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleGoHome = () => {
    // Clear any stored session data that might be corrupted
    localStorage.removeItem('current-session')
    window.location.href = '/'
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ [DEBUG] Error caught by boundary:", error, errorInfo)
    console.error("❌ [DEBUG] Error message:", error.message)
    console.error("❌ [DEBUG] Error stack:", error.stack)
    console.error("❌ [DEBUG] Component stack:", errorInfo.componentStack)
    
    // Store error info for debugging
    this.setState({ errorInfo })
    
    // Report to error monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      // This is where you'd send to Sentry, LogRocket, etc.
      console.error("Production error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }
  }

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType(this.state.error)
      const errorSolution = this.getErrorSolution(this.state.error)
      const isNetworkError = errorType === "Network Error"
      const isStorageError = errorType === "Storage Error"

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">문제가 발생했습니다</CardTitle>
              <p className="text-sm text-muted-foreground">{errorType}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">{errorSolution}</p>
              
              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-3">
                {isNetworkError || isStorageError ? (
                  <Button onClick={() => window.location.reload()} className="w-full flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    페이지 새로고침
                  </Button>
                ) : (
                  <>
                    <Button onClick={this.handleRetry} className="w-full flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      다시 시도
                    </Button>
                    <Button onClick={this.handleGoHome} variant="outline" className="w-full flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      처음으로 돌아가기
                    </Button>
                  </>
                )}
              </div>

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex items-center gap-2 text-xs">
                      <Bug className="w-3 h-3" />
                      개발자 정보 보기
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
                      <div className="space-y-2">
                        <div>
                          <strong>Error:</strong> {this.state.error.message}
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap mt-1 text-xs">
                              {this.state.error.stack.slice(0, 500)}
                              {this.state.error.stack.length > 500 ? '...' : ''}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
