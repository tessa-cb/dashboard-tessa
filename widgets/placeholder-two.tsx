export function PlaceholderTwo({ refreshKey }: { refreshKey: number }) {
  void refreshKey;
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm h-full">
      <h3 className="font-semibold text-lg mb-2">Widget Two</h3>
      <p className="text-gray-500">
        Another placeholder widget with different content.
      </p>
      <div className="mt-4 h-20 bg-blue-50 rounded flex items-center justify-center text-blue-400">
        Chart Area
      </div>
    </div>
  );
}
