import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectMongo();

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
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

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  switch (req.method) {
    case "GET":
      try {
        const notes = await db.collection("new-coll").find({}).toArray();
        res.status(200).json(notes); // ✅ no return here
      } catch (err) {
        console.error("GET notes error:", err);
        res.status(500).json({ message: "Error fetching notes" });
      }
      break;

    case "POST":
      try {
        const { title, content } = req.body;
        const result = await db.collection("new-coll").insertOne({
          title,
          content,
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
