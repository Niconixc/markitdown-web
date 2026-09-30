import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Globe,
  FileText,
  FileSpreadsheet,
  Image,
  Music,
  Archive,
  Film,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface DropzoneProps {
  onConvertFile: (file: File) => void;
  onConvertUrl: (url: string) => void;
  loading: boolean;
}

const SUPPORTED_FORMATS = [
  { label: 'PDF', icon: FileText, color: 'text-red-400' },
  { label: 'DOCX', icon: FileText, color: 'text-blue-400' },
  { label: 'PPTX', icon: FileText, color: 'text-orange-400' },
  { label: 'XLSX', icon: FileSpreadsheet, color: 'text-green-400' },
  { label: 'Images', icon: Image, color: 'text-purple-400' },
  { label: 'Audio', icon: Music, color: 'text-pink-400' },
  { label: 'Video', icon: Film, color: 'text-cyan-400' },
  { label: 'ZIP', icon: Archive, color: 'text-yellow-400' },
];

export function Dropzone({ onConvertFile, onConvertUrl, loading }: DropzoneProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onConvertFile(acceptedFiles[0]);
      }
    },
    [onConvertFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: loading,
  });

  const handleUrlSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) {
      onConvertUrl(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Convert anything to Markdown
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm">
          Drop a file or paste a URL — get clean, structured Markdown instantly.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-4 w-fit mx-auto">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'file'
              ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'url'
              ? 'bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          From URL
        </button>
      </div>

      {activeTab === 'file' ? (
        <div
          {...getRootProps()}
          className={`relative group rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-500/5 scale-[1.02]'
              : 'border-[var(--color-border)] hover:border-indigo-500/50 hover:bg-[var(--color-surface)]'
          } ${loading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm text-[var(--color-text-muted)]">Converting...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Upload className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isDragActive ? 'Drop your file here...' : 'Drag & drop a file here'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  or click to browse • up to 500 MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://en.wikipedia.org/wiki/Markdown"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-[var(--color-text-muted)]"
              disabled={loading}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Convert
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            Works with web pages, Wikipedia articles, YouTube videos, and more.
          </p>
        </div>
      )}

      {/* Supported formats */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        {SUPPORTED_FORMATS.map((fmt) => (
          <div
            key={fmt.label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]"
          >
            <fmt.icon className={`w-3 h-3 ${fmt.color}`} />
            {fmt.label}
          </div>
        ))}
      </div>
    </div>
  );
}
