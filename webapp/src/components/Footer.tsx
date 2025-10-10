import { Github, ExternalLink, Shield, BookOpen, Activity } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-card/30 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary" />
              <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dark Signal AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced AI-powered dark matter particle classification system for cutting-edge physics research.
            </p>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="text-xs">
                API Status: Online
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Quick Links</h3>
            <nav className="space-y-2">
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Getting Started
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Particle Physics Guide
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Classification Tutorial
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                API Reference
              </Button>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Resources</h3>
            <nav className="space-y-2">
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                <BookOpen className="h-3 w-3 mr-2" />
                Documentation
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                <Github className="h-3 w-3 mr-2" />
                GitHub Repository
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Research Papers
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Community Forum
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </nav>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Legal & Support</h3>
            <nav className="space-y-2">
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                <Shield className="h-3 w-3 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Terms of Service
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Cookie Policy
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start">
                Contact Support
              </Button>
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Dark Signal AI. Built for the future of particle physics.
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Made with ❤️ for science</span>
            <span>•</span>
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}