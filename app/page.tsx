import { widgetRegistry } from "@/config/widget-registry";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome to your dashboard.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgetRegistry.map((widget) => {
            const Component = widget.component;
            return (
              <div key={widget.id} className="min-h-[200px]">
                <Component />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
