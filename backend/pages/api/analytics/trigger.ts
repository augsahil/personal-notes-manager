import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();
  const { note_id } = req.body;
  try {
    const resp = await axios.post(
      `${process.env.ANALYTICS_URL || "http://localhost:5000"}/analytics/note`,
      { note_id }
    );
    res.json(resp.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to trigger analytics" });
  }
}
