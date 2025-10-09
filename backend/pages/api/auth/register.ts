import { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongo";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, email, password } = req.body;
  const { db } = await connectMongo();

  const existing = await db.collection("users").findOne({ email });
  if (existing) return res.status(400).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const result = await db
    .collection("users")
    .insertOne({ name, email, password_hash: hash, createdAt: new Date() });
  res.status(201).json({ userId: result.insertedId });
}
