"use client";
import { Activity } from "@/hooks/useMissionControl";

export default function ActivityFeed({
  activities,
}: {
  activities: Activity[];
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px]">
        {activities.map((activity, idx) => (
          <div
            key={activity.id ?? `${activity.type}-${activity.createdAt}-${idx}`}
            className="text-sm border-b pb-2"
          >
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="uppercase font-bold text-blue-600">
                {activity.type}
              </span>
              <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="text-gray-800">{activity.message}</div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-gray-400 text-sm">No activity yet.</div>
        )}
      </div>
    </div>
  );
}
