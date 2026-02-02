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
    <div className="p-4 border rounded-lg bg-white shadow-sm h-full">
      <h3 className="font-semibold text-lg mb-2">Widget One</h3>
      <p className="text-gray-500">
        This is a placeholder widget to demonstrate the registry.
      </p>
    </div>
  );
}
