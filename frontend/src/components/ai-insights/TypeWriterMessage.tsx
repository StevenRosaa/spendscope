import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TypewriterMessageProps {
  content: string;
  isStreaming?: boolean;
}

export default function TypewriterMessage({ content, isStreaming = false }: TypewriterMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    setDisplayedContent('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedContent((prev) => {
        // Aggiungiamo i caratteri a blocchi casuali per simulare una generazione reale
        const nextChars = content.substring(0, i + Math.floor(Math.random() * 3) + 1);
        return nextChars;
      });
      i += 3;
      if (i >= content.length) clearInterval(intervalId);
    }, 15); // Velocità del typing

    return () => clearInterval(intervalId);
  }, [content, isStreaming]);

  // Stili Markdown Condivisi
  const markdownComponents = {
    p: ({node, ...props}: any) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-violet-600 dark:text-violet-400" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
    code: ({node, inline, ...props}: any) => inline 
      ? <code className="bg-slate-200 dark:bg-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-pink-500" {...props} />
      : <div className="bg-slate-800 dark:bg-slate-950 rounded-xl p-4 mb-3 overflow-x-auto"><code className="text-xs font-mono text-slate-300" {...props} /></div>,
    table: ({node, ...props}: any) => <div className="overflow-x-auto mb-3 rounded-xl border border-slate-200 dark:border-slate-700"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} /></div>,
    th: ({node, ...props}: any) => <th className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" {...props} />,
    td: ({node, ...props}: any) => <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700" {...props} />
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {displayedContent + (isStreaming && displayedContent.length < content.length ? '...' : '')}
    </ReactMarkdown>
  );
}