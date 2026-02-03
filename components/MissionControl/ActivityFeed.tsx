"use client";
import { Activity } from "@/hooks/useMissionControl";

export default function ActivityFeed({
  activities,
}: {
  activities: Activity[];
}) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-4 compact:p-3 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-foreground compact:mb-3">
        Activity Feed
      </h2>
      <div className="flex-1 overflow-y-auto space-y-3 compact:space-y-2 max-h-[600px]">
        {activities.map((activity, idx) => (
          <div
            key={activity.id ?? `${activity.type}-${activity.createdAt}-${idx}`}
            className="text-sm border-b border-border pb-2"
          >
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="uppercase font-semibold text-primary">
                {activity.type}
              </span>
              <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="text-foreground">{activity.message}</div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-muted-foreground text-sm">No activity yet.</div>
        )}
      </div>
    </div>
  );
}
