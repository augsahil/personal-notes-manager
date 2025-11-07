import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(204).end();
  }
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  if (req.method !== "GET") return res.status(405).end();

  const decoded = await verifyToken(req);
  if (!decoded) return res.status(401).json({ valid: false });
  return res.status(200).json({ valid: true, userId: decoded.userId });
}
