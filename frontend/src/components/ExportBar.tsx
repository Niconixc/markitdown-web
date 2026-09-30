import { useState } from 'react';
import { Copy, Download, FileText, Code, Check } from 'lucide-react';

interface ExportBarProps {
  markdown: string;
  filename: string;
}

export function ExportBar({ markdown, filename }: ExportBarProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const showCopied = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    showCopied('md');
  };

  const copyAsPrompt = async () => {
    const wrapped = `<document name="${filename}">\n${markdown}\n</document>`;
    await navigator.clipboard.writeText(wrapped);
    showCopied('prompt');
  };

  const downloadFile = (content: string, name: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMd = () => {
    const stem = filename.replace(/\.[^.]+$/, '');
    downloadFile(markdown, `${stem}.md`, 'text/markdown');
  };

  const downloadHtml = () => {
    const stem = filename.replace(/\.[^.]+$/, '');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; color: #666; }
  </style>
</head>
<body>
  <pre>${markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
    downloadFile(html, `${stem}.html`, 'text/html');
  };

  const buttons = [
    {
      key: 'md',
      icon: copied === 'md' ? Check : Copy,
      label: copied === 'md' ? 'Copied!' : 'Copy Markdown',
      onClick: copyMarkdown,
    },
    {
      key: 'prompt',
      icon: copied === 'prompt' ? Check : Code,
      label: copied === 'prompt' ? 'Copied!' : 'Copy as LLM Prompt',
      onClick: copyAsPrompt,
    },
    {
      key: 'dl-md',
      icon: Download,
      label: 'Download .md',
      onClick: downloadMd,
    },
    {
      key: 'dl-html',
      icon: FileText,
      label: 'Download .html',
      onClick: downloadHtml,
    },
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {buttons.map(({ key, icon: Icon, label, onClick }) => (
        <button
          key={key}
          onClick={onClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] border border-transparent hover:border-[var(--color-border)] transition-all"
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
