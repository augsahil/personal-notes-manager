import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import { verifyToken } from "../../../lib/auth";
import { ObjectId } from "mongodb";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(204).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  // Verify authentication for all routes
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  const userId = new ObjectId(decoded.userId);
  const { db } = await connectMongo();
  const id = req.query.id as string;
  console.log("req.method is: ", req.method);

  switch (req.method) {
    case "GET":
      try {
        // Verify the note belongs to the logged-in user
        const note = await db
          .collection("new-coll")
          .findOne({ _id: new ObjectId(id), userId });

        if (!note) {
          return res
            .status(404)
            .json({ message: "Note not found or access denied" });
        }

        return res.json(note);
      } catch (err) {
        console.error("GET note error:", err);
        return res.status(500).json({ message: "Error fetching note" });
      }

    case "PUT":
      try {
        const { title, content } = req.body;

        // Validate input
        if (!title || typeof title !== "string" || title.trim().length === 0) {
          return res.status(400).json({ message: "Title is required" });
        }
        if (
          !content ||
          typeof content !== "string" ||
          content.trim().length === 0
        ) {
          return res.status(400).json({ message: "Content is required" });
        }

        // First verify the note belongs to the user
        const existingNote = await db
          .collection("new-coll")
          .findOne({ _id: new ObjectId(id), userId });

        if (!existingNote) {
          return res
            .status(404)
            .json({ message: "Note not found or access denied" });
        }

        // Update the note
        await db
          .collection("new-coll")
          .updateOne(
            { _id: new ObjectId(id), userId },
            {
              $set: {
                title: title.trim(),
                content: content.trim(),
                updatedAt: new Date(),
              },
            }
          );

        // Trigger analytics microservice
        try {
          await axios.post(
            `${
              process.env.ANALYTICS_URL || "http://localhost:8000"
            }/analytics/note`,
            { note_id: id }
          );
        } catch (err) {
          console.error("Analytics error", err);
        }

        return res.json({ message: "Updated" });
      } catch (err) {
        console.error("PUT note error:", err);
        return res.status(500).json({ message: "Error updating note" });
      }

    case "DELETE":
      console.log("case DELETE");
      try {
        // First verify the note belongs to the user
        const existingNote = await db
          .collection("new-coll")
          .findOne({ _id: new ObjectId(id), userId });

        if (!existingNote) {
          return res
            .status(404)
            .json({ message: "Note not found or access denied" });
        }

        // Delete the note
        await db
          .collection("new-coll")
          .deleteOne({ _id: new ObjectId(id), userId });
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error("Error deleting note:", err);
        return res.status(500).json({ error: "Failed to delete note" });
      }

    default:
      return res.status(405).end();
  }
}
