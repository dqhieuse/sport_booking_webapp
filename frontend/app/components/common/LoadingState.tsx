export function LoadingState({ label = "Đang tải dữ liệu" }: { label?: string }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="h-64 animate-pulse rounded-[14px] border border-border bg-secondary"
          key={index}
        />
      ))}
    </div>
  );
}
