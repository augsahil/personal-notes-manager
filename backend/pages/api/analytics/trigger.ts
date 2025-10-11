import { NextApiRequest, NextApiResponse } from "next";
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

  const { note_id } = req.body;

  try {
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
