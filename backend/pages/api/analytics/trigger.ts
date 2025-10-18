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

  if (req.method !== "POST") return res.status(405).end();

  // Verify authentication
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  const userId = new ObjectId(decoded.userId);
  const { note_id } = req.body;

  try {
    // Verify the note belongs to the user
    const { db } = await connectMongo();
    const note = await db
      .collection("new-coll")
      .findOne({ _id: new ObjectId(note_id), userId });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    const resp = await axios.post(
      `${process.env.ANALYTICS_URL || "http://localhost:8000"}/analytics/note`,
      { note_id }
    );

    return res.json(resp.data);
  } catch (err) {
    console.error("Error triggering analytics:", err);
    return res.status(500).json({ message: "Failed to trigger analytics" });
  }
}
