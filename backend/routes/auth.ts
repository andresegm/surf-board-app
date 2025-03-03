import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "4056b53b9a0591b37798e713021f362c7358177ffa1dfcf84a37163fb0c9f9ff";

// User Registration
router.post("/signup", async (req: Request, res: Response) => {
    const { name, email, password, role = "user" } = req.body; // Default to "user"

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userExists?.rowCount && userExists.rowCount > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
            [name, email, hashedPassword, role] // Added role field
        );

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// User Login
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

        // Send token and user details
        res.json({
            message: "Login successful",
            token,
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

export default router;
