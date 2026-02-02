import { events, CHANNELS } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      const onActivity = (data: any) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (e) {
          console.error("SSE Error:", e);
          controller.close();
        }
      };

      // Subscribe
      events.on(CHANNELS.ACTIVITY, onActivity);
      events.on(CHANNELS.COMMENT, onActivity);
      events.on(CHANNELS.NOTIFICATION, onActivity);

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: {"type":"connected"}\n\n`));

      // Heartbeat to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch (e) {
          clearInterval(interval);
          events.off(CHANNELS.ACTIVITY, onActivity);
          events.off(CHANNELS.COMMENT, onActivity);
          events.off(CHANNELS.NOTIFICATION, onActivity);
        }
      }, 15000);

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        events.off(CHANNELS.ACTIVITY, onActivity);
        events.off(CHANNELS.COMMENT, onActivity);
        events.off(CHANNELS.NOTIFICATION, onActivity);
        clearInterval(interval);
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
