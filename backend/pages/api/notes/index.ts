import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectMongo();

  switch (req.method) {
    case "GET":
      const notes = await db.collection("new-coll").find({}).toArray();
      return res.json(notes);

    case "POST":
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
        console.error("Analytics error", err);
      }

      return res.status(201).json({ noteId: result.insertedId });
    default:
      return res.status(405).end();
  }
}
