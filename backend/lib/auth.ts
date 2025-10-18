import jwt from "jsonwebtoken";
import { NextApiRequest } from "next";

export interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(req: NextApiRequest): DecodedToken | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
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
