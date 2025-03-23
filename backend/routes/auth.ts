import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/authMiddleware";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "4056b53b9a0591b37798e713021f362c7358177ffa1dfcf84a37163fb0c9f9ff";

// User Login with HTTP-Only Cookies
router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rowCount === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevents client-side JS access
            secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS only)
            sameSite: "strict", // Prevents CSRF attacks
            maxAge: 3600000, // 1 hour expiration
        });

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Failed to log in" });
    }
});

router.post("/logout", async (req: Request, res: Response) => {
    try {
        // Clear the cookie by setting an empty value and immediate expiration
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0), // Set expiration to the past
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.json({ message: "Logout successful" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Failed to log out" });
    }
});

router.post("/register", async (req: Request, res: Response) => {
    const { name, email, password, role = "user" } = req.body;

    try {
        // Check if user already exists
        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rowCount && existing.rowCount > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role`,
            [name, email, hashedPassword, role]
        );

        const user = result.rows[0];

        // Create JWT and set cookie
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000,
        });

        res.status(201).json({ message: "Registration successful", user });

    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Failed to register user" });
    }
});


router.get("/me", authenticateToken, async (req: Request, res: Response) => {
    const user = (req as any).user; // Extract user from JWT

    try {
        //Fetch full user details from the database
        const userData = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [user.id]);

        if (userData.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: userData.rows[0] });
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});

export default router;
