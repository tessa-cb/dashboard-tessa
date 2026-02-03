import { useEffect } from "react";

export function PlaceholderTwo({
  refreshKey,
  onRefreshed,
}: {
  refreshKey: number;
  onRefreshed?: (refreshKey: number) => void;
}) {
  useEffect(() => {
    onRefreshed?.(refreshKey);
  }, [onRefreshed, refreshKey]);
  return (
    <div className="p-4 compact:p-3 h-full">
      <h3 className="font-semibold text-lg mb-2 text-foreground">
        Widget Two
      </h3>
      <p className="text-muted-foreground">
        Another placeholder widget with different content.
      </p>
      <div className="mt-4 h-20 bg-surface-2 rounded-lg border border-border flex items-center justify-center text-muted-foreground">
        Chart Area
      </div>
    </div>
  );
}
