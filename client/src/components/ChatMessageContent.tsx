import { useState } from "react";
import { Check, Copy } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p.length > 0);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code key={i} className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[0.85em] font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function TextBlock({ text }: { text: string }) {
  const lines = text.replace(/^\n+|\n+$/g, "").split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 pl-0.5">
              <span className="mt-[9px] w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
              <span>
                <InlineText text={trimmed.replace(/^[-*]\s+/, "")} />
              </span>
            </div>
          );
        }
        const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (numbered) {
          return (
            <div key={i} className="flex gap-2 pl-0.5">
              <span className="font-semibold shrink-0 opacity-70">{numbered[1]}.</span>
              <span>
                <InlineText text={numbered[2]} />
              </span>
            </div>
          );
        }
        if (trimmed === "") return <div key={i} className="h-1" />;
        return (
          <p key={i}>
            <InlineText text={line} />
          </p>
        );
      })}
    </div>
  );
}

/** Lightweight Markdown-ish renderer: fenced code blocks (with copy button),
 * inline `code` and **bold**, and basic bullet/numbered lists — enough for
 * how an AI mentor actually writes, without pulling in a full MD pipeline. */
export function ChatMessageContent({ content }: { content: string }) {
  const fenceRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const segments: { type: "text" | "code"; lang?: string; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) segments.push({ type: "text", content: content.slice(lastIndex, match.index) });
    segments.push({ type: "code", lang: match[1], content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) segments.push({ type: "text", content: content.slice(lastIndex) });

  return (
    <div className="space-y-2.5">
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          <div key={i} className="rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{seg.lang || "code"}</span>
              <CopyButton text={seg.content} />
            </div>
            <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed bg-neutral-950 text-neutral-100">
              <code>{seg.content}</code>
            </pre>
          </div>
        ) : (
          seg.content.trim() && <TextBlock key={i} text={seg.content} />
        )
      )}
    </div>
  );
}
