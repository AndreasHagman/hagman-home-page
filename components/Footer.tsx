import { Github, Linkedin } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      id="contact"
      className="border-t border-border py-10"
    >
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-mono text-muted">
          © {year} Andreas Hagman
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/AndreasHagman"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent transition-colors duration-200"
          >
            <Github size={17} strokeWidth={1.75} />
          </a>
          <a
            href="https://www.linkedin.com/in/andreas-hagman-4a4182224/"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent transition-colors duration-200"
          >
            <Linkedin size={17} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  )
}
