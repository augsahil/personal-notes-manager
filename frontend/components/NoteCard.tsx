"use client";
import { useState } from "react";
import { Edit2, Trash2, BarChart2, Save, X } from "lucide-react";

export type NoteAnalytics = {
  word_count?: number;
  reading_time?: number;
  sentiment?: number;
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
  onEdit?: (id: string, title: string, content: string) => void;
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

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onEdit) return;
    setSaving(true);
    try {
      await onEdit(_id, editTitle, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-lg text-black font-semibold border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border p-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
              />
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800">
                {title || "Untitled"}
              </h3>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {excerpt(content)}
              </p>
            </>
          )}

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
            {(onEdit || onDelete || onTriggerAnalytics) && !isEditing && (
              <div className="flex gap-2">
                {onTriggerAnalytics && (
                  <button
                    onClick={() => onTriggerAnalytics(_id)}
                    className="text-purple-600 hover:text-purple-800"
                    title="Run analytics"
                  >
                    <BarChart2 className="w-5 h-5" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(_id)}
                    className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white flex items-center gap-1 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditTitle(title);
                    setEditContent(content);
                    setIsEditing(false);
                  }}
                  className="text-xs px-3 py-1 rounded-md bg-red-600 text-white flex items-center gap-1 hover:bg-red-700"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}

            <div className="text-gray-300 text-xs">⋮</div>
          </div>
        </div>
      </div>

      {showAnalytics && analytics && !isEditing && (
        <footer className="mt-4 border-t pt-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium">Words:</span>
              <span>{analytics.word_count ?? "-"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Read:</span>
              <span>{analytics.reading_time ?? "-"} min</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Mood:</span>
              <span>{sentimentEmoji(analytics.sentiment)}</span>
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
