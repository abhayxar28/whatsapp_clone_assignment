import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types";
import { JwtPayload, verify } from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: No token provided or invalid format"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.userId = decoded.id;
    req.wa_id = decoded.wa_id;

    next();
  } catch (e) {
    res.status(403).json({
      message: "Invalid or expired token"
    });
  }
};
