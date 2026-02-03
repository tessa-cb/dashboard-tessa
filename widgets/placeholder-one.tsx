import { useEffect } from "react";

export function PlaceholderOne({
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
        Widget One
      </h3>
      <p className="text-muted-foreground">
        This is a placeholder widget to demonstrate the registry.
      </p>
    </div>
  );
}
