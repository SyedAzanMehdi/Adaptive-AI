import { useMemo, useState } from "react";
import { Search, Library, ArrowRight, Shuffle, X } from "lucide-react";
import { TECH_DICTIONARY, CONFUSING_TECH_PAIRS, searchTechDictionary } from "../../data/techDictionary";

export default function TechDictionary() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(TECH_DICTIONARY[0].id);
  const [showConfusing, setShowConfusing] = useState(false);

  const searchResults = useMemo(() => searchTechDictionary(query), [query]);
  const isSearching = query.trim().length > 0;
  const activeCategoryData = TECH_DICTIONARY.find((c) => c.id === activeCategory) ?? TECH_DICTIONARY[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-lg">
            <Library size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white">Tech Term Dictionary</h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {TECH_DICTIONARY.reduce((n, c) => n + c.terms.length, 0)}+ terms across {TECH_DICTIONARY.length} categories — plus the pairs everyone mixes up.
            </p>
          </div>
        </div>
        <button
          className={`btn-secondary text-xs inline-flex items-center gap-1.5 shrink-0 ${showConfusing ? "!bg-black dark:!bg-white !text-white dark:!text-black" : ""}`}
          onClick={() => setShowConfusing((v) => !v)}
        >
          <Shuffle size={14} strokeWidth={2.2} />
          Confusing Terms, Side-by-Side
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          className="input !pl-11 !pr-10"
          placeholder="Search any term — e.g. API, recession, Docker..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showConfusing && (
        <div className="card border-black/30 dark:border-white/30 space-y-3">
          <h2 className="font-bold text-black dark:text-white text-sm flex items-center gap-2">
            <Shuffle size={15} strokeWidth={2.4} />
            Confusing Tech Terms — Side-by-Side
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONFUSING_TECH_PAIRS.map((p) => (
              <div
                key={`${p.a}-${p.b}`}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 p-4"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold text-black dark:text-white">{p.a}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 bg-neutral-200 dark:bg-neutral-800 rounded-full px-2 py-0.5">
                    vs
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">{p.b}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{p.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSearching ? (
        <div className="space-y-3">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
            {searchResults.length} match{searchResults.length === 1 ? "" : "es"} for "{query}"
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.map(({ category, term }) => (
              <div
                key={`${category.id}-${term.term}`}
                className="card border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-sm text-black dark:text-white">{term.term}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-2 py-0.5 shrink-0">
                    {category.title}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{term.definition}</p>
              </div>
            ))}
            {searchResults.length === 0 && (
              <p className="text-xs text-neutral-500 col-span-full py-8 text-center">No terms matched. Try a shorter query.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5">
          {/* Category rail */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1">
            {TECH_DICTIONARY.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap lg:whitespace-normal ${
                  c.id === activeCategory
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                    : "bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                {c.title}
              </button>
            ))}
          </nav>

          {/* Active category */}
          <div className="space-y-4 min-w-0">
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">{activeCategoryData.title}</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">{activeCategoryData.blurb}</p>
            </div>

            {activeCategoryData.chain && (
              <div className="card border-black/30 dark:border-white/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  The chain, explained for IT students
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {activeCategoryData.chain.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {step}
                      </span>
                      {i < activeCategoryData.chain!.length - 1 && (
                        <ArrowRight size={14} className="text-neutral-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
                  The practical takeaway: when hiring tightens, the gap between candidates with specific,
                  demonstrable skills and everyone else widens — the Lessons, Practice, and Dojo on this platform
                  exist specifically to close that gap.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {activeCategoryData.terms.map((t) => (
                <div
                  key={t.term}
                  className="card border-neutral-200 dark:border-neutral-800 hover:border-black/30 dark:hover:border-white/30 transition-colors"
                >
                  <h3 className="font-bold text-sm text-black dark:text-white mb-1.5">{t.term}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{t.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
