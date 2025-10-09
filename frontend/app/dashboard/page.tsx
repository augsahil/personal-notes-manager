"use client";

import { useEffect, useState } from "react";
import axios from "../../lib/api"; // Using configured axios instance

interface Note {
  _id: string;
  title: string;
  content: string;
  analytics?: {
    word_count: number;
    reading_time: number;
    sentiment: number;
    keywords: string[];
  };
}

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
        const res = await axios.get("/notes");
        if (res.data && res.data.length > 0) {
          setNotes(res.data);
        }
        setError("");
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setError("Failed to load notes. Showing example notes instead.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, []);

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
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Your Notes</h2>
      {error && <p className="text-amber-600 mb-4">{error}</p>}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {note.title}
            </h3>
            <p className="text-gray-600 mb-3">{note.content}</p>
            {note.analytics && (
              <div className="text-sm text-gray-500 flex flex-wrap gap-4 pt-2 border-t">
                <span>📝 {note.analytics.word_count} words</span>
                <span>⏱️ {note.analytics.reading_time} min read</span>
                <span>
                  {note.analytics.sentiment > 0
                    ? "😊"
                    : note.analytics.sentiment < 0
                    ? "😟"
                    : "😐"}{" "}
                  Sentiment: {note.analytics.sentiment.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
