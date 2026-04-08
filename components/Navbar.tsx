'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'About', href: '/#about' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Contact', href: '/#contact' },
  { label: 'About me', href: '/personal' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? 'nav-blur border-b border-border' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          className="font-display font-bold text-lg text-foreground hover:text-accent transition-colors duration-200 tracking-tight"
          style={{ fontVariationSettings: "'opsz' 20, 'wght' 700, 'SOFT' 10" }}
        >
          AH
        </a>

        <div className="flex items-center gap-1">
          {/* Desktop nav links */}
          <ul className="hidden sm:flex items-center gap-0.5 mr-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-surface"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block w-px h-4 bg-border mx-1" />
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="sm:hidden ml-1 p-2 text-muted hover:text-foreground transition-colors duration-200"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border">
          <ul className="max-w-5xl mx-auto px-6 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-muted hover:text-foreground rounded-lg hover:bg-surface transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
