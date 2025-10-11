import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
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

  const { db } = await connectMongo();
  const id = req.query.id as string;
  console.log("req.method is: ", req.method);

  switch (req.method) {
    case "GET":
      const note = await db
        .collection("new-coll")
        .findOne({ _id: new ObjectId(id) });
      return res.json(note);

    case "PUT":
      const { title, content } = req.body;
      await db
        .collection("new-coll")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, content, updatedAt: new Date() } }
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

    case "DELETE":
      console.log("case DELETE");
      try {
        await db.collection("new-coll").deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error("Error deleting note:", err);
        return res.status(500).json({ error: "Failed to delete note" });
      }

    default:
      return res.status(405).end();
  }
}
