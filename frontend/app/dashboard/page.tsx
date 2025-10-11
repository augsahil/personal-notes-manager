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

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch notes");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/notes/${id}`);
    setNotes(notes.filter((n) => n._id !== id));
  };

  const handleTriggerAnalytics = async (id: string) => {
    await api.post("/analytics/trigger", { note_id: id });
    // Optionally refetch notes to get updated analytics
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Loading notes...</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
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
    <div className="p-8 space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onDelete={() => handleDelete(note._id)}
          onTriggerAnalytics={() => handleTriggerAnalytics(note._id)}
        />
      ))}
    </div>
  );
}
