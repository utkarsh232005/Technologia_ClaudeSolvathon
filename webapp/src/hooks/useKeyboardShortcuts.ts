import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const shortcut = shortcuts.find(s => {
      const ctrlMatch = s.ctrl ? event.ctrlKey : !event.ctrlKey
      const altMatch = s.alt ? event.altKey : !event.altKey
      const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey
      const keyMatch = event.key.toLowerCase() === s.key.toLowerCase()
      
      return ctrlMatch && altMatch && shiftMatch && keyMatch
    })

    if (shortcut) {
      event.preventDefault()
      shortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Global keyboard shortcuts hook
export const useGlobalShortcuts = () => {
  const navigate = useNavigate()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrl: true,
      action: () => {
        // TODO: Open command palette
        console.log('Command palette opened')
      },
      description: 'Open command palette'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals/dialogs
        const event = new CustomEvent('close-modals')
        document.dispatchEvent(event)
      },
      description: 'Close modals'
    },
    {
      key: '1',
      ctrl: true,
      action: () => navigate('/'),
      description: 'Go to Home'
    },
    {
      key: '2', 
      ctrl: true,
      action: () => navigate('/classifier'),
      description: 'Go to Classifier'
    },
    {
      key: '3',
      ctrl: true, 
      action: () => navigate('/results'),
      description: 'Go to Results'
    },
    {
      key: '4',
      ctrl: true,
      action: () => navigate('/settings'),
      description: 'Go to Settings'
    },
    {
      key: '?',
      shift: true,
      action: () => navigate('/help'),
      description: 'Open Help'
    }
  ]

  useKeyboardShortcuts(shortcuts)
  
  return shortcuts
}