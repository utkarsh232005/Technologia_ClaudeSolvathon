import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Home,
  Beaker,
  BarChart,
  Settings,
  HelpCircle,
  FileText,
  Zap
} from 'lucide-react'

interface Command {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  action: () => void
  keywords: string[]
  category: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const commands: Command[] = [
    {
      id: 'home',
      title: 'Go to Home',
      subtitle: 'Dashboard overview',
      icon: Home,
      action: () => { navigate('/'); onOpenChange(false) },
      keywords: ['home', 'dashboard', 'overview'],
      category: 'Navigation'
    },
    {
      id: 'classifier', 
      title: 'Event Classifier',
      subtitle: 'Classify particle events',
      icon: Zap,
      action: () => { navigate('/classifier'); onOpenChange(false) },
      keywords: ['classify', 'event', 'particle', 'detection'],
      category: 'Navigation'
    },
    {
      id: 'results',
      title: 'Results Dashboard', 
      subtitle: 'View analysis results',
      icon: BarChart,
      action: () => { navigate('/results'); onOpenChange(false) },
      keywords: ['results', 'dashboard', 'analysis', 'charts'],
      category: 'Navigation'
    },
    {
      id: 'data-generator',
      title: 'Data Generator',
      subtitle: 'Generate synthetic data',
      icon: Beaker,
      action: () => { navigate('/data-generator'); onOpenChange(false) },
      keywords: ['data', 'generate', 'synthetic', 'dataset'],
      category: 'Navigation'
    },
    {
      id: 'reports',
      title: 'Report Generator',
      subtitle: 'Generate analysis reports',
      icon: FileText,
      action: () => { navigate('/reports'); onOpenChange(false) },
      keywords: ['report', 'generate', 'export', 'pdf'],
      category: 'Navigation'
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure application',
      icon: Settings,
      action: () => { navigate('/settings'); onOpenChange(false) },
      keywords: ['settings', 'config', 'preferences'],
      category: 'Navigation'
    },
    {
      id: 'help',
      title: 'Help & Documentation',
      subtitle: 'Get help and learn',
      icon: HelpCircle,
      action: () => { navigate('/help'); onOpenChange(false) },
      keywords: ['help', 'documentation', 'support', 'guide'],
      category: 'Navigation'
    }
  ]

  const filteredCommands = commands.filter(command => {
    const searchLower = search.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.subtitle?.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    )
  })

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, Command[]>)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto px-6 pb-6">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </div>
              <div className="space-y-1">
                {commands.map((command) => {
                  const Icon = command.icon
                  return (
                    <button
                      key={command.id}
                      onClick={command.action}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left focus-ring"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{command.title}</div>
                        {command.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {command.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="px-2 py-8 text-center text-muted-foreground">
              No commands found for "{search}"
            </div>
          )}
        </div>
        
        <div className="border-t px-6 py-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Navigate with ↑ ↓ keys</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-1.5 py-0.5 text-xs">Ctrl</Badge>
              <Badge variant="outline" className="px-1.5 py-0.5 text-xs">K</Badge>
              <span>to open</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}