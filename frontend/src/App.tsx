import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useConversion } from './hooks/useConversion';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { SplitView } from './components/SplitView';
import { TokenCounter } from './components/TokenCounter';
import { ExportBar } from './components/ExportBar';
import { ZipExplorer } from './components/ZipExplorer';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { ZipEntry } from './types';

import './index.css';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { result, loading, error, convertFile, convertUrl, reset } = useConversion();
  const [markdown, setMarkdown] = useState('');
  const [activeFilename, setActiveFilename] = useState('');

  // Update local markdown state when result changes
  const handleResult = result;
  if (handleResult && markdown === '' && handleResult.markdown) {
    setMarkdown(handleResult.markdown);
    setActiveFilename(handleResult.filename);
  }

  const handleConvertFile = async (file: File) => {
    setMarkdown('');
    setActiveFilename('');
    await convertFile(file);
  };

  const handleConvertUrl = async (url: string) => {
    setMarkdown('');
    setActiveFilename('');
    await convertUrl(url);
  };

  const handleReset = () => {
    reset();
    setMarkdown('');
    setActiveFilename('');
  };

  const handleSelectZipEntry = (entry: ZipEntry) => {
    setMarkdown(entry.markdown);
    setActiveFilename(entry.path);
  };

  const handleViewAllZip = () => {
    if (result) {
      setMarkdown(result.markdown);
      setActiveFilename(result.filename);
    }
  };

  const showResult = result && !loading;

  return (
    <div className="h-screen flex flex-col">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col mt-14 min-h-0">
        {!showResult ? (
          /* Dropzone view */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <Dropzone
                onConvertFile={handleConvertFile}
                onConvertUrl={handleConvertUrl}
                loading={loading}
              />

              {error && (
                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Conversion failed</p>
                    <p className="text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Result view */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Back button */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] border border-transparent hover:border-[var(--color-border)] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                New Conversion
              </button>
              {result.title && (
                <span className="text-xs text-[var(--color-text-muted)] truncate">
                  {result.title}
                </span>
              )}
            </div>

            {/* Main content area */}
            <div className="flex-1 flex min-h-0">
              {/* ZIP sidebar */}
              {result.is_zip && result.zip_entries && (
                <ZipExplorer
                  entries={result.zip_entries}
                  onSelectEntry={handleSelectZipEntry}
                  onViewAll={handleViewAllZip}
                />
              )}

              {/* Editor + Preview */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
                  <SplitView
                    markdown={markdown}
                    onMarkdownChange={setMarkdown}
                    filename={activeFilename}
                  />
                </div>
                <ExportBar markdown={markdown} filename={activeFilename} />
                <TokenCounter result={result} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
