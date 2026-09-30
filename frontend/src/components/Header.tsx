import { Sun, Moon, FileText, ExternalLink } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <FileText className="w-4.5 h-4.5 text-indigo-500" />
        </div>
        <h1 className="text-base font-semibold tracking-tight">MarkItDown</h1>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium uppercase tracking-wider">
          v0.1.8
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <a
          href="https://github.com/microsoft/markitdown"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          title="View on GitHub"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
