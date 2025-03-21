import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret_key";

// Extend Request type to include `user`
interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; role: string };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token; // Read JWT from cookies

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded as { id: number; email: string; role: string }; // Assign decoded token
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};