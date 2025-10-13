import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(204).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  console.log("req.method here is:", req.method);

  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, email, password } = req.body;
    const { db } = await connectMongo();

    const existing = await db.collection("users").findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await db
      .collection("users")
      .insertOne({ name, email, password_hash: hash, createdAt: new Date() });

    return res.status(201).json({ userId: result.insertedId });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
