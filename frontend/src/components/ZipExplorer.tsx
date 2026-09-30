import {
  Folder,
  FileText,
  FileSpreadsheet,
  Image,
  Music,
  File,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  List,
} from 'lucide-react';
import type { ZipEntry } from '../types';

interface ZipExplorerProps {
  entries: ZipEntry[];
  onSelectEntry: (entry: ZipEntry) => void;
  onViewAll: () => void;
}

function getFileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return { icon: FileText, color: 'text-red-400' };
  if (['doc', 'docx'].includes(ext)) return { icon: FileText, color: 'text-blue-400' };
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { icon: FileSpreadsheet, color: 'text-green-400' };
  if (['ppt', 'pptx'].includes(ext)) return { icon: FileText, color: 'text-orange-400' };
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return { icon: Image, color: 'text-purple-400' };
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return { icon: Music, color: 'text-pink-400' };
  return { icon: File, color: 'text-[var(--color-text-muted)]' };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'converted':
      return { icon: CheckCircle2, color: 'text-green-400', label: 'Converted' };
    case 'skipped':
      return { icon: AlertTriangle, color: 'text-yellow-400', label: 'Skipped' };
    case 'error':
      return { icon: XCircle, color: 'text-red-400', label: 'Error' };
    default:
      return { icon: File, color: 'text-[var(--color-text-muted)]', label: status };
  }
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  entry?: ZipEntry;
}

function buildTree(entries: ZipEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;

      let existing = current.find((n) => n.name === name && n.isFolder === !isLast);
      if (!existing) {
        existing = {
          name,
          path: parts.slice(0, i + 1).join('/'),
          isFolder: !isLast,
          children: [],
          entry: isLast ? entry : undefined,
        };
        current.push(existing);
      }
      current = existing.children;
    }
  }

  return root;
}

function TreeItem({
  node,
  depth,
  onSelectEntry,
}: {
  node: TreeNode;
  depth: number;
  onSelectEntry: (entry: ZipEntry) => void;
}) {
  const paddingLeft = depth * 16 + 8;

  if (node.isFolder) {
    return (
      <>
        <div
          className="flex items-center gap-2 py-1.5 px-2 text-xs text-[var(--color-text-muted)]"
          style={{ paddingLeft }}
        >
          <Folder className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">{node.name}</span>
        </div>
        {node.children.map((child) => (
          <TreeItem key={child.path} node={child} depth={depth + 1} onSelectEntry={onSelectEntry} />
        ))}
      </>
    );
  }

  const { icon: FileIcon, color: fileColor } = getFileIcon(node.name);
  const status = node.entry ? getStatusBadge(node.entry.status) : null;

  return (
    <button
      onClick={() => node.entry && onSelectEntry(node.entry)}
      className="w-full flex items-center gap-2 py-1.5 px-2 text-xs hover:bg-[var(--color-surface)] rounded-md transition-colors"
      style={{ paddingLeft }}
    >
      <FileIcon className={`w-3.5 h-3.5 ${fileColor} shrink-0`} />
      <span className="text-[var(--color-text)] truncate flex-1 text-left">{node.name}</span>
      {status && <status.icon className={`w-3 h-3 ${status.color} shrink-0`} />}
    </button>
  );
}

export function ZipExplorer({ entries, onSelectEntry, onViewAll }: ZipExplorerProps) {
  const tree = buildTree(entries);
  const convertedCount = entries.filter((e) => e.status === 'converted').length;
  const errorCount = entries.filter((e) => e.status === 'error').length;

  return (
    <div className="flex flex-col h-full border-r border-[var(--color-border)] bg-[var(--color-bg)] w-64 shrink-0">
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            ZIP Contents
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {entries.length} files
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <span className="text-green-400">✓ {convertedCount}</span>
          {errorCount > 0 && <span className="text-red-400">✗ {errorCount}</span>}
        </div>
      </div>

      <button
        onClick={onViewAll}
        className="flex items-center gap-2 m-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
      >
        <List className="w-3.5 h-3.5" />
        View All Combined
      </button>

      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeItem key={node.path} node={node} depth={0} onSelectEntry={onSelectEntry} />
        ))}
      </div>
    </div>
  );
}
