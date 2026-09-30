import { useState } from 'react';
import { Columns, Code, Eye } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';

type ViewMode = 'split' | 'editor' | 'preview';

interface SplitViewProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  filename: string;
}

export function SplitView({ markdown, onMarkdownChange, filename }: SplitViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const viewModes: { mode: ViewMode; icon: typeof Columns; label: string }[] = [
    { mode: 'split', icon: Columns, label: 'Split' },
    { mode: 'editor', icon: Code, label: 'Editor' },
    { mode: 'preview', icon: Eye, label: 'Preview' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">{filename}</span>
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Editor panel */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`flex flex-col min-h-0 ${
              viewMode === 'split' ? 'w-1/2 border-r border-[var(--color-border)]' : 'w-full'
            }`}
          >
            <textarea
              value={markdown}
              onChange={(e) => onMarkdownChange(e.target.value)}
              className="editor-textarea flex-1 w-full p-4 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none overflow-auto"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview panel */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`min-h-0 overflow-auto ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <MarkdownPreview markdown={markdown} />
          </div>
        )}
      </div>
    </div>
  );
}
