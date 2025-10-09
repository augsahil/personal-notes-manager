import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import { ObjectId } from "mongodb";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectMongo();
  const id = req.query.id as string;

  switch (req.method) {
    case "GET":
      const note = await db
        .collection("notes")
        .findOne({ _id: new ObjectId(id) });
      return res.json(note);

    case "PUT":
      const { title, content } = req.body;
      await db
        .collection("notes")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, content, updatedAt: new Date() } }
        );

      // Trigger analytics microservice
      try {
        await axios.post(
          `${
            process.env.ANALYTICS_URL || "http://localhost:5000"
          }/analytics/note`,
          { note_id: id }
        );
      } catch (err) {
        console.error("Analytics error", err);
      }

      return res.json({ message: "Updated" });

    case "DELETE":
      await db.collection("notes").deleteOne({ _id: new ObjectId(id) });
      return res.json({ message: "Deleted" });

    default:
      return res.status(405).end();
  }
}
