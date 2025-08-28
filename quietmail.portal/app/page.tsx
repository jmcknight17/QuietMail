import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, BarChart3, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">QuietMail</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Understand Your Email Patterns
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Get deep insights into your Gmail inbox. Analyze sender patterns, track email engagement, and take control
            of your digital communication.
          </p>

          <div className="mb-12">
            <a href="http://localhost:5022/auth/google">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Mail className="mr-2 h-5 w-5" />
                Log into Gmail
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Powerful Email Analytics</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Sender Analysis</CardTitle>
                <CardDescription className="text-muted-foreground">
                  See who sends you the most emails and track engagement patterns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Quick Insights</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get instant analysis of your inbox with our fast scanning technology
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Privacy First</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your email data stays secure with read-only access and no storage
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">Built with privacy and simplicity in mind. Your email analysis tool.</p>
        </div>
      </footer>
    </div>
  )
}
