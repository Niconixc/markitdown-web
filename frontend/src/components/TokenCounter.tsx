import { Hash, Type, Clock, Zap } from 'lucide-react';
import type { ConversionResult } from '../types';

interface TokenCounterProps {
  result: ConversionResult;
}

export function TokenCounter({ result }: TokenCounterProps) {
  const stats = [
    { icon: Hash, label: 'Chars', value: result.chars.toLocaleString() },
    { icon: Type, label: 'Words', value: result.words.toLocaleString() },
    {
      icon: Zap,
      label: 'GPT-4o tokens',
      value: `~${result.estimated_tokens.cl100k_base.toLocaleString()}`,
    },
    {
      icon: Zap,
      label: 'Claude tokens',
      value: `~${result.estimated_tokens.claude.toLocaleString()}`,
    },
    {
      icon: Clock,
      label: 'Time',
      value: `${result.time_elapsed.toFixed(2)}s`,
    },
  ];

  const totalTokens = result.estimated_tokens.cl100k_base;
  const isOverLimit = totalTokens > 128000;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 border-t text-xs ${
        isOverLimit
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
      }`}
    >
      <div className="flex items-center gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <Icon className="w-3 h-3" />
            <span>
              {label}: <span className="text-[var(--color-text)] font-medium">{value}</span>
            </span>
          </div>
        ))}
      </div>
      {isOverLimit && (
        <span className="text-amber-400 font-medium flex items-center gap-1">
          ⚠ Exceeds 128k token context
        </span>
      )}
    </div>
  );
}
