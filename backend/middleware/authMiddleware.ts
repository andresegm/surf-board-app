import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "4056b53b9a0591b37798e713021f362c7358177ffa1dfcf84a37163fb0c9f9ff";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded; // Attach user info to request
        next(); // Move to next middleware
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};
