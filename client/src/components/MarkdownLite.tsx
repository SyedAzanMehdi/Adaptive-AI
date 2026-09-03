import type { ReactNode } from "react";

/** Minimal markdown renderer for lesson content: headings, code fences,
 *  bullets, blockquotes, bold. Keeps lessons readable without a heavy dep. */
export default function MarkdownLite({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let key = 0;

  const renderInline = (text: string, k: number) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <span key={k}>
        {parts.map((p, idx) => {
          if (p.startsWith("**") && p.endsWith("**")) return <strong key={idx}>{p.slice(2, -2)}</strong>;
          if (p.startsWith("`") && p.endsWith("`"))
            return (
              <code key={idx} className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-sm font-mono">
                {p.slice(1, -1)}
              </code>
            );
          return p;
        })}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={key++} className="bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg p-4 overflow-x-auto text-sm my-3">
          <code>{code.join("\n")}</code>
        </pre>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(<h1 key={key++} className="text-2xl font-bold text-black dark:text-white my-3">{renderInline(line.slice(2), key)}</h1>);
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++} className="text-xl font-semibold text-black dark:text-white my-3">{renderInline(line.slice(3), key)}</h2>);
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-neutral-400 dark:border-neutral-600 pl-3 text-neutral-600 dark:text-neutral-400 italic my-3">
          {renderInline(line.slice(2), key)}
        </blockquote>
      );
    } else if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-3 space-y-1">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, idx)}</li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-6 my-3 space-y-1">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, idx)}</li>
          ))}
        </ol>
      );
      continue;
    } else if (line.trim() !== "") {
      blocks.push(<p key={key++} className="my-2 text-neutral-700 dark:text-neutral-300 leading-relaxed">{renderInline(line, key)}</p>);
    }
    i++;
  }

  return <div>{blocks}</div>;
}
