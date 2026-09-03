import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";
import { prefersReducedMotion } from "../../lib/anim";

const reduce = prefersReducedMotion();

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  domain: string | null;
  createdAt: string;
}

const SUGGESTIONS = [
  "Explain recursion with a real analogy",
  "What is Big O notation?",
  "How do I debug an infinite loop?",
  "Stack vs Queue memory allocation",
  "How does this platform adapt lessons?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-neutral-300 inline-block"
          animate={reduce ? {} : { y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["chat-history"],
    queryFn: async () => (await api.get<{ messages: ChatMsg[] }>("/chat/history")).data,
  });

  const send = useMutation({
    mutationFn: async (message: string) =>
      (await api.post("/chat", { message })).data as {
        userMessage: ChatMsg;
        reply: ChatMsg;
        source?: "ai" | "knowledge";
        degraded?: boolean;
      },
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: ["chat-history"] });
      const prev = queryClient.getQueryData<{ messages: ChatMsg[] }>(["chat-history"]);
      queryClient.setQueryData<{ messages: ChatMsg[] }>(["chat-history"], (old) => ({
        messages: [
          ...(old?.messages ?? []),
          { id: `tmp-${Date.now()}`, role: "user", content: message, domain: null, createdAt: new Date().toISOString() },
        ],
      }));
      return prev;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
    onError: (err, _msg, context) => {
      if (context) queryClient.setQueryData(["chat-history"], context);
      setError(apiErrorMessage(err));
    },
  });

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, send.isPending]);

  function submit(text?: string) {
    const message = (text ?? input).trim();
    if (!message || send.isPending) return;
    setError("");
    setInput("");
    send.mutate(message);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-10.5rem)] min-h-[460px] max-w-5xl flex-col overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-2xl shadow-2xl">
      
      {/* Chat Header */}
      <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10">
            <Sparkles size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-base font-bold text-black dark:text-white sm:text-lg">Ask AI Mentor</h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Multi-domain CS mentor & learning strategist</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              className="btn-secondary !py-1 !px-3 text-xs inline-flex items-center gap-1.5"
              onClick={() => api.delete("/chat/history").then(() => queryClient.invalidateQueries({ queryKey: ["chat-history"] }))}
            >
              <Trash2 size={13} />
              Clear History
            </button>
          )}
        </div>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && !send.isPending && (
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <div className="mb-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80 p-6 sm:p-8 shadow-2xl max-w-lg">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border border-black/20 dark:border-white/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={22} strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-black dark:text-white mb-2">How can I mentor your learning today?</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                Ask about algorithms, system design, debugging code, study strategies, or platform features.
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-black/50 dark:hover:border-white/50 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all text-left inline-flex items-center gap-1.5"
                  >
                    <Lightbulb size={13} className="shrink-0 text-neutral-700/80 dark:text-neutral-300/80" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={reduce ? {} : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    m.role === "user"
                      ? "bg-black dark:bg-white text-white dark:text-black rounded-br-none"
                      : "bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.role === "assistant" && m.domain && (
                    <div className="mt-2 inline-flex rounded-full bg-white dark:bg-neutral-950 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                      Tag: {m.domain}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {send.isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {error && <p className="border-t border-black/30 dark:border-white/30 bg-black/5 dark:bg-white/5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 font-semibold">{error}</p>}

      {/* Input Composer */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/90 dark:bg-neutral-900/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 shadow-inner">
          <div className="flex items-end gap-2">
            <textarea
              className="max-h-36 min-h-[48px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              placeholder="Ask your AI mentor anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              maxLength={2000}
            />
            <button
              className="btn-primary !p-2.5 !rounded-xl text-sm"
              disabled={!input.trim() || send.isPending}
              onClick={() => submit()}
              aria-label="Send message"
            >
              <Send size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
