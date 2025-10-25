"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import NoteCard, { Note } from "../../components/NoteCard";

const dummyNotes: Note[] = [
  {
    _id: "1",
    title: "Welcome to Notes Manager",
    content:
      "This is a sample note to help you get started. Create and manage your notes with smart analytics!",
    analytics: {
      word_count: 15,
      reading_time: 1,
      sentiment: 0.8,
      keywords: ["welcome", "notes", "analytics"],
    },
  },
  {
    _id: "2",
    title: "Getting Started Guide",
    content:
      "Click the + button to create a new note. Your notes will automatically be analyzed for reading time and sentiment.",
    analytics: {
      word_count: 18,
      reading_time: 1,
      sentiment: 0.6,
      keywords: ["guide", "create", "analyze"],
    },
  },
];

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>(dummyNotes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
      } catch (err) {
        console.error(err);
        setError("No notes found! Here are few sample notes:");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, []);

  // Delete note
  const handleDelete = async (id: string) => {
    await api.delete(`/notes/${id}`);
    setNotes(notes.filter((n) => n._id !== id));
  };

  // Trigger analytics
  const handleTriggerAnalytics = async (id: string) => {
    await api.post("/analytics/trigger", { note_id: id });
  };

  // Create new note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/notes", {
        title: newTitle,
        content: newContent,
      });
      setNotes([
        {
          _id: res.data.noteId,
          title: newTitle,
          content: newContent,
          analytics: undefined,
        } as Note,
        ...notes,
      ]);
      setNewTitle("");
      setNewContent("");
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create note", err);
      alert("Error creating note");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (id: string, title: string, content: string) => {
    await api.put(`/notes/${id}`, { title, content });
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, title, content } : n))
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Loading notes...</h2>
        <div className="animate-pulse space-y-4 grid sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border p-4 rounded bg-gray-50">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Your Notes</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow"
        >
          {isCreating ? "Cancel" : "+ Create Note"}
        </button>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateNote}
          className="bg-white shadow p-6 rounded-xl space-y-4"
        >
          <h3 className="text-xl font-semibold text-black">Create new Note</h3>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <textarea
            placeholder="Write your note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full border rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg"
          >
            {creating ? "Saving..." : "Add Note"}
          </button>
        </form>
      )}

      {error && <p className="text-indigo-600">{error}</p>}

      {/* Notes List */}
      <div className="grid sm:grid-cols-2 gap-6">
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onEdit={handleEdit}
            onDelete={() => handleDelete(note._id)}
            onTriggerAnalytics={() => handleTriggerAnalytics(note._id)}
          />
        ))}
      </div>
    </div>
  );
}
