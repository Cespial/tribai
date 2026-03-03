"use client";

interface ChatQuerySuggestionsProps {
  queries: string[];
}

export function ChatQuerySuggestions({ queries }: ChatQuerySuggestionsProps) {
  const handleQueryClick = (query: string) => {
    window.dispatchEvent(
      new CustomEvent("superapp:chat-query", { detail: { query } })
    );
  };

  return (
    <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
      {queries.map((query) => (
        <button
          key={query}
          onClick={() => handleQueryClick(query)}
          className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition hover:border-tribai-blue/30 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
