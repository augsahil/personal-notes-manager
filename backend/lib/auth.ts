import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { connectMongo } from "./mongo";

export interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

export async function verifyToken(
  req: NextApiRequest
): Promise<DecodedToken | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    // Check revoked tokens
    const { db } = await connectMongo();
    const revoked = await db.collection("revoked_tokens").findOne({ token });
    if (revoked) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
