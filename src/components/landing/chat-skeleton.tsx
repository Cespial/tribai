export function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-tribai-navy px-4 py-3">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-white/10" />
      </div>

      <div className="flex-1 space-y-4 overflow-hidden p-4">
        <div className="h-16 w-[82%] animate-pulse rounded-lg bg-muted" />
        <div className="ml-auto h-12 w-[65%] animate-pulse rounded-lg bg-muted" />
        <div className="h-20 w-[88%] animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="border-t border-border p-4">
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
