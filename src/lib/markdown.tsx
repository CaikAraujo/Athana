import type { ReactNode } from 'react';

/**
 * Minimal, safe Markdown renderer (headings, lists, blockquotes, bold, italic, links).
 * It builds React nodes — never raw HTML — so stored content cannot inject markup or scripts.
 */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${key}-${i++}`}>{m[1]}</strong>);
    else if (m[2]) out.push(<em key={`${key}-${i++}`}>{m[2]}</em>);
    else if (/^(https?:\/\/|mailto:|\/)/.test(m[4])) out.push(<a key={`${key}-${i++}`} href={m[4]} {...(m[4].startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {})}>{m[3]}</a>);
    else out.push(m[3]);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, vars }: { source: string; vars?: Record<string, string | number> }) {
  const text = vars ? source.replace(/\{\{(\w+)\}\}/g, (all, k) => (k in vars ? String(vars[k]) : all)) : source;
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  return (
    <div className="prose-athana">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim() !== '');
        if (!lines.length) return null;
        const k = `b${bi}`;
        if (lines[0].startsWith('### ')) return <h3 key={k}>{inline(lines[0].slice(4), k)}</h3>;
        if (lines[0].startsWith('## ')) return <h2 key={k}>{inline(lines[0].slice(3), k)}</h2>;
        if (lines.every((l) => /^[-*] /.test(l))) return <ul key={k}>{lines.map((l, i) => <li key={i}>{inline(l.slice(2), `${k}-${i}`)}</li>)}</ul>;
        if (lines.every((l) => /^\d+\. /.test(l))) return <ol key={k}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+\. /, ''), `${k}-${i}`)}</li>)}</ol>;
        if (lines.every((l) => l.startsWith('> '))) return <blockquote key={k} className="alert alert-warn my-4">{inline(lines.map((l) => l.slice(2)).join(' '), k)}</blockquote>;
        return <p key={k}>{lines.flatMap((l, i) => [...(i ? [<br key={`br${i}`} />] : []), ...inline(l, `${k}-${i}`)])}</p>;
      })}
    </div>
  );
}
