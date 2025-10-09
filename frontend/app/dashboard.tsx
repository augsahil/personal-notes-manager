import { useEffect, useState } from "react";
import axios from "../lib/api";

interface Note {
  _id: string;
  title: string;
  content: string;
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    async function fetchNotes() {
      const res = await axios.get("/notes");
      setNotes(res.data);
    }
    fetchNotes();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {notes.map((note) => (
        <div key={note._id} className="border p-4 mt-2 rounded">
          <h2 className="font-semibold">{note.title}</h2>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}
