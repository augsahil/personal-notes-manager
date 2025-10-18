import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import { verifyToken } from "../../../lib/auth";
import { ObjectId } from "mongodb";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectMongo();

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
    res.status(204).end();
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Verify authentication for all routes
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  const userId = new ObjectId(decoded.userId);

  switch (req.method) {
    case "GET":
      try {
        // Filter notes by userId - only return the logged-in user's notes
        const notes = await db
          .collection("new-coll")
          .find({ userId })
          .toArray();
        res.status(200).json(notes);
      } catch (err) {
        console.error("GET notes error:", err);
        res.status(500).json({ message: "Error fetching notes" });
      }
      break;

    case "POST":
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

        // Add userId to the note when creating it
        const result = await db.collection("new-coll").insertOne({
          userId,
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Trigger analytics microservice
        try {
          await axios.post(
            `${
              process.env.ANALYTICS_URL || "http://localhost:8000"
            }/analytics/note`,
            { note_id: result.insertedId }
          );
        } catch (err) {
          console.error("Analytics error:", err);
        }

        res.status(201).json({ noteId: result.insertedId });
      } catch (err) {
        console.error("POST notes error:", err);
        res.status(500).json({ message: "Error adding note" });
      }
      break;

    default:
      res.status(405).end();
      break;
  }
}
