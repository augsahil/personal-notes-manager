"use client";

import React from "react";

export type NoteAnalytics = {
  word_count?: number;
  reading_time?: number;
  sentiment?: number; // -1..1
  keywords?: string[];
};

export type Note = {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  analytics?: NoteAnalytics;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  note: Note;
  showAnalytics?: boolean;
  /**
   * Optional handlers — parent can pass these to implement edit/delete/analytics flows.
   * If not provided, the buttons will be hidden.
   */
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTriggerAnalytics?: (id: string) => void;
};

function sentimentEmoji(score?: number) {
  if (score == null) return "🤔";
  if (score > 0.35) return "😁";
  if (score > 0.1) return "🙂";
  if (score > -0.1) return "😐";
  if (score > -0.35) return "😕";
  return "😠";
}

function excerpt(text: string, max = 220) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

export default function NoteCard({
  note,
  showAnalytics = true,
  onEdit,
  onDelete,
  onTriggerAnalytics,
}: Props) {
  const { _id, title, content, tags, analytics } = note;

  return (
    <article className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {title || "Untitled"}
          </h3>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
            {excerpt(content)}
          </p>

          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <time className="text-xs text-gray-400">
            {note.updatedAt
              ? new Date(note.updatedAt).toLocaleDateString()
              : ""}
          </time>

          <div className="flex flex-col items-end gap-2">
            {(onEdit || onDelete || onTriggerAnalytics) && (
              <div className="flex gap-2">
                {onTriggerAnalytics && (
                  <button
                    onClick={() => onTriggerAnalytics(_id)}
                    className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
                    title="Run analytics for this note"
                  >
                    🔎 Analyze
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(_id)}
                    className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(_id)}
                    className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}

            {/* Small chevron / visual handle */}
            <div className="text-gray-300 text-xs">⋮</div>
          </div>
        </div>
      </div>

      {showAnalytics && analytics && (
        <footer className="mt-4 border-t pt-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium">Words:</span>
              <span className="text-sm text-gray-600">
                {analytics.word_count ?? "-"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Read:</span>
              <span className="text-sm text-gray-600">
                {analytics.reading_time ?? "-"} min
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Mood:</span>
              <span className="text-sm">
                {sentimentEmoji(analytics.sentiment)}
              </span>
              <span className="text-xs text-gray-500">
                {analytics.sentiment != null &&
                typeof analytics.sentiment === "number"
                  ? analytics.sentiment.toFixed(2)
                  : "-"}
              </span>
            </div>

            {analytics.keywords && analytics.keywords.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">Keywords:</span>
                {analytics.keywords.slice(0, 5).map((k) => (
                  <span
                    key={k}
                    className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 border"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}
