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
  lastEvent: any;
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
    if (lastEvent.type === "comment_created" && lastEvent.taskId === taskId) {
      setComments((prev) => [...prev, lastEvent.comment]);
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
      <div className="w-[500px] bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="mb-6 space-y-2">
            <div className="text-sm text-gray-500">
              Status:{" "}
              <span className="font-medium text-black capitalize">
                {task.status.replace("_", " ")}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Assignee:{" "}
              <span className="font-medium text-black">
                {task.agent?.name || "Unassigned"}
              </span>
            </div>
            {task.priority && (
              <div className="text-sm text-gray-500">
                Priority:{" "}
                <span className="font-medium text-black capitalize">
                  {task.priority}
                </span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-lg mb-4">Comments</h3>
          <div className="space-y-4 mb-6">
            {comments.length === 0 && (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            )}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 p-3 rounded border border-gray-100"
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-gray-700">
                    {comment.agent?.name || "User"}
                  </span>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="mt-4 relative pt-4 border-t">
          {showMentions && (
            <div className="absolute bottom-full left-0 bg-white border shadow-lg rounded mb-2 w-48 max-h-48 overflow-y-auto z-10">
              {agents
                .filter((a) =>
                  a.name.toLowerCase().includes(mentionQuery.toLowerCase()),
                )
                .map((a) => (
                  <div
                    key={a.id}
                    className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                    onClick={() => insertMention(a.name)}
                  >
                    {a.name}
                  </div>
                ))}
              {agents.filter((a) =>
                a.name.toLowerCase().includes(mentionQuery.toLowerCase()),
              ).length === 0 && (
                <div className="p-2 text-gray-400 text-sm">No agents found</div>
              )}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm w-full hover:bg-blue-700 transition-colors"
            onClick={handlePostComment}
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
