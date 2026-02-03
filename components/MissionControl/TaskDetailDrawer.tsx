"use client";
import { useState, useEffect, useRef } from "react";
import { Task, Agent } from "@/hooks/useMissionControl";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  agent?: Agent;
  isSystem: boolean;
};

export default function TaskDetailDrawer({
  taskId,
  onClose,
  agents,
  lastEvent,
}: {
  taskId: string;
  onClose: () => void;
  agents: Agent[];
  lastEvent: unknown;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch data
  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then(setTask);
    fetch(`/api/tasks/${taskId}/comments`)
      .then((res) => res.json())
      .then(setComments);
  }, [taskId]);

  // Listen to events
  useEffect(() => {
    if (!lastEvent) return;

    const evt = lastEvent as {
      type?: string;
      taskId?: string;
      comment?: Comment;
    };

    if (evt.type === "comment_created" && evt.taskId === taskId && evt.comment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComments((prev) => [...prev, evt.comment as Comment]);
    }
  }, [lastEvent, taskId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment("");
  };

  // Simple Mention Logic
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);

    // Check for @
    const words = val.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord && lastWord.startsWith("@")) {
      setMentionQuery(lastWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (agentName: string) => {
    const words = newComment.split(" ");
    words.pop();
    words.push(`@${agentName} `);
    setNewComment(words.join(" "));
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity">
      <div className="w-[500px] bg-surface h-full shadow-2xl border-l border-border p-6 compact:p-4 flex flex-col animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="mb-6 space-y-2">
            <div className="text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-medium text-foreground capitalize">
                {task.status.replace("_", " ")}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Assignee:{" "}
              <span className="font-medium text-foreground">
                {task.agent?.name || "Unassigned"}
              </span>
            </div>
            {task.priority && (
              <div className="text-sm text-muted-foreground">
                Priority:{" "}
                <span className="font-medium text-foreground capitalize">
                  {task.priority}
                </span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-lg mb-4 text-foreground">
            Comments
          </h3>
          <div className="space-y-4 mb-6">
            {comments.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No comments yet.
              </p>
            )}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-surface-2 p-3 rounded-lg border border-border"
              >
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">
                    {comment.agent?.name || "User"}
                  </span>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="mt-4 relative pt-4 border-t border-border">
          {showMentions && (
            <div className="absolute bottom-full left-0 bg-surface border border-border shadow-lg rounded-lg mb-2 w-48 max-h-48 overflow-y-auto z-10">
              {agents
                .filter((a) =>
                  a.name.toLowerCase().includes(mentionQuery.toLowerCase()),
                )
                .map((a) => (
                  <div
                    key={a.id}
                    className="p-2 hover:bg-muted cursor-pointer text-sm text-foreground"
                    onClick={() => insertMention(a.name)}
                  >
                    {a.name}
                  </div>
                ))}
              {agents.filter((a) =>
                a.name.toLowerCase().includes(mentionQuery.toLowerCase()),
              ).length === 0 && (
                <div className="p-2 text-muted-foreground text-sm">
                  No agents found
                </div>
              )}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="w-full border border-border rounded-lg p-2 text-sm bg-surface text-foreground focus:ring-2 focus:ring-ring/40 outline-none"
            rows={3}
            placeholder="Write a comment... use @Name to notify agents"
            value={newComment}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePostComment();
              }
            }}
          />
          <button
            className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm w-full hover:brightness-110 transition-colors"
            onClick={handlePostComment}
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
