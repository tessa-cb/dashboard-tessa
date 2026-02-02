import { EventEmitter } from "events";

declare global {
  var activityEvents: EventEmitter | undefined;
}

export const events = globalThis.activityEvents || new EventEmitter();

// Increase limit to avoid warnings with multiple clients
events.setMaxListeners(50);

if (process.env.NODE_ENV !== "production") globalThis.activityEvents = events;

export const CHANNELS = {
  ACTIVITY: "activity",
  COMMENT: "comment",
  NOTIFICATION: "notification",
};
